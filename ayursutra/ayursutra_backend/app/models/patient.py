from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(50))
    age = Column(Integer)
    gender = Column(String(50))
    address = Column(String(500))
    profile_info = Column(String(1000))

    user = relationship("User", back_populates="patient_profile")
    treatment_requests = relationship("TreatmentRequest", back_populates="patient")
    therapy_plans = relationship("TherapyPlan", back_populates="patient")
    feedback = relationship("Feedback", back_populates="patient")
    practitioner_reviews = relationship("PractitionerReview", back_populates="patient")
