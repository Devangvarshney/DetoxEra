from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Dict, Any
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_practitioner, get_current_patient
from app.models.therapy import TherapyPlan, TherapySession, SessionStatus
from app.models.feedback import Feedback
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/practitioner")
def get_practitioner_analytics(
    current_user=Depends(get_current_practitioner),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    practitioner_id = current_user.practitioner_profile.id

    # Total plans and patients
    total_plans = db.query(TherapyPlan).filter(TherapyPlan.practitioner_id == practitioner_id).count()
    unique_patients = db.query(TherapyPlan.patient_id).filter(
        TherapyPlan.practitioner_id == practitioner_id
    ).distinct().count()

    # Session statistics
    all_sessions = (
        db.query(TherapySession)
        .join(TherapyPlan)
        .filter(TherapyPlan.practitioner_id == practitioner_id)
        .all()
    )
    total_sessions = len(all_sessions)
    completed_sessions = sum(1 for s in all_sessions if s.status == SessionStatus.COMPLETED)
    completion_rate = round((completed_sessions / total_sessions * 100) if total_sessions else 0, 1)

    # Average rating from feedback
    feedbacks = db.query(Feedback).filter(Feedback.practitioner_id == practitioner_id).all()
    avg_rating = round(sum(f.rating for f in feedbacks) / len(feedbacks), 2) if feedbacks else 0
    avg_improvement = round(
        sum(f.improvement_level for f in feedbacks if f.improvement_level) /
        max(1, len([f for f in feedbacks if f.improvement_level])), 2
    ) if feedbacks else 0

    # Sessions per month (last 6 months)
    monthly_data = []
    for i in range(5, -1, -1):
        month_start = (datetime.utcnow().replace(day=1) - timedelta(days=i * 30)).replace(day=1, hour=0, minute=0, second=0)
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        count = sum(
            1 for s in all_sessions
            if s.scheduled_date and month_start.date() <= s.scheduled_date < month_end.date()
        )
        monthly_data.append({
            "month": month_start.strftime("%b %Y"),
            "sessions": count,
            "completed": sum(
                1 for s in all_sessions
                if s.scheduled_date and month_start.date() <= s.scheduled_date < month_end.date()
                and s.status == SessionStatus.COMPLETED
            )
        })

    # Session status breakdown for donut chart
    status_breakdown = {
        "completed": completed_sessions,
        "scheduled": sum(1 for s in all_sessions if s.status == SessionStatus.SCHEDULED),
        "pending": sum(1 for s in all_sessions if s.status == SessionStatus.PENDING),
        "cancelled": sum(1 for s in all_sessions if s.status == SessionStatus.CANCELLED),
    }

    return {
        "overview": {
            "total_plans": total_plans,
            "unique_patients": unique_patients,
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "completion_rate": completion_rate,
            "avg_rating": avg_rating,
            "avg_improvement": avg_improvement,
            "total_feedback": len(feedbacks),
        },
        "monthly_sessions": monthly_data,
        "status_breakdown": status_breakdown,
    }

@router.get("/patient")
def get_patient_analytics(
    current_user=Depends(get_current_patient),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    patient_id = current_user.patient_profile.id

    plans = db.query(TherapyPlan).filter(TherapyPlan.patient_id == patient_id).all()
    total_plans = len(plans)

    all_sessions = (
        db.query(TherapySession)
        .join(TherapyPlan)
        .filter(TherapyPlan.patient_id == patient_id)
        .all()
    )
    total_sessions = len(all_sessions)
    completed_sessions = sum(1 for s in all_sessions if s.status == SessionStatus.COMPLETED)
    completion_rate = round((completed_sessions / total_sessions * 100) if total_sessions else 0, 1)

    feedbacks = db.query(Feedback).filter(Feedback.patient_id == patient_id).all()
    avg_rating_given = round(sum(f.rating for f in feedbacks) / len(feedbacks), 2) if feedbacks else 0

    # Rating trend over last sessions
    rating_trend = [{"session": i + 1, "rating": f.rating, "improvement": f.improvement_level or 0}
                    for i, f in enumerate(sorted(feedbacks, key=lambda x: x.created_at))]

    return {
        "overview": {
            "total_plans": total_plans,
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "completion_rate": completion_rate,
            "avg_rating_given": avg_rating_given,
            "total_feedback": len(feedbacks),
        },
        "rating_trend": rating_trend,
    }
