from pydantic import BaseModel
from typing import Optional
from .user import User

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

class PractitionerInDBBase(PractitionerBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class Practitioner(PractitionerInDBBase):
    pass

class PractitionerWithUser(Practitioner):
    user: User
