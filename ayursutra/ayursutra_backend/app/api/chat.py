from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.schemas.chat import ChatMessage, ChatMessageCreate, ChatStatus
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.services.chat_service import get_chat_history, send_chat_message
from app.models.user import User

router = APIRouter()

@router.get("/{request_id}", response_model=ChatStatus)
def read_chat(request_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_chat_history(db, request_id, current_user.id)

@router.post("/{request_id}", response_model=ChatMessage, status_code=status.HTTP_201_CREATED)
def create_chat_message(request_id: int, message_in: ChatMessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return send_chat_message(db, request_id, message_in, current_user.id)
