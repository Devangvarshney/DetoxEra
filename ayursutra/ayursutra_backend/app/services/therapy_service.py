from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from fastapi import HTTPException
from datetime import datetime, timedelta
from app.models.therapy import TherapyPlan, TherapySession, SessionStatus, TherapyTemplate
from app.schemas.therapy import TherapyPlanCreate, SessionSchedule, SessionComplete
from app.services.notification_service import create_notification
from app.schemas.notification import NotificationCreate

def create_therapy_plan(db: Session, plan_in: TherapyPlanCreate, practitioner_id: int) -> TherapyPlan:
    # Verify patient relationship? Often inferred from accepted treatment request.
    from app.models.therapy import TreatmentRequest, RequestStatus
    req = db.query(TreatmentRequest).filter(
        TreatmentRequest.patient_id == plan_in.patient_id,
        TreatmentRequest.practitioner_id == practitioner_id,
        TreatmentRequest.status == RequestStatus.ACCEPTED
    ).first()
    
    if not req:
        raise HTTPException(status_code=400, detail="Must have an accepted treatment request with this patient.")
        
    db_plan = TherapyPlan(
        patient_id=plan_in.patient_id,
        practitioner_id=practitioner_id,
        template_id=plan_in.template_id,
        title=plan_in.title,
        description=plan_in.description,
        number_of_sessions=plan_in.number_of_sessions,
        session_duration=plan_in.session_duration,
        notes=plan_in.notes
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    
    # Generate sessions
    for i in range(1, plan_in.number_of_sessions + 1):
        db_session = TherapySession(
            therapy_plan_id=db_plan.id,
            session_number=i,
            duration=plan_in.session_duration
        )
        db.add(db_session)
    db.commit()
    
    # Notification for Patient
    patient_user_id = db_plan.patient.user_id
    create_notification(db, NotificationCreate(
        user_id=patient_user_id,
        type="THERAPY_PLAN_CREATED",
        title="New Therapy Plan",
        message=f"Dr. {db_plan.practitioner.name} has created a new therapy plan for you: {db_plan.title}",
        related_entity_type="therapy_plan",
        related_entity_id=db_plan.id
    ))
    
    return db_plan

def schedule_session(db: Session, session_id: int, schedule_in: SessionSchedule, practitioner_id: int) -> TherapySession:
    db_session = db.query(TherapySession).filter(TherapySession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if db_session.therapy_plan.practitioner_id != practitioner_id:
        raise HTTPException(status_code=403, detail="Not authorized to schedule this session")
        
    if db_session.status == SessionStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Cannot schedule a completed session")
        
    # Calculate end time based on start time and duration
    start_dt = datetime.combine(schedule_in.scheduled_date, schedule_in.start_time)
    end_dt = start_dt + timedelta(minutes=db_session.duration)
    
    # Ensure chronological order of sessions within the same therapy plan
    plan_sessions = db.query(TherapySession).filter(TherapySession.therapy_plan_id == db_session.therapy_plan_id).all()
    for ps in plan_sessions:
        if ps.status in [SessionStatus.SCHEDULED, SessionStatus.COMPLETED] and ps.id != session_id:
            if ps.scheduled_date and ps.start_time:
                ps_dt = datetime.combine(ps.scheduled_date, ps.start_time)
                if ps.session_number < db_session.session_number and ps_dt >= start_dt:
                    raise HTTPException(status_code=400, detail=f"Session #{db_session.session_number} must be scheduled after session #{ps.session_number}")
                if ps.session_number > db_session.session_number and ps_dt <= start_dt:
                    raise HTTPException(status_code=400, detail=f"Session #{db_session.session_number} must be scheduled before session #{ps.session_number}")

    # Check for conflicts using interval overlap logic
    # new_start < existing_end AND new_end > existing_start
    conflicts = db.query(TherapySession).join(TherapyPlan).filter(
        TherapyPlan.practitioner_id == practitioner_id,
        TherapySession.id != session_id,
        TherapySession.status == SessionStatus.SCHEDULED,
        TherapySession.scheduled_date == schedule_in.scheduled_date
    ).all()
    
    for conflict in conflicts:
        conflict_start_dt = datetime.combine(conflict.scheduled_date, conflict.start_time)
        conflict_end_dt = datetime.combine(conflict.scheduled_date, conflict.end_time)
        
        if start_dt < conflict_end_dt and end_dt > conflict_start_dt:
            raise HTTPException(status_code=409, detail="Practitioner already has a session at this time")
            
    db_session.scheduled_date = schedule_in.scheduled_date
    db_session.start_time = schedule_in.start_time
    db_session.end_time = end_dt.time()
    db_session.status = SessionStatus.SCHEDULED
    if schedule_in.pre_precautions:
        db_session.pre_precautions = schedule_in.pre_precautions
    db.commit()
    db.refresh(db_session)
    
    # Notify Patient
    msg = f"Session #{db_session.session_number} has been scheduled for {schedule_in.scheduled_date} at {schedule_in.start_time}."
    if schedule_in.pre_precautions:
        msg += f"\n\nPre-Procedure Precautions: {schedule_in.pre_precautions}"

    create_notification(db, NotificationCreate(
        user_id=db_session.therapy_plan.patient.user_id,
        type="SESSION_SCHEDULED",
        title="Session Scheduled",
        message=msg,
        related_entity_type="therapy_session",
        related_entity_id=db_session.id
    ))
    
    return db_session

def complete_session(db: Session, session_id: int, complete_in: SessionComplete, practitioner_id: int) -> TherapySession:
    db_session = db.query(TherapySession).filter(TherapySession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if db_session.therapy_plan.practitioner_id != practitioner_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if db_session.status == SessionStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Session is already completed")
        
    db_session.status = SessionStatus.COMPLETED
    db_session.completed_at = datetime.utcnow()
    if complete_in.practitioner_notes:
        db_session.practitioner_notes = complete_in.practitioner_notes
    if complete_in.post_precautions:
        db_session.post_precautions = complete_in.post_precautions
        
    db.commit()
    db.refresh(db_session)
    
    # Notify Patient
    msg = f"Session #{db_session.session_number} has been marked as completed. Please submit your feedback."
    if complete_in.post_precautions:
        msg += f"\n\nPost-Procedure Precautions: {complete_in.post_precautions}"

    create_notification(db, NotificationCreate(
        user_id=db_session.therapy_plan.patient.user_id,
        type="SESSION_COMPLETED",
        title="Session Completed",
        message=msg,
        related_entity_type="therapy_session",
        related_entity_id=db_session.id
    ))
    
    return db_session
