from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class IrrigationBase(BaseModel):
    field_id: int
    crop_cycle_id: Optional[int] = None
    date: date
    water_quantity: Optional[float] = None
    duration: Optional[float] = None
    irrigation_method: Optional[str] = None
    cost: Optional[float] = Field(0.0, ge=0)
    notes: Optional[str] = None

class IrrigationCreate(IrrigationBase):
    pass

class IrrigationResponse(IrrigationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
