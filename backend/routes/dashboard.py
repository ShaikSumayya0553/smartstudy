from fastapi import APIRouter, Depends
from database.db import get_collection
from models.schemas import DashboardData, TaskItem, StudyProfileResponse, PredictResponse
from routes.auth import get_current_user
from services.ml_service import ml_service

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardData)
def get_dashboard_summary(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    profiles_col = get_collection("profiles")
    tasks_col = get_collection("tasks")
    logs_col = get_collection("performance_logs")

    # Profile
    raw_prof = profiles_col.find_one({"user_id": user_id})
    user_profile = None
    if raw_prof:
        user_profile = StudyProfileResponse(
            id=raw_prof["id"],
            user_id=raw_prof["user_id"],
            subjects=raw_prof.get("subjects", []),
            available_hours_per_day=raw_prof.get("available_hours_per_day", 4.0),
            exam_date=raw_prof.get("exam_date", ""),
            target_score=raw_prof.get("target_score", 85.0),
            learning_style=raw_prof.get("learning_style", "Visual & Practical"),
            updated_at=raw_prof.get("updated_at", "")
        )

    # Tasks
    user_tasks = list(tasks_col.find({"user_id": user_id}))
    total_tasks = len(user_tasks)
    completed_tasks = sum(1 for t in user_tasks if t.get("completed", False))
    completion_rate = round((completed_tasks / total_tasks * 100.0), 1) if total_tasks > 0 else 0.0
    total_hours_logged = round(sum(t.get("hours_logged", 0.0) for t in user_tasks), 1)

    # Subject-wise progress
    subject_map = {}
    for t in user_tasks:
        subj = t.get("subject", "General")
        if subj not in subject_map:
            subject_map[subj] = {"subject": subj, "total": 0, "completed": 0, "hours": 0.0}
        subject_map[subj]["total"] += 1
        if t.get("completed", False):
            subject_map[subj]["completed"] += 1
        subject_map[subj]["hours"] += t.get("hours_logged", 0.0)

    subject_progress = []
    for subj, data in subject_map.items():
        pct = round((data["completed"] / data["total"] * 100.0), 1) if data["total"] > 0 else 0.0
        subject_progress.append({
            "subject": subj,
            "total_tasks": data["total"],
            "completed_tasks": data["completed"],
            "completion_percentage": pct,
            "hours_logged": round(data["hours"], 1)
        })

    # Performance logs & past scores
    user_logs = list(logs_col.find({"user_id": user_id}))
    scores = [l.get("test_score") for l in user_logs if l.get("test_score") is not None]
    avg_test_score = round(sum(scores) / len(scores), 1) if scores else (raw_prof.get("target_score", 80.0) if raw_prof else 75.0)

    days_cnt = max(1, len(set(l.get("logged_at", "")[:10] for l in user_logs)))

    # ML Prediction
    ml_pred = ml_service.predict(
        study_hours=total_hours_logged,
        tasks_completed=completed_tasks,
        completion_rate=(completed_tasks / total_tasks) if total_tasks > 0 else 0.5,
        avg_past_score=avg_test_score,
        days_studied=days_cnt
    )
    latest_prediction = PredictResponse(**ml_pred)

    # Recent tasks
    recent_tasks_raw = sorted(user_tasks, key=lambda x: x.get("created_at", ""), reverse=True)[:10]
    recent_tasks = [
        TaskItem(
            id=t["id"],
            user_id=t["user_id"],
            subject=t["subject"],
            topic=t["topic"],
            duration_minutes=t.get("duration_minutes", 60),
            priority=t.get("priority", "Medium"),
            recommendation=t.get("recommendation", ""),
            completed=t.get("completed", False),
            hours_logged=t.get("hours_logged", 0.0),
            completed_at=t.get("completed_at"),
            created_at=t.get("created_at", "")
        )
        for t in recent_tasks_raw
    ]

    return DashboardData(
        user_profile=user_profile,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        completion_rate=completion_rate,
        total_hours_logged=total_hours_logged,
        avg_test_score=avg_test_score,
        subject_progress=subject_progress,
        latest_prediction=latest_prediction,
        recent_tasks=recent_tasks
    )
