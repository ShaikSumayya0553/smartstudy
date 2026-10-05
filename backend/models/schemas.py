from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# Authentication Schemas
class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = "Student"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    full_name: str
    created_at: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Study Profile Schemas
class SubjectSkill(BaseModel):
    subject: str
    level: str  # Beginner, Intermediate, Advanced

class StudyProfileCreate(BaseModel):
    subjects: List[SubjectSkill]
    available_hours_per_day: float = Field(..., gt=0, le=16)
    exam_date: str  # YYYY-MM-DD
    target_score: Optional[float] = 85.0
    learning_style: Optional[str] = "Visual & Practical"

class StudyProfileResponse(StudyProfileCreate):
    id: str
    user_id: str
    updated_at: str

# Study Task Schemas
class TaskCreate(BaseModel):
    subject: str
    topic: str
    duration_minutes: int
    priority: str  # High, Medium, Low
    recommendation: Optional[str] = ""

class TaskItem(TaskCreate):
    id: str
    user_id: str
    completed: bool = False
    hours_logged: float = 0.0
    completed_at: Optional[str] = None
    created_at: str

class TaskUpdate(BaseModel):
    completed: Optional[bool] = None
    hours_logged: Optional[float] = None

# Study Plan Schemas
class StudyPlanItem(BaseModel):
    subject: str
    topic: str
    duration_minutes: int
    priority: str
    recommendation: str

class GeneratePlanRequest(BaseModel):
    subjects: Optional[List[SubjectSkill]] = None
    available_hours_per_day: Optional[float] = None
    exam_date: Optional[str] = None
    focus_areas: Optional[str] = ""

class StudyPlanResponse(BaseModel):
    id: str
    user_id: str
    generated_at: str
    exam_date: str
    days_remaining: int
    total_study_hours_planned: float
    tasks: List[TaskItem]
    ai_overall_strategy: str

# Performance & ML Schemas
class PerformanceLogCreate(BaseModel):
    subject: str
    hours_spent: float
    tasks_completed: int
    test_score: Optional[float] = None
    notes: Optional[str] = ""

class PredictRequest(BaseModel):
    study_hours: float
    tasks_completed: int
    completion_rate: float
    avg_past_score: float
    days_studied: int = 1

class PredictResponse(BaseModel):
    predicted_score: float
    confidence: float
    category: str
    risk_level: str
    key_factors: List[str]
    actionable_tips: List[str]

class DashboardData(BaseModel):
    user_profile: Optional[StudyProfileResponse] = None
    total_tasks: int
    completed_tasks: int
    completion_rate: float
    total_hours_logged: float
    avg_test_score: float
    subject_progress: List[dict]
    latest_prediction: Optional[PredictResponse] = None
    recent_tasks: List[TaskItem]
