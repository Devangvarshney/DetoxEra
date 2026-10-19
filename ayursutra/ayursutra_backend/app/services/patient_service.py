from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.patient import Patient
from app.schemas.patient import PatientUpdate

def get_patient_by_user_id(db: Session, user_id: int) -> Patient:
    patient = db.query(Patient).filter(Patient.user_id == user_id).first()
    if not patient:
        patient = Patient(user_id=user_id, name="", age=None, gender=None, phone=None)
        db.add(patient)
        db.commit()
        db.refresh(patient)
    return patient

def update_patient_profile(db: Session, user_id: int, patient_in: PatientUpdate) -> Patient:
    db_patient = get_patient_by_user_id(db, user_id)
    update_data = patient_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_patient, field, value)
    db.commit()
    db.refresh(db_patient)
    return db_patient
