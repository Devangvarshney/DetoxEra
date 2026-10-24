from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PractitionerReviewBase(BaseModel):
    patient_name: str
    rating: int = Field(ge=1, le=5, description="Star rating from 1 to 5")
    review: str
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None

class PractitionerReviewCreate(PractitionerReviewBase):
    patient_id: Optional[int] = None

class PractitionerReviewInDBBase(PractitionerReviewBase):
    id: int
    practitioner_id: int
    patient_id: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PractitionerReview(PractitionerReviewInDBBase):
    pass
