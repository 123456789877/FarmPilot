from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class FieldBase(BaseModel):
    name: str = Field(..., min_length=1)
    area: float = Field(..., gt=0)
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = "Active"
    farm_id: int

class FieldCreate(FieldBase):
    pass

class FieldUpdate(BaseModel):
    name: Optional[str] = None
    area: Optional[float] = Field(None, gt=0)
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None

class FieldResponse(FieldBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
