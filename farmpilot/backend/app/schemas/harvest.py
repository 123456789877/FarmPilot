from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class HarvestBase(BaseModel):
    field_id: int
    crop_cycle_id: Optional[int] = None
    harvest_date: date
    quantity: float = Field(..., gt=0)
    unit: str = Field(..., min_length=1)
    selling_price: Optional[float] = Field(0.0, ge=0)
    notes: Optional[str] = None

class HarvestCreate(HarvestBase):
    pass

class HarvestResponse(HarvestBase):
    id: int
    revenue: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
