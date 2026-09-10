from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    activity_name = Column(String(255), nullable=False)  # Ploughing, Sowing, Fertilization, etc.
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=True)
    crop_cycle_id = Column(Integer, ForeignKey("crop_cycles.id"), nullable=True)
    date = Column(Date, nullable=False)
    cost = Column(Float, default=0.0)
    quantity = Column(Float, nullable=True)
    unit = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="Planned")  # Planned, In Progress, Completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    field = relationship("Field", back_populates="activities")
    crop_cycle = relationship("CropCycle", back_populates="activities")
