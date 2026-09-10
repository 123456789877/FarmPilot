import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.farm import Farm
from app.models.field import Field
from app.models.crop_cycle import CropCycle
from app.models.activity import Activity
from app.models.task import Task
from app.models.expense import Expense
from app.models.input_item import InputItem
from app.models.irrigation import IrrigationRecord
from app.models.harvest import Harvest
from app.core.config import settings
import httpx

def collect_farm_data(db: Session, user_id: int, farm_id: int = None) -> Dict[str, Any]:
    farms_q = db.query(Farm).filter(Farm.owner_id == user_id)
    if farm_id:
        farms_q = farms_q.filter(Farm.id == farm_id)
    farms = farms_q.all()
    if not farms:
        return {}

    farm_ids = [f.id for f in farms]
    fields = db.query(Field).filter(Field.farm_id.in_(farm_ids)).all()
    field_ids = [f.id for f in fields]

    crops = db.query(CropCycle).filter(CropCycle.field_id.in_(field_ids)).all() if field_ids else []
    activities = db.query(Activity).filter(Activity.field_id.in_(field_ids)).all() if field_ids else []
    tasks = db.query(Task).filter(Task.field_id.in_(field_ids)).all() if field_ids else []
    expenses = db.query(Expense).filter(
        (Expense.farm_id.in_(farm_ids)) | (Expense.field_id.in_(field_ids))
    ).all()
    inputs = db.query(InputItem).filter(InputItem.field_id.in_(field_ids)).all() if field_ids else []
    irrigations = db.query(IrrigationRecord).filter(IrrigationRecord.field_id.in_(field_ids)).all() if field_ids else []
    harvests = db.query(Harvest).filter(Harvest.field_id.in_(field_ids)).all() if field_ids else []

    total_expenses = sum(e.amount or 0 for e in expenses)
    total_revenue = sum((h.quantity or 0) * (h.selling_price or 0) for h in harvests)

    data = {
        "farms": [{"id": f.id, "name": f.name, "location": f.location, "total_area": f.total_area,
                   "soil_type": f.soil_type, "irrigation_type": f.irrigation_type} for f in farms],
        "fields": [{"id": f.id, "name": f.name, "area": f.area, "soil_type": f.soil_type,
                    "status": f.status, "farm_id": f.farm_id} for f in fields],
        "crop_cycles": [{"id": c.id, "crop_name": c.crop_name, "variety": c.variety,
                         "current_growth_stage": c.current_growth_stage, "status": c.status,
                         "planting_date": str(c.planting_date) if c.planting_date else None,
                         "expected_harvest_date": str(c.expected_harvest_date) if c.expected_harvest_date else None,
                         "target_yield": c.target_yield, "field_id": c.field_id} for c in crops],
        "activities": [{"activity_name": a.activity_name, "date": str(a.date), "status": a.status,
                        "cost": a.cost, "field_id": a.field_id} for a in activities],
        "tasks": [{"title": t.title, "status": t.status, "priority": t.priority,
                   "due_date": str(t.due_date) if t.due_date else None} for t in tasks],
        "expenses": [{"name": e.name, "category": e.category, "amount": e.amount,
                      "date": str(e.date)} for e in expenses],
        "inputs": [{"name": i.name, "category": i.category, "quantity": i.quantity,
                    "unit": i.unit, "cost": i.cost} for i in inputs],
        "irrigation": [{"date": str(r.date), "water_quantity": r.water_quantity,
                        "method": r.irrigation_method, "cost": r.cost} for r in irrigations],
        "harvests": [{"quantity": h.quantity, "unit": h.unit, "selling_price": h.selling_price,
                      "revenue": (h.quantity or 0) * (h.selling_price or 0),
                      "harvest_date": str(h.harvest_date)} for h in harvests],
        "totals": {
            "total_expenses": total_expenses,
            "total_revenue": total_revenue,
            "profit": total_revenue - total_expenses,
        }
    }
    return data

def build_prompt(data: Dict[str, Any]) -> str:
    if not data or not data.get("farms"):
        return "INSUFFICIENT_DATA"

    prompt = f"""You are an expert agricultural advisor for Indian and global farmers. Analyze the following REAL farm data and provide practical, actionable insights.

FARM DATA (JSON):
{json.dumps(data, indent=2, default=str)}

Respond ONLY with a valid JSON object in this exact structure (no markdown, no extra text):
{{
  "farm_summary": "2-3 sentence overall summary of the farm situation",
  "crop_progress": "Insight on current crop stages and progress",
  "expense_insight": "Analysis of spending patterns, highest categories, efficiency",
  "task_insight": "Pending / overdue tasks and what needs attention",
  "irrigation_insight": "Observations on irrigation records and recommendations",
  "risk_alerts": ["list of 1-4 short risk or attention items, or empty list"],
  "recommended_actions": ["list of 3-6 concrete next actions the farmer should take"]
}}

Rules:
- Base everything strictly on the provided data. Do not invent numbers or crops.
- If data is sparse, say so clearly in the summary.
- Be practical and farmer-friendly.
- Use simple language.
"""
    return prompt

async def call_gemini(prompt: str) -> Dict[str, Any]:
    if not settings.GEMINI_API_KEY:
        return _fallback_insights(prompt)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 1024}
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            result = resp.json()
            text = result["candidates"][0]["content"]["parts"][0]["text"]
            # clean markdown if present
            text = text.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text)
    except Exception as e:
        print(f"Gemini error: {e}")
        return _fallback_insights(prompt)

def _fallback_insights(prompt: str) -> Dict[str, Any]:
    """Rule-based fallback when no API key or API fails."""
    if "INSUFFICIENT_DATA" in prompt:
        return {
            "farm_summary": "Insufficient farm data to provide a reliable recommendation. Please add farms, fields, crops and some activities first.",
            "crop_progress": "No active crop cycles found.",
            "expense_insight": "No expense records available yet.",
            "task_insight": "No tasks recorded.",
            "irrigation_insight": "No irrigation records found.",
            "risk_alerts": ["Add basic farm and crop data to unlock AI insights."],
            "recommended_actions": [
                "Create at least one farm and one field",
                "Start a crop cycle for a field",
                "Record a few activities and expenses",
                "Then request AI insights again"
            ]
        }
    return {
        "farm_summary": "Your farm data has been analyzed using available records. Key operational and financial metrics are present.",
        "crop_progress": "Review the current growth stages of your active crops and update them regularly for better tracking.",
        "expense_insight": "Track expenses by category to identify the largest cost centers (often fertilizers or labor).",
        "task_insight": "Complete pending high-priority tasks before they become overdue.",
        "irrigation_insight": "Maintain consistent irrigation records to optimize water use and cost.",
        "risk_alerts": ["Monitor weather before next irrigation", "Review any overdue tasks"],
        "recommended_actions": [
            "Update crop growth stages if they have changed",
            "Complete pending fertilizer or weeding activities",
            "Review fertilizer expenditure against planned budget",
            "Record any recent harvests to update profitability"
        ]
    }

async def generate_farm_insights(db: Session, user_id: int, farm_id: int = None) -> Dict[str, Any]:
    data = collect_farm_data(db, user_id, farm_id)
    prompt = build_prompt(data)
    if prompt == "INSUFFICIENT_DATA":
        return _fallback_insights(prompt)
    insights = await call_gemini(prompt)
    return insights
