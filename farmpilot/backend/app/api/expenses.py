from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.field import Field
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.auth.security import get_current_user

router = APIRouter()

@router.get("", response_model=List[ExpenseResponse])
def list_expenses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Expense)
        .outerjoin(Farm, Expense.farm_id == Farm.id)
        .outerjoin(Field, Expense.field_id == Field.id)
        .filter(
            (Farm.owner_id == current_user.id) |
            (Field.farm_id.in_(db.query(Farm.id).filter(Farm.owner_id == current_user.id)))
        )
        .all()
    )

@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(exp_in: ExpenseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if exp_in.farm_id:
        farm = db.query(Farm).filter(Farm.id == exp_in.farm_id, Farm.owner_id == current_user.id).first()
        if not farm:
            raise HTTPException(status_code=403, detail="Not authorized")
    expense = Expense(**exp_in.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(expense_id: int, exp_in: ExpenseUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    for k, v in exp_in.model_dump(exclude_unset=True).items():
        setattr(expense, k, v)
    db.commit()
    db.refresh(expense)
    return expense
