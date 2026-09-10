from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class InputItemBase(BaseModel):
    name: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    quantity: float = Field(..., gt=0)
    unit: str = Field(..., min_length=1)
    cost: Optional[float] = Field(0.0, ge=0)
    date: date
    field_id: Optional[int] = None
    crop_cycle_id: Optional[int] = None
    notes: Optional[str] = None

class InputItemCreate(InputItemBase):
    pass

class InputItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = None
    cost: Optional[float] = Field(None, ge=0)
    date: Optional[date] = None
    notes: Optional[str] = None

class InputItemResponse(InputItemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
