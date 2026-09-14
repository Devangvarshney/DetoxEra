from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("therapy_sessions.id"), unique=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    practitioner_id = Column(Integer, ForeignKey("practitioners.id"), nullable=False)
    rating = Column(Integer, nullable=False) # 1-5
    comments = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("TherapySession", back_populates="feedback")
    patient = relationship("Patient", back_populates="feedback")
    practitioner = relationship("Practitioner", back_populates="feedback")
