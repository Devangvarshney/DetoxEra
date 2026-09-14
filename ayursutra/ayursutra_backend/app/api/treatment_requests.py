from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.therapy import TreatmentRequest, TreatmentRequestCreate, TreatmentRequestUpdate
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_patient, get_current_practitioner
from app.services.treatment_request_service import create_treatment_request, get_sent_requests, get_received_requests, update_request_status
from app.models.user import User

router = APIRouter()

@router.post("", response_model=TreatmentRequest, status_code=status.HTTP_201_CREATED)
def create_request(request_in: TreatmentRequestCreate, current_user: User = Depends(get_current_patient), db: Session = Depends(get_db)):
    patient_id = current_user.patient_profile.id
    return create_treatment_request(db, request_in, patient_id)

@router.get("/sent", response_model=List[TreatmentRequest])
def read_sent_requests(current_user: User = Depends(get_current_patient), db: Session = Depends(get_db)):
    patient_id = current_user.patient_profile.id
    return get_sent_requests(db, patient_id)

@router.get("/received", response_model=List[TreatmentRequest])
def read_received_requests(current_user: User = Depends(get_current_practitioner), db: Session = Depends(get_db)):
    practitioner_id = current_user.practitioner_profile.id
    return get_received_requests(db, practitioner_id)

@router.patch("/{id}", response_model=TreatmentRequest)
def update_request(id: int, request_in: TreatmentRequestUpdate, current_user: User = Depends(get_current_practitioner), db: Session = Depends(get_db)):
    practitioner_id = current_user.practitioner_profile.id
    return update_request_status(db, id, request_in.status, practitioner_id)
