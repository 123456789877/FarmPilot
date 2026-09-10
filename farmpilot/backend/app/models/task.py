from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=True)
    crop_cycle_id = Column(Integer, ForeignKey("crop_cycles.id"), nullable=True)
    due_date = Column(Date, nullable=True)
    priority = Column(String(50), default="Medium")  # Low, Medium, High
    status = Column(String(50), default="Pending")  # Pending, In Progress, Completed, Overdue
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    field = relationship("Field", back_populates="tasks")
    crop_cycle = relationship("CropCycle", back_populates="tasks")
