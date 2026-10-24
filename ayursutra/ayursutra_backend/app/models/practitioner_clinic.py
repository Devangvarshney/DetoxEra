from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class PractitionerClinic(Base):
    __tablename__ = "practitioner_clinics"

    id = Column(Integer, primary_key=True, index=True)
    practitioner_id = Column(Integer, ForeignKey("practitioners.id"), nullable=False, index=True)
    clinic_name = Column(String(255), nullable=False)
    clinic_address = Column(String(500), nullable=False)
    city = Column(String(255), nullable=True)
    timing = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    consultation_fee = Column(String(50), nullable=True)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    practitioner = relationship("Practitioner", back_populates="clinics")
