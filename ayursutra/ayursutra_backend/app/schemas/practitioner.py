from pydantic import BaseModel
from typing import Optional, List
from .user import User
from .practitioner_clinic import PractitionerClinic, PractitionerClinicCreate
from .practitioner_review import PractitionerReview

class PractitionerBase(BaseModel):
    name: str
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience: Optional[str] = None
    city: Optional[str] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    consultation_fee: Optional[str] = None
    phone: Optional[str] = None
    accreditation: Optional[str] = None
    therapies: Optional[str] = None
    profile_image: Optional[str] = None
    timing: Optional[str] = None
    is_profile_completed: Optional[bool] = False
    bio: Optional[str] = None
    availability: Optional[str] = None

class PractitionerCreate(PractitionerBase):
    pass

class PractitionerUpdate(BaseModel):
    name: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience: Optional[str] = None
    city: Optional[str] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    consultation_fee: Optional[str] = None
    phone: Optional[str] = None
    accreditation: Optional[str] = None
    therapies: Optional[str] = None
    profile_image: Optional[str] = None
    timing: Optional[str] = None
    is_profile_completed: Optional[bool] = None
    bio: Optional[str] = None
    availability: Optional[str] = None
    clinics: Optional[List[PractitionerClinicCreate]] = None

class PractitionerInDBBase(PractitionerBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class Practitioner(PractitionerInDBBase):
    clinics: Optional[List[PractitionerClinic]] = []
    reviews: Optional[List[PractitionerReview]] = []

class PractitionerWithUser(Practitioner):
    user: User

