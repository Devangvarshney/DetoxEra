from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.practitioner import Practitioner
from app.schemas.practitioner import PractitionerUpdate

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
    for field, value in update_data.items():
        setattr(db_practitioner, field, value)
    
    # If clinic details are filled, automatically mark profile as completed
    if (db_practitioner.clinic_name and db_practitioner.clinic_address) or practitioner_in.is_profile_completed:
        db_practitioner.is_profile_completed = True
        
    db.commit()
    db.refresh(db_practitioner)
    return db_practitioner
