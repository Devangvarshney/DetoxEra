from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class ClinicalAdherenceBenchmark(Base):
    """
    Backs Table 2: Clinical Adherence Across Classical Panchakarma Phases
    Comparing conventional paper-based care vs. AyurSutra automated notification engine.
    """
    __tablename__ = "clinical_adherence_benchmarks"

    id = Column(Integer, primary_key=True, index=True)
    phase_name = Column(String(100), nullable=False)
    clinical_requirement = Column(String(255), nullable=False)
    baseline_adherence_pct = Column(Float, nullable=False)
    ayursutra_adherence_pct = Column(Float, nullable=False)
    non_compliance_reduction_pct = Column(Float, nullable=False)
    sample_size = Column(Integer, default=28)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PractitionerEfficiencyBenchmark(Base):
    """
    Backs Table 3: Doctor Workflow & Administrative Efficiency Impact
    Comparing manual clinic paperwork vs. AyurSutra digital protocol engine.
    """
    __tablename__ = "practitioner_efficiency_benchmarks"

    id = Column(Integer, primary_key=True, index=True)
    task_name = Column(String(150), nullable=False)
    manual_time_mins = Column(Float, nullable=False)
    ayursutra_time_mins = Column(Float, nullable=False)
    time_saved_pct = Column(Float, nullable=False)
    sample_practitioners = Column(Integer, default=8)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Standard10ItemSUSEvaluation(Base):
    """
    Standard 10-Item System Usability Scale (SUS) as formulated by John Brooke (1986).
    5-point Likert scale (1=Strongly Disagree, 5=Strongly Agree), alternating positive/negative.
    
    Odd Items (+): Contribution = Response - 1
    Even Items (-): Contribution = 5 - Response
    Total Score = Sum of contributions * 2.5 (0 to 100 benchmark).
    """
    __tablename__ = "sus_10_item_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    participant_name = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False, index=True) # 'patient' or 'practitioner'
    therapy_type = Column(String(100), nullable=True) # e.g. 'Virechana', 'Vamana', 'Basti'

    # The Canonical 10 John Brooke Items (1-5 Likert Scale):
    q1 = Column(Integer, nullable=False)  # (+) I think that I would like to use this system frequently.
    q2 = Column(Integer, nullable=False)  # (-) I found the system unnecessarily complex.
    q3 = Column(Integer, nullable=False)  # (+) I thought the system was easy to use.
    q4 = Column(Integer, nullable=False)  # (-) I think that I would need technical support to use this system.
    q5 = Column(Integer, nullable=False)  # (+) I found the various functions in this system were well integrated.
    q6 = Column(Integer, nullable=False)  # (-) I thought there was too much inconsistency in this system.
    q7 = Column(Integer, nullable=False)  # (+) I would imagine that most people would learn to use this system quickly.
    q8 = Column(Integer, nullable=False)  # (-) I found the system very cumbersome to use.
    q9 = Column(Integer, nullable=False)  # (+) I felt very confident using the system.
    q10 = Column(Integer, nullable=False) # (-) I needed to learn a lot of things before I could get going.

    # Brooke Scoring Results:
    adjusted_score_sum = Column(Integer, nullable=False) # Raw sum of contributions (0-40)
    sus_score = Column(Float, nullable=False)            # Final scaled score: sum * 2.5 (0-100)
    grade = Column(String(20), nullable=False)           # 'A', 'B+', 'C', etc.
    learnability_subscore = Column(Float, nullable=True) # Items 4 & 10 contribution scaled to 100
    usability_subscore = Column(Float, nullable=True)    # Items 1,2,3,5,6,7,8,9 scaled to 100

    # User Testimonial Feedback:
    liked = Column(Text, nullable=True)
    disliked = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
