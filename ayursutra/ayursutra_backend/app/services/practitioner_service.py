from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.practitioner import Practitioner
from app.models.practitioner_clinic import PractitionerClinic
from app.models.practitioner_review import PractitionerReview
from app.schemas.practitioner import PractitionerUpdate
from app.schemas.practitioner_clinic import PractitionerClinicCreate
from app.schemas.practitioner_review import PractitionerReviewCreate

def get_practitioners(db: Session, city: Optional[str] = None, only_completed: bool = False):
    query = db.query(Practitioner)
    if only_completed:
        query = query.filter(Practitioner.is_profile_completed == True)
    if city and city.strip():
        query = query.filter(Practitioner.city.ilike(f"%{city.strip()}%"))
    return query.all()

def get_practitioner(db: Session, practitioner_id: int) -> Practitioner:
    practitioner = db.query(Practitioner).filter(Practitioner.id == practitioner_id).first()
    if not practitioner:
        raise HTTPException(status_code=404, detail="Practitioner not found")
    return practitioner

def get_practitioner_by_user_id(db: Session, user_id: int) -> Practitioner:
    practitioner = db.query(Practitioner).filter(Practitioner.user_id == user_id).first()
    if not practitioner:
        raise HTTPException(status_code=404, detail="Practitioner profile not found")
    return practitioner

def update_practitioner_profile(db: Session, user_id: int, practitioner_in: PractitionerUpdate) -> Practitioner:
    db_practitioner = get_practitioner_by_user_id(db, user_id)
    update_data = practitioner_in.model_dump(exclude_unset=True)
    
    clinics_data = update_data.pop("clinics", None)
    
    for field, value in update_data.items():
        setattr(db_practitioner, field, value)
    
    # Save multiple clinics if provided
    if clinics_data is not None:
        try:
            db.query(PractitionerClinic).filter(PractitionerClinic.practitioner_id == db_practitioner.id).delete()
            for idx, c in enumerate(clinics_data):
                clinic_obj = PractitionerClinic(
                    practitioner_id=db_practitioner.id,
                    clinic_name=c.get("clinic_name"),
                    clinic_address=c.get("clinic_address"),
                    city=c.get("city") or db_practitioner.city,
                    timing=c.get("timing") or db_practitioner.timing,
                    phone=c.get("phone") or db_practitioner.phone,
                    consultation_fee=c.get("consultation_fee") or db_practitioner.consultation_fee,
                    is_primary=(idx == 0 or c.get("is_primary", False))
                )
                db.add(clinic_obj)
                # Keep primary clinic synced on main practitioner row
                if idx == 0:
                    db_practitioner.clinic_name = clinic_obj.clinic_name
                    db_practitioner.clinic_address = clinic_obj.clinic_address
                    if clinic_obj.city:
                        db_practitioner.city = clinic_obj.city
        except Exception as e:
            print("Notice: Error syncing practitioner_clinics table:", e)
    
    # If clinic details are filled, automatically mark profile as completed
    if (db_practitioner.clinic_name and db_practitioner.clinic_address) or practitioner_in.is_profile_completed:
        db_practitioner.is_profile_completed = True
        
    db.commit()
    db.refresh(db_practitioner)
    return db_practitioner

def add_practitioner_clinic(db: Session, practitioner_id: int, clinic_in: PractitionerClinicCreate) -> PractitionerClinic:
    clinic = PractitionerClinic(
        practitioner_id=practitioner_id,
        clinic_name=clinic_in.clinic_name,
        clinic_address=clinic_in.clinic_address,
        city=clinic_in.city,
        timing=clinic_in.timing,
        phone=clinic_in.phone,
        consultation_fee=clinic_in.consultation_fee,
        is_primary=clinic_in.is_primary or False
    )
    db.add(clinic)
    db.commit()
    db.refresh(clinic)
    return clinic

def get_practitioner_clinics(db: Session, practitioner_id: int) -> List[PractitionerClinic]:
    return db.query(PractitionerClinic).filter(PractitionerClinic.practitioner_id == practitioner_id).all()

def delete_practitioner_clinic(db: Session, practitioner_id: int, clinic_id: int) -> bool:
    clinic = db.query(PractitionerClinic).filter(
        PractitionerClinic.id == clinic_id,
        PractitionerClinic.practitioner_id == practitioner_id
    ).first()
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic address not found")
    db.delete(clinic)
    db.commit()
    return True

def submit_practitioner_review(db: Session, practitioner_id: int, review_in: PractitionerReviewCreate, patient_id: Optional[int] = None) -> PractitionerReview:
    practitioner = get_practitioner(db, practitioner_id)
    review = PractitionerReview(
        practitioner_id=practitioner.id,
        patient_id=patient_id,
        patient_name=review_in.patient_name,
        rating=review_in.rating,
        review=review_in.review,
        clinic_name=review_in.clinic_name,
        clinic_address=review_in.clinic_address
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

def get_practitioner_reviews(db: Session, practitioner_id: int) -> List[PractitionerReview]:
    return db.query(PractitionerReview).filter(PractitionerReview.practitioner_id == practitioner_id).order_by(PractitionerReview.created_at.desc()).all()

