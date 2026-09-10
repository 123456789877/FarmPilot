from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.field import Field
from app.models.harvest import Harvest
from app.schemas.harvest import HarvestCreate, HarvestResponse
from app.auth.security import get_current_user

router = APIRouter()

@router.get("", response_model=List[HarvestResponse])
def list_harvests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    harvests = (
        db.query(Harvest)
        .join(Field)
        .join(Farm)
        .filter(Farm.owner_id == current_user.id)
        .all()
    )
    result = []
    for h in harvests:
        data = HarvestResponse.model_validate(h)
        data.revenue = (h.quantity or 0) * (h.selling_price or 0)
        result.append(data)
    return result

@router.post("", response_model=HarvestResponse, status_code=status.HTTP_201_CREATED)
def create_harvest(harv_in: HarvestCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    field = db.query(Field).join(Farm).filter(Field.id == harv_in.field_id, Farm.owner_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=403, detail="Not authorized")
    harvest = Harvest(**harv_in.model_dump())
    db.add(harvest)
    db.commit()
    db.refresh(harvest)
    data = HarvestResponse.model_validate(harvest)
    data.revenue = (harvest.quantity or 0) * (harvest.selling_price or 0)
    return data
