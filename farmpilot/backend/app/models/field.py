from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    area = Column(Float, nullable=False)  # acres
    soil_type = Column(String(100), nullable=True)
    irrigation_type = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    status = Column(String(50), default="Active")  # Active, Fallow, etc.
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    farm = relationship("Farm", back_populates="fields")
    crop_cycles = relationship("CropCycle", back_populates="field", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="field", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="field", cascade="all, delete-orphan")
    inputs = relationship("InputItem", back_populates="field", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="field", cascade="all, delete-orphan")
    irrigation_records = relationship("IrrigationRecord", back_populates="field", cascade="all, delete-orphan")
    harvests = relationship("Harvest", back_populates="field", cascade="all, delete-orphan")
