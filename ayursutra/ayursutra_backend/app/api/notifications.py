from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.schemas.notification import Notification, UnreadCount
from app.models.notification import Notification as NotificationModel
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.services.notification_service import get_user_notifications, get_unread_count
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[Notification])
def read_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_user_notifications(db, current_user.id)

@router.get("/unread-count", response_model=UnreadCount)
def read_unread_count(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    count = get_unread_count(db, current_user.id)
    return UnreadCount(count=count)

@router.patch("/{id}/read", response_model=Notification)
def mark_read(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notification = db.query(NotificationModel).filter(
        NotificationModel.id == id,
        NotificationModel.user_id == current_user.id
    ).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    notification.read_at = datetime.utcnow()
    db.commit()
    db.refresh(notification)
    return notification

@router.patch("/read-all")
def mark_all_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(NotificationModel).filter(
        NotificationModel.user_id == current_user.id,
        NotificationModel.is_read == False
    ).update({"is_read": True, "read_at": datetime.utcnow()})
    db.commit()
    return {"message": "All notifications marked as read"}
