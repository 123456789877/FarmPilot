from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

class IrrigationRecord(Base):
    __tablename__ = "irrigation_records"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=False)
    crop_cycle_id = Column(Integer, ForeignKey("crop_cycles.id"), nullable=True)
    date = Column(Date, nullable=False)
    water_quantity = Column(Float, nullable=True)  # liters or mm
    duration = Column(Float, nullable=True)  # hours
    irrigation_method = Column(String(100), nullable=True)  # Drip, Flood, Sprinkler, etc.
    cost = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    field = relationship("Field", back_populates="irrigation_records")
    crop_cycle = relationship("CropCycle", back_populates="irrigation_records")
