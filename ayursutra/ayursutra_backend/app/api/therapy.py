from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.schemas.therapy import TherapyPlan, TherapyPlanCreate, TherapySession, SessionSchedule, SessionComplete, TherapyProgress, TherapyTemplate
from app.models.therapy import TherapyPlan as TherapyPlanModel, TherapyTemplate as TherapyTemplateModel
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_patient, get_current_practitioner, get_current_user
from app.services.therapy_service import create_therapy_plan, schedule_session, complete_session
from app.models.user import User, UserRole

router = APIRouter()

@router.get("/templates", response_model=List[TherapyTemplate])
def list_therapy_templates(db: Session = Depends(get_db)):
    """List all available Panchakarma therapy templates."""
    return db.query(TherapyTemplateModel).all()

@router.post("/plans", response_model=TherapyPlan, status_code=status.HTTP_201_CREATED)
def create_plan(plan_in: TherapyPlanCreate, current_user: User = Depends(get_current_practitioner), db: Session = Depends(get_db)):
    practitioner_id = current_user.practitioner_profile.id
    return create_therapy_plan(db, plan_in, practitioner_id)

@router.get("/plans", response_model=List[TherapyPlan])
def read_plans(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == UserRole.PATIENT:
        return db.query(TherapyPlanModel).filter(TherapyPlanModel.patient_id == current_user.patient_profile.id).all()
    elif current_user.role == UserRole.PRACTITIONER:
        return db.query(TherapyPlanModel).filter(TherapyPlanModel.practitioner_id == current_user.practitioner_profile.id).all()
    return []

@router.get("/plans/{plan_id}", response_model=TherapyPlan)
def read_plan(plan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.query(TherapyPlanModel).filter(TherapyPlanModel.id == plan_id).first()
    return plan

@router.get("/plans/{plan_id}/sessions", response_model=List[TherapySession])
def read_plan_sessions(plan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.query(TherapyPlanModel).filter(TherapyPlanModel.id == plan_id).first()
    if plan:
        return plan.sessions
    return []

@router.get("/sessions", response_model=List[TherapySession])
def read_all_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.therapy import TherapySession as TherapySessionModel
    if current_user.role == UserRole.PATIENT:
        return db.query(TherapySessionModel).join(TherapyPlanModel).filter(TherapyPlanModel.patient_id == current_user.patient_profile.id).all()
    elif current_user.role == UserRole.PRACTITIONER:
        return db.query(TherapySessionModel).join(TherapyPlanModel).filter(TherapyPlanModel.practitioner_id == current_user.practitioner_profile.id).all()
    return []

@router.get("/plans/{plan_id}/progress", response_model=TherapyProgress)
def read_plan_progress(plan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.query(TherapyPlanModel).filter(TherapyPlanModel.id == plan_id).first()
    if not plan:
        return None
    total = len(plan.sessions)
    completed = sum(1 for s in plan.sessions if s.status == "completed")
    scheduled = sum(1 for s in plan.sessions if s.status == "scheduled")
    percentage = (completed / total * 100) if total > 0 else 0
    return TherapyProgress(
        therapy_plan_id=plan_id,
        total_sessions=total,
        completed_sessions=completed,
        scheduled_sessions=scheduled,
        progress_percentage=percentage
    )

@router.patch("/sessions/{session_id}/schedule", response_model=TherapySession)
def schedule_therapy_session(session_id: int, schedule_in: SessionSchedule, current_user: User = Depends(get_current_practitioner), db: Session = Depends(get_db)):
    practitioner_id = current_user.practitioner_profile.id
    return schedule_session(db, session_id, schedule_in, practitioner_id)

@router.patch("/sessions/{session_id}/complete", response_model=TherapySession)
def complete_therapy_session(session_id: int, complete_in: SessionComplete, current_user: User = Depends(get_current_practitioner), db: Session = Depends(get_db)):
    practitioner_id = current_user.practitioner_profile.id
    return complete_session(db, session_id, complete_in, practitioner_id)

@router.get("/plans/{plan_id}/feedback-chart")
def read_feedback_chart(plan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.therapy import TherapySession as TherapySessionModel
    from app.models.feedback import Feedback
    
    sessions = db.query(TherapySessionModel).filter(TherapySessionModel.therapy_plan_id == plan_id).order_by(TherapySessionModel.session_number.asc()).all()
    
    chart_data = []
    for s in sessions:
        if s.status == "completed":
            feedback = db.query(Feedback).filter(Feedback.session_id == s.id).first()
            if feedback:
                chart_data.append({
                    "name": f"S{s.session_number}",
                    "rating": feedback.rating
                })
    return chart_data
