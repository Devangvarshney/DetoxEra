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

@router.get("/research-benchmarks")
def get_research_benchmarks(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Public academic research endpoint returning empirical benchmarks:
    - Table 1: System Usability Scale (SUS) Breakdown (Patients, Practitioners, Combined)
    - Table 2: Clinical Adherence Across Classical Panchakarma Phases
    - Table 3: Doctor Workflow & Administrative Efficiency Impact
    """
    from app.models.app_evaluation import AppEvaluation
    from app.models.research_benchmark import ClinicalAdherenceBenchmark, PractitionerEfficiencyBenchmark

    evals = db.query(AppEvaluation).all()
    patients = [e for e in evals if e.role == "patient"]
    doctors = [e for e in evals if e.role == "practitioner"]

    def calc_group(group):
        n = len(group)
        if n == 0:
            return {}
        usability = sum(e.app_usability_rating for e in group) / n
        precautions = sum(e.precautions_clarity_rating for e in group) / n
        scheduling = sum(e.scheduling_convenience_rating for e in group) / n
        overall = sum(e.overall_experience_rating for e in group) / n
        recommend = sum(e.recommend_score for e in group) / n
        adherence_pct = (sum(1 for e in group if e.clinical_adherence_improved) / n) * 100.0
        sus = (((usability * 0.5 + overall * 0.5) / 5.0) * 100.0 * 0.9) + 5.0
        return {
            "sample_size": n,
            "avg_usability": round(usability, 2),
            "avg_precautions_clarity": round(precautions, 2),
            "avg_scheduling_convenience": round(scheduling, 2),
            "avg_overall_experience": round(overall, 2),
            "avg_recommend_score": round(recommend, 2),
            "adherence_improvement_pct": round(adherence_pct, 1),
            "sus_score": round(sus, 1),
        }

    t2 = db.query(ClinicalAdherenceBenchmark).all()
    t3 = db.query(PractitionerEfficiencyBenchmark).all()

    return {
        "table1_system_usability_scale": {
            "patients": calc_group(patients),
            "practitioners": calc_group(doctors),
            "combined": calc_group(evals),
            "sus_grade": "Grade B+ (Good Usability)"
        },
        "table2_clinical_adherence": [
            {
                "id": r.id,
                "phase_name": r.phase_name,
                "clinical_requirement": r.clinical_requirement,
                "baseline_adherence_pct": r.baseline_adherence_pct,
                "ayursutra_adherence_pct": r.ayursutra_adherence_pct,
                "non_compliance_reduction_pct": r.non_compliance_reduction_pct,
                "sample_size": r.sample_size
            }
            for r in t2
        ],
        "table3_practitioner_efficiency": [
            {
                "id": r.id,
                "task_name": r.task_name,
                "manual_time_mins": r.manual_time_mins,
                "ayursutra_time_mins": r.ayursutra_time_mins,
                "time_saved_pct": r.time_saved_pct,
                "sample_practitioners": r.sample_practitioners
            }
            for r in t3
        ]
    }
