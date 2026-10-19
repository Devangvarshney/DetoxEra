from pydantic import BaseModel
from app.models.user import UserRole

class GoogleLoginRequest(BaseModel):
    credential: str
    role: UserRole = UserRole.PATIENT
