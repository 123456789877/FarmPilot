from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    # Seeds, Fertilizers, Pesticides, Labor, Irrigation, Machinery, Transportation, Other
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=True)
    crop_cycle_id = Column(Integer, ForeignKey("crop_cycles.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    farm = relationship("Farm", back_populates="expenses")
    field = relationship("Field", back_populates="expenses")
    crop_cycle = relationship("CropCycle", back_populates="expenses")
