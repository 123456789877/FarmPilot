from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class ActivityBase(BaseModel):
    activity_name: str = Field(..., min_length=1)
    farm_id: Optional[int] = None
    field_id: Optional[int] = None
    crop_cycle_id: Optional[int] = None
    date: date
    cost: Optional[float] = Field(0.0, ge=0)
    quantity: Optional[float] = None
    unit: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = "Planned"

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(BaseModel):
    activity_name: Optional[str] = None
    date: Optional[date] = None
    cost: Optional[float] = Field(None, ge=0)
    quantity: Optional[float] = None
    unit: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class ActivityResponse(ActivityBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
