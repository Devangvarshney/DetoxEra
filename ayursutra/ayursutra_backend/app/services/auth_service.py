from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.schemas.user import UserCreate
from app.core.security import get_password_hash
from app.schemas.patient import PatientCreate
from app.models.practitioner import Practitioner
from app.schemas.practitioner import PractitionerCreate

def create_user(db: Session, user_in: UserCreate) -> User:
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )
    
    db_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def register_patient(db: Session, user_in: UserCreate, patient_in: PatientCreate) -> User:
    # Ensure role is PATIENT
    user_in.role = UserRole.PATIENT
    db_user = create_user(db, user_in)
    
    db_patient = Patient(
        user_id=db_user.id,
        name=patient_in.name,
        phone=patient_in.phone,
        age=patient_in.age,
        gender=patient_in.gender,
        address=patient_in.address,
        profile_info=patient_in.profile_info
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_user)
    return db_user

def register_practitioner(db: Session, user_in: UserCreate, practitioner_in: PractitionerCreate) -> User:
    user_in.role = UserRole.PRACTITIONER
    db_user = create_user(db, user_in)
    
    db_practitioner = Practitioner(
        user_id=db_user.id,
        name=practitioner_in.name,
        specialization=practitioner_in.specialization,
        qualification=practitioner_in.qualification,
        experience=practitioner_in.experience,
        bio=practitioner_in.bio,
        availability=practitioner_in.availability
    )
    db.add(db_practitioner)
    db.commit()
    db.refresh(db_user)
    return db_user
