from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.field import Field
from app.schemas.field import FieldCreate, FieldUpdate, FieldResponse
from app.auth.security import get_current_user

router = APIRouter()

def _user_owns_farm(db: Session, farm_id: int, user_id: int) -> bool:
    return db.query(Farm).filter(Farm.id == farm_id, Farm.owner_id == user_id).first() is not None

@router.get("", response_model=List[FieldResponse])
def list_fields(farm_id: int = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(Field).join(Farm).filter(Farm.owner_id == current_user.id)
    if farm_id:
        q = q.filter(Field.farm_id == farm_id)
    return q.all()

@router.post("", response_model=FieldResponse, status_code=status.HTTP_201_CREATED)
def create_field(field_in: FieldCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not _user_owns_farm(db, field_in.farm_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized for this farm")
    field = Field(**field_in.model_dump())
    db.add(field)
    db.commit()
    db.refresh(field)
    return field

@router.get("/{field_id}", response_model=FieldResponse)
def get_field(field_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    field = db.query(Field).join(Farm).filter(Field.id == field_id, Farm.owner_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field

@router.put("/{field_id}", response_model=FieldResponse)
def update_field(field_id: int, field_in: FieldUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    field = db.query(Field).join(Farm).filter(Field.id == field_id, Farm.owner_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    for k, v in field_in.model_dump(exclude_unset=True).items():
        setattr(field, k, v)
    db.commit()
    db.refresh(field)
    return field

@router.delete("/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_field(field_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    field = db.query(Field).join(Farm).filter(Field.id == field_id, Farm.owner_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    db.delete(field)
    db.commit()
    return None
