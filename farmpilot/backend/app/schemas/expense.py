from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class ExpenseBase(BaseModel):
    name: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)
    date: date
    farm_id: Optional[int] = None
    field_id: Optional[int] = None
    crop_cycle_id: Optional[int] = None
    notes: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    date: Optional[date] = None
    notes: Optional[str] = None

class ExpenseResponse(ExpenseBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
