from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, String, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class AppEvaluation(Base):
    """
    App Experience & Digital Therapeutics Usability Survey
    Collected 1-2 days post-therapy from Patients and Practitioners
    to judge platform usability, precaution compliance, and clinical utility.
    """
    __tablename__ = "app_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(50), nullable=False, index=True) # 'patient' or 'practitioner'
    user_name = Column(String(255), nullable=True)
    therapy_plan_id = Column(Integer, ForeignKey("therapy_plans.id"), nullable=True, index=True)
    therapy_title = Column(String(255), nullable=True) # e.g. "Virechana Protocol", "Basti Therapy"
    days_post_therapy = Column(Integer, default=2) # e.g. 1 or 2 days after therapy

    # Core Numerical Evaluation Criteria (1-5 Likert scale)
    app_usability_rating = Column(Integer, nullable=False) # 1-5 (UI Navigation & System Usability)
    precautions_clarity_rating = Column(Integer, nullable=False) # 1-5 (Purvakarma/Paschatkarma guidance clarity)
    scheduling_convenience_rating = Column(Integer, nullable=False) # 1-5 (Session scheduling & automated reminders)
    overall_experience_rating = Column(Integer, nullable=False) # 1-5 (Overall satisfaction)
    
    # Net Promoter Score / Recommendation (1-10)
    recommend_score = Column(Integer, default=9) # 1-10
    
    # Clinical Utility
    clinical_adherence_improved = Column(Boolean, default=True) # Did platform improve adherence?
    
    # Qualitative Feedback
    liked_most = Column(Text, nullable=True) # What did you like most?
    improvement_suggestions = Column(Text, nullable=True) # What can be improved?

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    therapy_plan = relationship("TherapyPlan")
