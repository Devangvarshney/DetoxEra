from pydantic import BaseModel
from datetime import datetime
from typing import List

class ChatMessageBase(BaseModel):
    message: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessage(ChatMessageBase):
    id: int
    treatment_request_id: int
    sender_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ChatStatus(BaseModel):
    is_active: bool
    messages: List[ChatMessage]
