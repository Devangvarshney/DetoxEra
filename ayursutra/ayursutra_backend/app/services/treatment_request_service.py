from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.therapy import TreatmentRequest, RequestStatus
from app.schemas.therapy import TreatmentRequestCreate
from app.services.notification_service import create_notification
from app.schemas.notification import NotificationCreate

def create_treatment_request(db: Session, request_in: TreatmentRequestCreate, patient_id: int) -> TreatmentRequest:
    # Check if a pending or accepted request already exists for this practitioner
    existing = db.query(TreatmentRequest).filter(
        TreatmentRequest.patient_id == patient_id,
        TreatmentRequest.practitioner_id == request_in.practitioner_id,
        TreatmentRequest.status.in_([RequestStatus.PENDING, RequestStatus.ACCEPTED])
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="An active request with this practitioner already exists.")
        
    db_request = TreatmentRequest(
        patient_id=patient_id,
        practitioner_id=request_in.practitioner_id,
        message=request_in.message,
        status=RequestStatus.PENDING
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    # Notification for Practitioner
    practitioner_user_id = db_request.practitioner.user_id
    create_notification(db, NotificationCreate(
        user_id=practitioner_user_id,
        type="TREATMENT_REQUEST_RECEIVED",
        title="New Treatment Request",
        message=f"You have received a new treatment request from {db_request.patient.name}.",
        related_entity_type="treatment_request",
        related_entity_id=db_request.id
    ))
    
    return db_request

def get_sent_requests(db: Session, patient_id: int):
    return db.query(TreatmentRequest).filter(TreatmentRequest.patient_id == patient_id).all()

def get_received_requests(db: Session, practitioner_id: int):
    return db.query(TreatmentRequest).filter(TreatmentRequest.practitioner_id == practitioner_id).all()

def update_request_status(db: Session, request_id: int, new_status: RequestStatus, practitioner_id: int) -> TreatmentRequest:
    db_request = db.query(TreatmentRequest).filter(TreatmentRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    if db_request.practitioner_id != practitioner_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this request")
        
    if db_request.status != RequestStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Cannot change status from {db_request.status}")
        
    db_request.status = new_status
    db.commit()
    db.refresh(db_request)
    
    # Notification for Patient
    patient_user_id = db_request.patient.user_id
    if new_status == RequestStatus.ACCEPTED:
        title = "Treatment Request Accepted"
        message = f"Dr. {db_request.practitioner.name} has accepted your treatment request."
    else:
        title = "Treatment Request Rejected"
        message = f"Dr. {db_request.practitioner.name} has rejected your treatment request."
        
    create_notification(db, NotificationCreate(
        user_id=patient_user_id,
        type=f"TREATMENT_REQUEST_{new_status.name}",
        title=title,
        message=message,
        related_entity_type="treatment_request",
        related_entity_id=db_request.id
    ))
    
    return db_request
