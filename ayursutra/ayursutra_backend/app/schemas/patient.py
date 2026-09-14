from pydantic import BaseModel
from typing import Optional
from .user import User

class PatientBase(BaseModel):
    name: str
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    profile_info: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    profile_info: Optional[str] = None

class PatientInDBBase(PatientBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class Patient(PatientInDBBase):
    pass

class PatientWithUser(Patient):
    user: User
