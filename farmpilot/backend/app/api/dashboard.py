from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from collections import defaultdict
from app.database.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.field import Field
from app.models.crop_cycle import CropCycle
from app.models.task import Task
from app.models.expense import Expense
from app.models.harvest import Harvest
from app.models.activity import Activity
from app.schemas.dashboard import DashboardStats
from app.auth.security import get_current_user

router = APIRouter()

@router.get("", response_model=DashboardStats)
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farms = db.query(Farm).filter(Farm.owner_id == current_user.id).all()
    farm_ids = [f.id for f in farms]
    total_area = sum(f.total_area or 0 for f in farms)

    fields = db.query(Field).filter(Field.farm_id.in_(farm_ids)).all() if farm_ids else []
    field_ids = [f.id for f in fields]

    active_crops = db.query(CropCycle).filter(
        CropCycle.field_id.in_(field_ids),
        CropCycle.status == "Active"
    ).count() if field_ids else 0

    tasks = db.query(Task).filter(Task.field_id.in_(field_ids)).all() if field_ids else []
    today = date.today()
    pending = 0
    overdue = 0
    for t in tasks:
        if t.status == "Completed":
            continue
        if t.due_date and t.due_date < today:
            overdue += 1
        else:
            pending += 1

    expenses = db.query(Expense).filter(
        (Expense.farm_id.in_(farm_ids)) | (Expense.field_id.in_(field_ids))
    ).all() if farm_ids else []
    total_expenses = sum(e.amount or 0 for e in expenses)

    harvests = db.query(Harvest).filter(Harvest.field_id.in_(field_ids)).all() if field_ids else []
    total_revenue = sum((h.quantity or 0) * (h.selling_price or 0) for h in harvests)

    estimated_profit = total_revenue - total_expenses
    cost_per_acre = (total_expenses / total_area) if total_area > 0 else 0.0

    # expense by category
    expense_by_category = defaultdict(float)
    for e in expenses:
        expense_by_category[e.category or "Other"] += e.amount or 0

    # expense by crop (via crop_cycle)
    expense_by_crop = defaultdict(float)
    for e in expenses:
        if e.crop_cycle_id:
            crop = db.query(CropCycle).filter(CropCycle.id == e.crop_cycle_id).first()
            if crop:
                expense_by_crop[crop.crop_name] += e.amount or 0
        else:
            expense_by_crop["Unassigned"] += e.amount or 0

    # recent activities
    activities = (
        db.query(Activity)
        .filter(Activity.field_id.in_(field_ids))
        .order_by(Activity.date.desc())
        .limit(8)
        .all()
    ) if field_ids else []
    recent_activities = [
        {
            "id": a.id,
            "activity_name": a.activity_name,
            "date": str(a.date),
            "status": a.status,
            "cost": a.cost,
        }
        for a in activities
    ]

    # monthly expenses (simple grouping)
    monthly = defaultdict(float)
    for e in expenses:
        if e.date:
            key = e.date.strftime("%Y-%m")
            monthly[key] += e.amount or 0
    monthly_expenses = [{"month": k, "amount": v} for k, v in sorted(monthly.items())]

    revenue_vs_expenses = [
        {"name": "Expenses", "value": total_expenses},
        {"name": "Revenue", "value": total_revenue},
    ]

    return DashboardStats(
        total_farms=len(farms),
        total_fields=len(fields),
        active_crops=active_crops,
        pending_tasks=pending,
        overdue_tasks=overdue,
        total_expenses=round(total_expenses, 2),
        total_revenue=round(total_revenue, 2),
        estimated_profit=round(estimated_profit, 2),
        cost_per_acre=round(cost_per_acre, 2),
        total_area=round(total_area, 2),
        recent_activities=recent_activities,
        expense_by_category=dict(expense_by_category),
        expense_by_crop=dict(expense_by_crop),
        monthly_expenses=monthly_expenses,
        revenue_vs_expenses=revenue_vs_expenses,
    )
