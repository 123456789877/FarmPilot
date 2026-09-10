from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.field import Field
from app.models.crop_cycle import CropCycle
from app.schemas.crop_cycle import CropCycleCreate, CropCycleUpdate, CropCycleResponse
from app.auth.security import get_current_user

router = APIRouter()

@router.get("", response_model=List[CropCycleResponse])
def list_crops(field_id: int = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(CropCycle).join(Field).join(Farm).filter(Farm.owner_id == current_user.id)
    if field_id:
        q = q.filter(CropCycle.field_id == field_id)
    return q.all()

@router.post("", response_model=CropCycleResponse, status_code=status.HTTP_201_CREATED)
def create_crop(crop_in: CropCycleCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    field = db.query(Field).join(Farm).filter(Field.id == crop_in.field_id, Farm.owner_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=403, detail="Not authorized for this field")
    crop = CropCycle(**crop_in.model_dump())
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop

@router.get("/{crop_id}", response_model=CropCycleResponse)
def get_crop(crop_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    crop = db.query(CropCycle).join(Field).join(Farm).filter(CropCycle.id == crop_id, Farm.owner_id == current_user.id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop cycle not found")
    return crop

@router.put("/{crop_id}", response_model=CropCycleResponse)
def update_crop(crop_id: int, crop_in: CropCycleUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    crop = db.query(CropCycle).join(Field).join(Farm).filter(CropCycle.id == crop_id, Farm.owner_id == current_user.id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop cycle not found")
    for k, v in crop_in.model_dump(exclude_unset=True).items():
        setattr(crop, k, v)
    db.commit()
    db.refresh(crop)
    return crop
