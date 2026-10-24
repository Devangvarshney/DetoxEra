from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PractitionerClinicBase(BaseModel):
    clinic_name: str
    clinic_address: str
    city: Optional[str] = None
    timing: Optional[str] = None
    phone: Optional[str] = None
    consultation_fee: Optional[str] = None
    is_primary: Optional[bool] = False

class PractitionerClinicCreate(PractitionerClinicBase):
    pass

class PractitionerClinicUpdate(BaseModel):
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    city: Optional[str] = None
    timing: Optional[str] = None
    phone: Optional[str] = None
    consultation_fee: Optional[str] = None
    is_primary: Optional[bool] = None

class PractitionerClinicInDBBase(PractitionerClinicBase):
    id: int
    practitioner_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PractitionerClinic(PractitionerClinicInDBBase):
    pass
