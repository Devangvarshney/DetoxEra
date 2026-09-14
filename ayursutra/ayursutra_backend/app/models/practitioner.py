from sqlalchemy import Column, Integer, String, ForeignKey
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
    bio = Column(String(1000))
    availability = Column(String(500))

    user = relationship("User", back_populates="practitioner_profile")
    treatment_requests = relationship("TreatmentRequest", back_populates="practitioner")
    therapy_plans = relationship("TherapyPlan", back_populates="practitioner")
    feedback = relationship("Feedback", back_populates="practitioner")
