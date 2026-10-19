from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Practitioner(Base):
    __tablename__ = "practitioners"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    specialization = Column(String(255))
    qualification = Column(String(255))
    experience = Column(String(255))
    city = Column(String(255), nullable=True, index=True)
    clinic_name = Column(String(255), nullable=True)
    clinic_address = Column(String(500), nullable=True)
    consultation_fee = Column(String(50), nullable=True)
    phone = Column(String(50), nullable=True)
    accreditation = Column(String(255), nullable=True)
    therapies = Column(String(500), nullable=True)
    profile_image = Column(String(1000), nullable=True)
    timing = Column(String(255), nullable=True)
    is_profile_completed = Column(Boolean, default=False, index=True)
    bio = Column(String(1000))
    availability = Column(String(500))

    user = relationship("User", back_populates="practitioner_profile")
    treatment_requests = relationship("TreatmentRequest", back_populates="practitioner")
    therapy_plans = relationship("TherapyPlan", back_populates="practitioner")
    feedback = relationship("Feedback", back_populates="practitioner")
