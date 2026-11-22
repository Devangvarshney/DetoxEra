from sqlalchemy import Column, Integer, String, Float, DateTime
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
    sample_size = Column(Integer, default=24)
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
    sample_practitioners = Column(Integer, default=6)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
