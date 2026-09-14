from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Text, Float, Time, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class SessionStatus(str, enum.Enum):
    PENDING = "pending"
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TreatmentRequest(Base):
    __tablename__ = "treatment_requests"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    practitioner_id = Column(Integer, ForeignKey("practitioners.id"), nullable=False, index=True)
    message = Column(Text)
    status = Column(Enum(RequestStatus), default=RequestStatus.PENDING, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    patient = relationship("Patient", back_populates="treatment_requests")
    practitioner = relationship("Practitioner", back_populates="treatment_requests")

class TherapyTemplate(Base):
    __tablename__ = "therapy_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    recommended_session_count = Column(Integer, default=1)
    default_session_duration = Column(Integer, default=60) # minutes
    instructions = Column(Text)

class TherapyPlan(Base):
    __tablename__ = "therapy_plans"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    practitioner_id = Column(Integer, ForeignKey("practitioners.id"), nullable=False, index=True)
    template_id = Column(Integer, ForeignKey("therapy_templates.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    number_of_sessions = Column(Integer, nullable=False)
    session_duration = Column(Integer, default=60)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    patient = relationship("Patient", back_populates="therapy_plans")
    practitioner = relationship("Practitioner", back_populates="therapy_plans")
    sessions = relationship("TherapySession", back_populates="therapy_plan", cascade="all, delete-orphan")

class TherapySession(Base):
    __tablename__ = "therapy_sessions"

    id = Column(Integer, primary_key=True, index=True)
    therapy_plan_id = Column(Integer, ForeignKey("therapy_plans.id"), nullable=False, index=True)
    session_number = Column(Integer, nullable=False)
    status = Column(Enum(SessionStatus), default=SessionStatus.PENDING, nullable=False)
    scheduled_date = Column(Date, nullable=True, index=True)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    duration = Column(Integer, nullable=False) # minutes
    practitioner_notes = Column(Text)
    patient_notes = Column(Text)
    pre_precautions = Column(Text, nullable=True)
    post_precautions = Column(Text, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    therapy_plan = relationship("TherapyPlan", back_populates="sessions")
    feedback = relationship("Feedback", back_populates="session", uselist=False)
