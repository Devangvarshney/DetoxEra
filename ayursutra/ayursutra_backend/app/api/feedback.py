from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.schemas.feedback import Feedback, FeedbackCreate
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_patient, get_current_user
from app.services.feedback_service import submit_feedback, get_session_feedback
from app.models.user import User

router = APIRouter()

@router.post("/sessions/{session_id}", response_model=Feedback, status_code=status.HTTP_201_CREATED)
def create_feedback(session_id: int, feedback_in: FeedbackCreate, current_user: User = Depends(get_current_patient), db: Session = Depends(get_db)):
    patient_id = current_user.patient_profile.id
    return submit_feedback(db, session_id, feedback_in, patient_id)

@router.get("/sessions/{session_id}", response_model=Feedback)
def read_session_feedback(session_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_session_feedback(db, session_id, current_user.id)
