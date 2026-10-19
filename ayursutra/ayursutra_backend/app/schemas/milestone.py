from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MilestoneCreate(BaseModel):
    title: str
    description: Optional[str] = None
    target_session: Optional[int] = None

class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_session: Optional[int] = None

class Milestone(BaseModel):
    id: int
    therapy_plan_id: int
    title: str
    description: Optional[str] = None
    target_session: Optional[int] = None
    is_achieved: bool
    achieved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
