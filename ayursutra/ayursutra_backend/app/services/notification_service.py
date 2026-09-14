from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate

def create_notification(db: Session, notification_in: NotificationCreate) -> Notification:
    db_notification = Notification(
        user_id=notification_in.user_id,
        type=notification_in.type,
        title=notification_in.title,
        message=notification_in.message,
        related_entity_type=notification_in.related_entity_type,
        related_entity_id=notification_in.related_entity_id
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def get_user_notifications(db: Session, user_id: int):
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

def get_unread_count(db: Session, user_id: int) -> int:
    return db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).count()
