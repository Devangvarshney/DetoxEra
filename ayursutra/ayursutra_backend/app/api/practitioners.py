from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.schemas.practitioner import Practitioner, PractitionerUpdate
from app.schemas.practitioner_clinic import PractitionerClinic, PractitionerClinicCreate
from app.schemas.practitioner_review import PractitionerReview, PractitionerReviewCreate
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user, get_current_practitioner, get_current_patient
from app.services.practitioner_service import (
    get_practitioners, 
    get_practitioner, 
    get_practitioner_by_user_id, 
    update_practitioner_profile,
    add_practitioner_clinic,
    get_practitioner_clinics,
    delete_practitioner_clinic,
    submit_practitioner_review,
    get_practitioner_reviews
)
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[Practitioner])
def read_practitioners(city: Optional[str] = None, only_completed: bool = False, db: Session = Depends(get_db)):
    return get_practitioners(db, city=city, only_completed=only_completed)

@router.get("/{id}", response_model=Practitioner)
def read_practitioner(id: int, db: Session = Depends(get_db)):
    return get_practitioner(db, id)

@router.get("/me/profile", response_model=Practitioner)
def read_practitioner_me(current_user: User = Depends(get_current_practitioner), db: Session = Depends(get_db)):
    return get_practitioner_by_user_id(db, current_user.id)

@router.patch("/me", response_model=Practitioner)
def update_practitioner_me(practitioner_in: PractitionerUpdate, current_user: User = Depends(get_current_practitioner), db: Session = Depends(get_db)):
    return update_practitioner_profile(db, current_user.id, practitioner_in)

# --- Multiple Clinics / Addresses ---

@router.get("/{id}/clinics", response_model=List[PractitionerClinic])
def list_clinics(id: int, db: Session = Depends(get_db)):
    return get_practitioner_clinics(db, id)

@router.post("/me/clinics", response_model=PractitionerClinic, status_code=status.HTTP_201_CREATED)
def create_clinic(clinic_in: PractitionerClinicCreate, current_user: User = Depends(get_current_practitioner), db: Session = Depends(get_db)):
    practitioner = get_practitioner_by_user_id(db, current_user.id)
    return add_practitioner_clinic(db, practitioner.id, clinic_in)

@router.delete("/me/clinics/{clinic_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_clinic(clinic_id: int, current_user: User = Depends(get_current_practitioner), db: Session = Depends(get_db)):
    practitioner = get_practitioner_by_user_id(db, current_user.id)
    delete_practitioner_clinic(db, practitioner.id, clinic_id)
    return None

# --- Practitioner Feedback & Reviews (Stars & Reviews) ---

@router.get("/{id}/reviews", response_model=List[PractitionerReview])
def list_reviews(id: int, db: Session = Depends(get_db)):
    return get_practitioner_reviews(db, id)

@router.post("/{id}/reviews", response_model=PractitionerReview, status_code=status.HTTP_201_CREATED)
def create_review(id: int, review_in: PractitionerReviewCreate, current_user: Optional[User] = Depends(get_current_user), db: Session = Depends(get_db)):
    patient_id = current_user.patient_profile.id if (current_user and hasattr(current_user, "patient_profile") and current_user.patient_profile) else None
    return submit_practitioner_review(db, id, review_in, patient_id=patient_id)

