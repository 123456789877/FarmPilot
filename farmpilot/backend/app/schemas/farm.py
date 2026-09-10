from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class FarmBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    location: str = Field(..., min_length=1)
    total_area: float = Field(..., gt=0)
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    description: Optional[str] = None

class FarmCreate(FarmBase):
    pass

class FarmUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    location: Optional[str] = None
    total_area: Optional[float] = Field(None, gt=0)
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    description: Optional[str] = None

class FarmResponse(FarmBase):
    id: int
    owner_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
