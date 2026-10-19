from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.security import create_access_token, verify_password
from app.core.config import settings
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.schemas.auth import Token
from app.schemas.user import UserCreate, User as UserSchema
from app.schemas.patient import PatientCreate
from app.schemas.practitioner import PractitionerCreate
from app.schemas.google_auth import GoogleLoginRequest
from app.services.auth_service import register_patient, register_practitioner, login_or_register_google_user
from app.models.user import User

router = APIRouter()

@router.post("/register/patient", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def register_patient_api(user_in: UserCreate, patient_in: PatientCreate, db: Session = Depends(get_db)):
    return register_patient(db, user_in, patient_in)

@router.post("/register/practitioner", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def register_practitioner_api(user_in: UserCreate, practitioner_in: PractitionerCreate, db: Session = Depends(get_db)):
    return register_practitioner(db, user_in, practitioner_in)

# Keep the original route for backward compatibility with frontend
@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, patient_in: PatientCreate, db: Session = Depends(get_db)):
    return register_patient(db, user_in, patient_in)

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, role=user.role, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google", response_model=Token)
def login_with_google(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    result = login_or_register_google_user(db, request.credential, request.role)
    return {"access_token": result["access_token"], "token_type": result["token_type"]}

@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
