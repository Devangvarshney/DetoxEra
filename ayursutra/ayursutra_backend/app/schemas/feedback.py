from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .patient import Patient
from .practitioner import Practitioner

class FeedbackBase(BaseModel):
    rating: int = Field(ge=1, le=5)
    comments: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackInDBBase(FeedbackBase):
    id: int
    session_id: int
    patient_id: int
    practitioner_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Feedback(FeedbackInDBBase):
    patient: Optional[Patient] = None
    practitioner: Optional[Practitioner] = None
