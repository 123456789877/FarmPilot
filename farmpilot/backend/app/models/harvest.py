from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

class Harvest(Base):
    __tablename__ = "harvests"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=False)
    crop_cycle_id = Column(Integer, ForeignKey("crop_cycles.id"), nullable=True)
    harvest_date = Column(Date, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)  # kg, quintal, ton
    selling_price = Column(Float, default=0.0)  # per unit
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    field = relationship("Field", back_populates="harvests")
    crop_cycle = relationship("CropCycle", back_populates="harvests")

    @property
    def revenue(self):
        return (self.quantity or 0) * (self.selling_price or 0)
