from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

class InputItem(Base):
    __tablename__ = "inputs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # Seeds, Fertilizers, Pesticides, Organic manure, Other
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    cost = Column(Float, default=0.0)
    date = Column(Date, nullable=False)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=True)
    crop_cycle_id = Column(Integer, ForeignKey("crop_cycles.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    field = relationship("Field", back_populates="inputs")
    crop_cycle = relationship("CropCycle", back_populates="inputs")
