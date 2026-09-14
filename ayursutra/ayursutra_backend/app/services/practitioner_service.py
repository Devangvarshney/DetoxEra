from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.practitioner import Practitioner
from app.schemas.practitioner import PractitionerUpdate

def get_practitioners(db: Session):
    return db.query(Practitioner).all()

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
    db.commit()
    db.refresh(db_practitioner)
    return db_practitioner
