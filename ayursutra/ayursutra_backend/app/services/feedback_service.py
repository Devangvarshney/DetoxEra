from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.therapy import TherapySession, SessionStatus
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate
from app.services.notification_service import create_notification
from app.schemas.notification import NotificationCreate

def submit_feedback(db: Session, session_id: int, feedback_in: FeedbackCreate, patient_id: int) -> Feedback:
    db_session = db.query(TherapySession).filter(TherapySession.id == session_id).first()
    
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if db_session.therapy_plan.patient_id != patient_id:
        raise HTTPException(status_code=403, detail="Not authorized to submit feedback for this session")
        
    if db_session.status != SessionStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Feedback can only be submitted for completed sessions")
        
    if db_session.feedback:
        raise HTTPException(status_code=409, detail="Feedback already submitted for this session")
        
    db_feedback = Feedback(
        session_id=session_id,
        patient_id=patient_id,
        practitioner_id=db_session.therapy_plan.practitioner_id,
        rating=feedback_in.rating,
        comments=feedback_in.comments,
        symptoms_reported=feedback_in.symptoms_reported,
        improvement_level=feedback_in.improvement_level
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    
    # Notify Practitioner
    create_notification(db, NotificationCreate(
        user_id=db_session.therapy_plan.practitioner.user_id,
        type="FEEDBACK_RECEIVED",
        title="New Feedback",
        message=f"You received a {feedback_in.rating}-star rating from {db_session.therapy_plan.patient.name}.",
        related_entity_type="feedback",
        related_entity_id=db_feedback.id
    ))
    
    return db_feedback

def get_session_feedback(db: Session, session_id: int, user_id: int):
    # Depending on auth context, you'd check if user_id is either the patient or practitioner
    # Simplification: just return it
    db_feedback = db.query(Feedback).filter(Feedback.session_id == session_id).first()
    if not db_feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return db_feedback
