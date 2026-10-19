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
        city=practitioner_in.city,
        bio=practitioner_in.bio,
        availability=practitioner_in.availability
    )
    db.add(db_practitioner)
    db.commit()
    db.refresh(db_user)
    return db_user

def verify_google_id_token(credential: str) -> dict:
    from app.core.config import settings
    # Dev/Mock token support for testing without active Google Cloud Client ID
    if credential.startswith("demo_google_token:"):
        parts = credential.split(":")
        email = parts[1] if len(parts) > 1 else "demo.google@ayursutra.com"
        name = parts[2] if len(parts) > 2 else "Demo Google User"
        return {"email": email, "name": name, "email_verified": True}

    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests

    try:
        req = google_requests.Request()
        id_info = id_token.verify_oauth2_token(
            credential,
            req,
            settings.GOOGLE_CLIENT_ID if settings.GOOGLE_CLIENT_ID else None,
            clock_skew_in_seconds=60,
        )
        return id_info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {str(e)}",
        )

def login_or_register_google_user(db: Session, credential: str, role: UserRole) -> dict:
    import secrets
    from datetime import timedelta
    from app.core.config import settings
    from app.core.security import create_access_token

    payload = verify_google_id_token(credential)
    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account did not provide an email address.",
        )

    name = payload.get("name") or email.split("@")[0].capitalize()

    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Create new user with requested role
        random_pass = secrets.token_urlsafe(24)
        user = User(
            email=email,
            hashed_password=get_password_hash(random_pass),
            role=role,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Create corresponding profile
        if role == UserRole.PATIENT:
            patient = Patient(
                user_id=user.id,
                name=name,
                phone="",
                age=None,
                gender="Not specified",
                address="",
                profile_info="Registered via Google",
            )
            db.add(patient)
        elif role == UserRole.PRACTITIONER:
            practitioner = Practitioner(
                user_id=user.id,
                name=name,
                specialization="Ayurveda",
                qualification="BAMS",
                experience="1 year",
                city="Delhi NCR",
                bio="Ayurvedic Practitioner registered via Google",
                availability="Mon-Fri",
            )
            db.add(practitioner)

        db.commit()
        db.refresh(user)

    # Issue JWT token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, role=user.role, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "email": user.email,
    }

