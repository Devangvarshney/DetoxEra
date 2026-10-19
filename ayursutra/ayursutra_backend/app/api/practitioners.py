from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.schemas.practitioner import Practitioner, PractitionerUpdate
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user, get_current_practitioner
from app.services.practitioner_service import get_practitioners, get_practitioner, get_practitioner_by_user_id, update_practitioner_profile
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
