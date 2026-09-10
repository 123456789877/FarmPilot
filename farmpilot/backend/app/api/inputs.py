from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.field import Field
from app.models.input_item import InputItem
from app.schemas.input_item import InputItemCreate, InputItemUpdate, InputItemResponse
from app.auth.security import get_current_user

router = APIRouter()

@router.get("", response_model=List[InputItemResponse])
def list_inputs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(InputItem)
        .outerjoin(Field)
        .outerjoin(Farm, Field.farm_id == Farm.id)
        .filter(Farm.owner_id == current_user.id)
        .all()
    )

@router.post("", response_model=InputItemResponse, status_code=status.HTTP_201_CREATED)
def create_input(item_in: InputItemCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if item_in.field_id:
        field = db.query(Field).join(Farm).filter(Field.id == item_in.field_id, Farm.owner_id == current_user.id).first()
        if not field:
            raise HTTPException(status_code=403, detail="Not authorized")
    item = InputItem(**item_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/{item_id}", response_model=InputItemResponse)
def update_input(item_id: int, item_in: InputItemUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(InputItem).filter(InputItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Input not found")
    for k, v in item_in.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item
