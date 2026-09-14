from pydantic import BaseModel
from typing import Optional
from .user import User

class PractitionerBase(BaseModel):
    name: str
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience: Optional[str] = None
    bio: Optional[str] = None
    availability: Optional[str] = None

class PractitionerCreate(PractitionerBase):
    pass

class PractitionerUpdate(BaseModel):
    name: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience: Optional[str] = None
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
