from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.schemas.milestone import Milestone, MilestoneCreate, MilestoneUpdate
from app.models.therapy import TherapyMilestone, TherapyPlan
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_practitioner, get_current_user
from app.models.user import UserRole

router = APIRouter()

@router.get("/plans/{plan_id}/milestones", response_model=List[Milestone])
def get_plan_milestones(
    plan_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(TherapyPlan).filter(TherapyPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan.milestones

@router.post("/plans/{plan_id}/milestones", response_model=Milestone, status_code=status.HTTP_201_CREATED)
def create_milestone(
    plan_id: int,
    milestone_in: MilestoneCreate,
    current_user=Depends(get_current_practitioner),
    db: Session = Depends(get_db)
):
    plan = db.query(TherapyPlan).filter(TherapyPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    if plan.practitioner_id != current_user.practitioner_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db_milestone = TherapyMilestone(
        therapy_plan_id=plan_id,
        **milestone_in.model_dump()
    )
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone

@router.patch("/milestones/{milestone_id}/achieve", response_model=Milestone)
def achieve_milestone(
    milestone_id: int,
    current_user=Depends(get_current_practitioner),
    db: Session = Depends(get_db)
):
    db_milestone = db.query(TherapyMilestone).filter(TherapyMilestone.id == milestone_id).first()
    if not db_milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    if db_milestone.therapy_plan.practitioner_id != current_user.practitioner_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_milestone.is_achieved = True
    db_milestone.achieved_at = datetime.utcnow()
    db.commit()
    db.refresh(db_milestone)
    return db_milestone

@router.delete("/milestones/{milestone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_milestone(
    milestone_id: int,
    current_user=Depends(get_current_practitioner),
    db: Session = Depends(get_db)
):
    db_milestone = db.query(TherapyMilestone).filter(TherapyMilestone.id == milestone_id).first()
    if not db_milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    if db_milestone.therapy_plan.practitioner_id != current_user.practitioner_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(db_milestone)
    db.commit()
