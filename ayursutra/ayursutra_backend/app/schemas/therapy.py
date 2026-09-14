from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, time
from app.models.therapy import RequestStatus, SessionStatus
from .patient import Patient
from .practitioner import Practitioner

class TreatmentRequestBase(BaseModel):
    message: Optional[str] = None

class TreatmentRequestCreate(TreatmentRequestBase):
    practitioner_id: int

class TreatmentRequestUpdate(BaseModel):
    status: RequestStatus

class TreatmentRequestInDBBase(TreatmentRequestBase):
    id: int
    patient_id: int
    practitioner_id: int
    status: RequestStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TreatmentRequest(TreatmentRequestInDBBase):
    patient: Optional[Patient] = None
    practitioner: Optional[Practitioner] = None

class TherapyTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    recommended_session_count: int = 1
    default_session_duration: int = 60
    instructions: Optional[str] = None

class TherapyTemplate(TherapyTemplateBase):
    id: int
    class Config:
        from_attributes = True

class TherapyPlanBase(BaseModel):
    title: str
    description: Optional[str] = None
    number_of_sessions: int
    session_duration: int = 60
    notes: Optional[str] = None

class TherapyPlanCreate(TherapyPlanBase):
    patient_id: int
    template_id: Optional[int] = None

class TherapyPlanInDBBase(TherapyPlanBase):
    id: int
    patient_id: int
    practitioner_id: int
    template_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TherapySessionBase(BaseModel):
    pass

class SessionSchedule(BaseModel):
    scheduled_date: date
    start_time: time
    pre_precautions: Optional[str] = None

class SessionComplete(BaseModel):
    practitioner_notes: Optional[str] = None
    post_precautions: Optional[str] = None

class TherapySessionInDBBase(TherapySessionBase):
    id: int
    therapy_plan_id: int
    session_number: int
    status: SessionStatus
    scheduled_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    duration: int
    practitioner_notes: Optional[str] = None
    patient_notes: Optional[str] = None
    pre_precautions: Optional[str] = None
    post_precautions: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TherapySession(TherapySessionInDBBase):
    pass

class TherapyPlan(TherapyPlanInDBBase):
    sessions: List[TherapySession] = []
    patient: Optional[Patient] = None
    practitioner: Optional[Practitioner] = None

class TherapyProgress(BaseModel):
    therapy_plan_id: int
    total_sessions: int
    completed_sessions: int
    scheduled_sessions: int
    progress_percentage: float
