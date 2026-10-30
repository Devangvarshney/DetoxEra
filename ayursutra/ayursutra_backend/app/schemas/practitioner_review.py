from pydantic import BaseModel, Field, model_validator
from typing import Optional, Any
from datetime import datetime

class PractitionerReviewBase(BaseModel):
    patient_name: Optional[str] = "Verified Patient"
    rating: int = Field(ge=1, le=5, description="Star rating from 1 to 5")
    review: Optional[str] = ""
    review_text: Optional[str] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_review(cls, data: Any) -> Any:
        if isinstance(data, dict):
            r = data.get("review") or data.get("review_text") or ""
            data["review"] = r
            if not data.get("review_text"):
                data["review_text"] = r
            if not data.get("patient_name"):
                data["patient_name"] = "Verified Patient"
        elif hasattr(data, "__dict__"):
            r = getattr(data, "review", None) or getattr(data, "review_text", None) or ""
            return {
                "id": getattr(data, "id", None),
                "practitioner_id": getattr(data, "practitioner_id", None),
                "patient_id": getattr(data, "patient_id", None),
                "patient_name": getattr(data, "patient_name", None) or "Verified Patient",
                "rating": getattr(data, "rating", 5),
                "review": r,
                "review_text": getattr(data, "review_text", None) or r,
                "clinic_name": getattr(data, "clinic_name", None),
                "clinic_address": getattr(data, "clinic_address", None),
                "created_at": getattr(data, "created_at", None),
            }
        return data

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
