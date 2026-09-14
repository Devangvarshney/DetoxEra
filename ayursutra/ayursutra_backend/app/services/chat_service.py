from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.chat import ChatMessage
from app.models.therapy import TreatmentRequest, RequestStatus, TherapyPlan, TherapySession, SessionStatus
from app.schemas.chat import ChatMessageCreate, ChatStatus

def is_chat_active(db: Session, request_id: int) -> bool:
    req = db.query(TreatmentRequest).filter(TreatmentRequest.id == request_id).first()
    if not req:
        return False
    
    # Must be accepted
    if req.status != RequestStatus.ACCEPTED:
        return False
        
    # Check if a therapy plan exists for this request
    plan = db.query(TherapyPlan).filter(
        TherapyPlan.patient_id == req.patient_id,
        TherapyPlan.practitioner_id == req.practitioner_id
    ).first()
    
    if plan:
        # If plan exists, chat is active ONLY IF there are incomplete sessions
        sessions = db.query(TherapySession).filter(TherapySession.therapy_plan_id == plan.id).all()
        if sessions:
            all_completed = all(s.status == SessionStatus.COMPLETED for s in sessions)
            if all_completed:
                return False
                
    return True

def get_chat_history(db: Session, request_id: int, user_id: int) -> ChatStatus:
    req = db.query(TreatmentRequest).filter(TreatmentRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Treatment request not found")
        
    if req.patient.user_id != user_id and req.practitioner.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this chat")
        
    messages = db.query(ChatMessage).filter(ChatMessage.treatment_request_id == request_id).order_by(ChatMessage.created_at.asc()).all()
    active = is_chat_active(db, request_id)
    
    return ChatStatus(is_active=active, messages=messages)

def send_chat_message(db: Session, request_id: int, message_in: ChatMessageCreate, user_id: int) -> ChatMessage:
    req = db.query(TreatmentRequest).filter(TreatmentRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Treatment request not found")
        
    if req.patient.user_id != user_id and req.practitioner.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to send messages in this chat")
        
    if not is_chat_active(db, request_id):
        raise HTTPException(status_code=400, detail="Chat is closed.")
        
    new_msg = ChatMessage(
        treatment_request_id=request_id,
        sender_id=user_id,
        message=message_in.message
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    
    return new_msg
