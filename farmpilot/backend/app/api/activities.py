from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.field import Field
from app.models.activity import Activity
from app.schemas.activity import ActivityCreate, ActivityUpdate, ActivityResponse
from app.auth.security import get_current_user

router = APIRouter()

@router.get("", response_model=List[ActivityResponse])
def list_activities(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Activity)
        .outerjoin(Field)
        .outerjoin(Farm, Field.farm_id == Farm.id)
        .filter((Farm.owner_id == current_user.id) | (Activity.farm_id.in_(
            db.query(Farm.id).filter(Farm.owner_id == current_user.id)
        )))
        .all()
    )

@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(act_in: ActivityCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if act_in.field_id:
        field = db.query(Field).join(Farm).filter(Field.id == act_in.field_id, Farm.owner_id == current_user.id).first()
        if not field:
            raise HTTPException(status_code=403, detail="Not authorized")
    activity = Activity(**act_in.model_dump())
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity

@router.put("/{activity_id}", response_model=ActivityResponse)
def update_activity(activity_id: int, act_in: ActivityUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    # simple ownership check via field
    if activity.field_id:
        field = db.query(Field).join(Farm).filter(Field.id == activity.field_id, Farm.owner_id == current_user.id).first()
        if not field:
            raise HTTPException(status_code=403, detail="Not authorized")
    for k, v in act_in.model_dump(exclude_unset=True).items():
        setattr(activity, k, v)
    db.commit()
    db.refresh(activity)
    return activity
