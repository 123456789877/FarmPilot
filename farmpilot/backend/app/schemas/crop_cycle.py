from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class CropCycleBase(BaseModel):
    crop_name: str = Field(..., min_length=1)
    variety: Optional[str] = None
    field_id: int
    planting_date: Optional[date] = None
    expected_harvest_date: Optional[date] = None
    current_growth_stage: Optional[str] = "Planned"
    target_yield: Optional[float] = None
    status: Optional[str] = "Active"
    notes: Optional[str] = None

class CropCycleCreate(CropCycleBase):
    pass

class CropCycleUpdate(BaseModel):
    crop_name: Optional[str] = None
    variety: Optional[str] = None
    planting_date: Optional[date] = None
    expected_harvest_date: Optional[date] = None
    current_growth_stage: Optional[str] = None
    target_yield: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class CropCycleResponse(CropCycleBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
