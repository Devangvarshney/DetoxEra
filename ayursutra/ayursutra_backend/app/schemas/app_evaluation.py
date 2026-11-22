from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class AppEvaluationBase(BaseModel):
    therapy_plan_id: Optional[int] = None
    therapy_title: Optional[str] = None
    days_post_therapy: int = Field(default=2, ge=1, le=30, description="Days after therapy completion (e.g. 1 or 2)")
    app_usability_rating: int = Field(ge=1, le=5, description="Ease of navigation & interface clarity (1-5)")
    precautions_clarity_rating: int = Field(ge=1, le=5, description="Clarity of Purvakarma/Paschatkarma diet & guidelines (1-5)")
    scheduling_convenience_rating: int = Field(ge=1, le=5, description="Session scheduling & notification timeliness (1-5)")
    overall_experience_rating: int = Field(ge=1, le=5, description="Overall satisfaction with AyurSutra platform (1-5)")
    recommend_score: int = Field(default=9, ge=1, le=10, description="Likelihood to recommend (1-10 NPS scale)")
    clinical_adherence_improved: bool = Field(default=True, description="Did AyurSutra help you stay disciplined to instructions?")
    liked_most: Optional[str] = Field(default=None, description="What features worked well or did you like most?")
    improvement_suggestions: Optional[str] = Field(default=None, description="Constructive suggestions for improvement")

class AppEvaluationCreate(AppEvaluationBase):
    pass

class AppEvaluationOut(AppEvaluationBase):
    id: int
    user_id: int
    role: str
    user_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AppEvaluationStats(BaseModel):
    total_evaluations: int
    patient_count: int
    practitioner_count: int
    avg_app_usability: float
    avg_precautions_clarity: float
    avg_scheduling_convenience: float
    avg_overall_experience: float
    avg_recommend_score: float
    adherence_improvement_percentage: float
    system_usability_scale_score: float # Normalized 0-100 SUS score
    recommendation_breakdown: Dict[str, int] # promoters, passives, detractors
    recent_evaluations: List[AppEvaluationOut] = []
