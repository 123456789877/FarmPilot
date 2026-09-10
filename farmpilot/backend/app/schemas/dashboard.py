from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DashboardStats(BaseModel):
    total_farms: int = 0
    total_fields: int = 0
    active_crops: int = 0
    pending_tasks: int = 0
    overdue_tasks: int = 0
    total_expenses: float = 0.0
    total_revenue: float = 0.0
    estimated_profit: float = 0.0
    cost_per_acre: float = 0.0
    total_area: float = 0.0
    recent_activities: List[Dict[str, Any]] = []
    expense_by_category: Dict[str, float] = {}
    expense_by_crop: Dict[str, float] = {}
    monthly_expenses: List[Dict[str, Any]] = []
    revenue_vs_expenses: List[Dict[str, Any]] = []
