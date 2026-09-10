from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.field import Field
from app.models.irrigation import IrrigationRecord
from app.schemas.irrigation import IrrigationCreate, IrrigationResponse
from app.auth.security import get_current_user

router = APIRouter()

@router.get("", response_model=List[IrrigationResponse])
def list_irrigation(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(IrrigationRecord)
        .join(Field)
        .join(Farm)
        .filter(Farm.owner_id == current_user.id)
        .order_by(IrrigationRecord.date.desc())
        .all()
    )

@router.post("", response_model=IrrigationResponse, status_code=status.HTTP_201_CREATED)
def create_irrigation(irr_in: IrrigationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    field = db.query(Field).join(Farm).filter(Field.id == irr_in.field_id, Farm.owner_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=403, detail="Not authorized")
    record = IrrigationRecord(**irr_in.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
