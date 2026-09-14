from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.patient import Patient, PatientUpdate
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_patient
from app.services.patient_service import get_patient_by_user_id, update_patient_profile
from app.models.user import User

router = APIRouter()

@router.get("/me", response_model=Patient)
def read_patient_me(current_user: User = Depends(get_current_patient), db: Session = Depends(get_db)):
    return get_patient_by_user_id(db, current_user.id)

@router.patch("/me", response_model=Patient)
def update_patient_me(patient_in: PatientUpdate, current_user: User = Depends(get_current_patient), db: Session = Depends(get_db)):
    return update_patient_profile(db, current_user.id, patient_in)
