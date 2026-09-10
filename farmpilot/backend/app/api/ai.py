from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.database.database import get_db
from app.models.user import User
from app.auth.security import get_current_user
from app.services.ai_service import generate_farm_insights

router = APIRouter()

class AIInsightsRequest(BaseModel):
    farm_id: Optional[int] = None

class AIInsightsResponse(BaseModel):
    farm_summary: str
    crop_progress: str
    expense_insight: str
    task_insight: str
    irrigation_insight: str
    risk_alerts: List[str]
    recommended_actions: List[str]

@router.post("/farm-insights", response_model=AIInsightsResponse)
async def farm_insights(
    body: AIInsightsRequest = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        farm_id = body.farm_id if body else None
        insights = await generate_farm_insights(db, current_user.id, farm_id)
        return insights
    except Exception as e:
        print(f"AI endpoint error: {e}")
        raise HTTPException(
            status_code=503,
            detail="AI insights are temporarily unavailable. Please try again."
        )
