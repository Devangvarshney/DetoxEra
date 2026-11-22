from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.feedback import Feedback, FeedbackCreate
from app.schemas.app_evaluation import AppEvaluationCreate, AppEvaluationOut, AppEvaluationStats
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_patient, get_current_user
from app.services.feedback_service import (
    submit_feedback, 
    get_session_feedback, 
    submit_app_evaluation, 
    get_app_evaluation_stats
)
from app.models.app_evaluation import AppEvaluation
from app.models.user import User

router = APIRouter()

@router.post("/sessions/{session_id}", response_model=Feedback, status_code=status.HTTP_201_CREATED)
def create_feedback(session_id: int, feedback_in: FeedbackCreate, current_user: User = Depends(get_current_patient), db: Session = Depends(get_db)):
    patient_id = current_user.patient_profile.id
    return submit_feedback(db, session_id, feedback_in, patient_id)

@router.get("/sessions/{session_id}", response_model=Feedback)
def read_session_feedback(session_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_session_feedback(db, session_id, current_user.id)

# ─── Post-Therapy (1-2 Days) App Experience & Evaluation Survey Endpoints ───

@router.post("/app-evaluation", response_model=AppEvaluationOut, status_code=status.HTTP_201_CREATED)
def create_app_evaluation(
    eval_in: AppEvaluationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits a post-therapy (1-2 days after therapy) App Evaluation survey from a Patient or Doctor.
    Evaluates usability, precaution adherence assistance, scheduling, and qualitative suggestions.
    """
    return submit_app_evaluation(db, current_user, eval_in)

@router.get("/app-evaluation/stats", response_model=AppEvaluationStats)
def read_app_evaluation_stats(db: Session = Depends(get_db)):
    """
    Returns empirical numerical figures, ratings averages, SUS (System Usability Scale) score,
    and qualitative feedback breakdown for academic reports and research papers.
    """
    return get_app_evaluation_stats(db)

@router.get("/app-evaluation/recent", response_model=List[AppEvaluationOut])
def read_recent_app_evaluations(db: Session = Depends(get_db)):
    """
    Returns recent app evaluation surveys submitted by patients and practitioners.
    """
    evals = db.query(AppEvaluation).order_by(AppEvaluation.created_at.desc()).limit(20).all()
    return evals
