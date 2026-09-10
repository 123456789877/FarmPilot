from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    field_id: Optional[int] = None
    crop_cycle_id: Optional[int] = None
    due_date: Optional[date] = None
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Pending"

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[str] = None
    status: Optional[str] = None

class TaskResponse(TaskBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
