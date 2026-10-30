from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class PractitionerReview(Base):
    __tablename__ = "practitioner_reviews"

    id = Column(Integer, primary_key=True, index=True)
    practitioner_id = Column(Integer, ForeignKey("practitioners.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True, index=True)
    patient_name = Column(String(255), nullable=True, default="Verified Patient")
    rating = Column(Integer, nullable=False)  # 1 to 5 stars
    review = Column(Text, nullable=True)
    review_text = Column(Text, nullable=True)
    clinic_name = Column(String(255), nullable=True)
    clinic_address = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    practitioner = relationship("Practitioner", back_populates="reviews")
    patient = relationship("Patient", back_populates="practitioner_reviews")
