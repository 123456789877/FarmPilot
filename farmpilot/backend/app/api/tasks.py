from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.database.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.field import Field
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.auth.security import get_current_user

router = APIRouter()

@router.get("", response_model=List[TaskResponse])
def list_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = (
        db.query(Task)
        .outerjoin(Field)
        .outerjoin(Farm, Field.farm_id == Farm.id)
        .filter(Farm.owner_id == current_user.id)
        .all()
    )
    # mark overdue
    today = date.today()
    for t in tasks:
        if t.status not in ("Completed",) and t.due_date and t.due_date < today:
            t.status = "Overdue"
    return tasks

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_in: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if task_in.field_id:
        field = db.query(Field).join(Farm).filter(Field.id == task_in.field_id, Farm.owner_id == current_user.id).first()
        if not field:
            raise HTTPException(status_code=403, detail="Not authorized")
    task = Task(**task_in.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_in: TaskUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.field_id:
        field = db.query(Field).join(Farm).filter(Field.id == task.field_id, Farm.owner_id == current_user.id).first()
        if not field:
            raise HTTPException(status_code=403, detail="Not authorized")
    for k, v in task_in.model_dump(exclude_unset=True).items():
        setattr(task, k, v)
    db.commit()
    db.refresh(task)
    return task
