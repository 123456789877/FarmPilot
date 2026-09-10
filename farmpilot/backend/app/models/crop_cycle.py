from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

class CropCycle(Base):
    __tablename__ = "crop_cycles"

    id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String(255), nullable=False)
    variety = Column(String(255), nullable=True)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=False)
    planting_date = Column(Date, nullable=True)
    expected_harvest_date = Column(Date, nullable=True)
    current_growth_stage = Column(String(100), default="Planned")
    # Planned, Sowing, Vegetative, Flowering, Fruiting, Harvest Ready, Harvested
    target_yield = Column(Float, nullable=True)
    status = Column(String(50), default="Active")  # Active, Completed, Abandoned
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    field = relationship("Field", back_populates="crop_cycles")
    activities = relationship("Activity", back_populates="crop_cycle", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="crop_cycle", cascade="all, delete-orphan")
    inputs = relationship("InputItem", back_populates="crop_cycle", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="crop_cycle", cascade="all, delete-orphan")
    irrigation_records = relationship("IrrigationRecord", back_populates="crop_cycle", cascade="all, delete-orphan")
    harvests = relationship("Harvest", back_populates="crop_cycle", cascade="all, delete-orphan")
