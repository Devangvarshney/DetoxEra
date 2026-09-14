from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    type: str
    title: str
    message: str
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[int] = None

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationInDBBase(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Notification(NotificationInDBBase):
    pass

class UnreadCount(BaseModel):
    count: int
