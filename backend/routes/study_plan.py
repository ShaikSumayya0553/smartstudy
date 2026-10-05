from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import uuid
from database.db import get_collection
from models.schemas import GeneratePlanRequest, StudyPlanResponse, TaskItem
from routes.auth import get_current_user
from services.ai_service import ai_service

router = APIRouter(prefix="/api/study-plan", tags=["StudyPlan"])

@router.post("/generate", response_model=StudyPlanResponse)
def generate_plan(req: GeneratePlanRequest = None, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    profiles_col = get_collection("profiles")
    tasks_col = get_collection("tasks")
    plans_col = get_collection("plans")
    logs_col = get_collection("performance_logs")

    # Fetch user profile
    profile = profiles_col.find_one({"user_id": user_id})
    if not profile and (not req or not req.subjects):
        raise HTTPException(
            status_code=400,
            detail="Study profile not found. Please setup your study profile first."
        )

    # Resolve parameters from req or profile
    subjects = [s for s in (req.subjects if req and req.subjects else profile.get("subjects", []))]
    if hasattr(subjects[0], "model_dump"):
        subjects = [s.model_dump() for s in subjects]

    available_hours = req.available_hours_per_day if (req and req.available_hours_per_day) else profile.get("available_hours_per_day", 4.0)
    exam_date = req.exam_date if (req and req.exam_date) else profile.get("exam_date", "")

    # Calculate average past performance from logs
    user_logs = logs_col.find({"user_id": user_id})
    scores = [l.get("test_score") for l in user_logs if l.get("test_score") is not None]
    avg_score = sum(scores) / len(scores) if scores else profile.get("target_score", 80.0)

    # Call AI Service
    ai_result = ai_service.generate_study_plan(
        subjects=subjects,
        available_hours_per_day=available_hours,
        exam_date=exam_date,
        past_performance=avg_score,
        focus_areas=req.focus_areas if req else ""
    )

    now_str = datetime.utcnow().isoformat()
    plan_id = str(uuid.uuid4())

    # Create task items
    generated_tasks = []
    task_models = []

    # Clean up previous uncompleted tasks for this user so regenerated plan is fresh!
    tasks_col.delete_many({"user_id": user_id, "completed": False})

    # Create task items
    generated_tasks = []
    task_models = []

    for item in ai_result.get("tasks", []):
        task_id = str(uuid.uuid4())
        task_doc = {
            "id": task_id,
            "user_id": user_id,
            "plan_id": plan_id,
            "subject": item.get("subject", "General"),
            "topic": item.get("topic", "Study Topic"),
            "duration_minutes": item.get("duration_minutes", 60),
            "priority": item.get("priority", "Medium"),
            "recommendation": item.get("recommendation", ""),
            "completed": False,
            "hours_logged": 0.0,
            "completed_at": None,
            "created_at": now_str
        }
        tasks_col.insert_one(task_doc)
        generated_tasks.append(task_doc)
        
        task_models.append(TaskItem(
            id=task_id,
            user_id=user_id,
            subject=task_doc["subject"],
            topic=task_doc["topic"],
            duration_minutes=task_doc["duration_minutes"],
            priority=task_doc["priority"],
            recommendation=task_doc["recommendation"],
            completed=False,
            hours_logged=0.0,
            completed_at=None,
            created_at=now_str
        ))

    # Days remaining calculation
    days_remaining = 14
    if exam_date:
        try:
            target_dt = datetime.strptime(exam_date, "%Y-%m-%d")
            delta = (target_dt - datetime.now()).days
            days_remaining = max(1, delta)
        except Exception:
            pass

    total_planned_hours = round(sum(t["duration_minutes"] for t in generated_tasks) / 60.0, 1)

    plan_doc = {
        "id": plan_id,
        "user_id": user_id,
        "generated_at": now_str,
        "exam_date": exam_date,
        "days_remaining": days_remaining,
        "total_study_hours_planned": total_planned_hours,
        "ai_overall_strategy": ai_result.get("ai_overall_strategy", ""),
        "task_ids": [t["id"] for t in generated_tasks]
    }
    plans_col.insert_one(plan_doc)

    return StudyPlanResponse(
        id=plan_id,
        user_id=user_id,
        generated_at=now_str,
        exam_date=exam_date,
        days_remaining=days_remaining,
        total_study_hours_planned=total_planned_hours,
        tasks=task_models,
        ai_overall_strategy=plan_doc["ai_overall_strategy"]
    )

@router.get("", response_model=StudyPlanResponse)
def get_latest_plan(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    plans_col = get_collection("plans")
    tasks_col = get_collection("tasks")

    # Find latest plan
    plans = list(plans_col.find({"user_id": user_id}))
    if not plans:
        raise HTTPException(status_code=404, detail="No study plan found. Generate one first!")

    latest_plan = sorted(plans, key=lambda p: p.get("generated_at", ""), reverse=True)[0]
    
    # Fetch tasks for current plan or user
    task_ids = set(latest_plan.get("task_ids", []))
    raw_tasks = list(tasks_col.find({"$or": [{"plan_id": latest_plan["id"]}, {"id": {"$in": list(task_ids)}}]}))
    if not raw_tasks:
        raw_tasks = list(tasks_col.find({"user_id": user_id}))

    task_models = [
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
        for t in raw_tasks
    ]

    return StudyPlanResponse(
        id=latest_plan["id"],
        user_id=user_id,
        generated_at=latest_plan.get("generated_at", ""),
        exam_date=latest_plan.get("exam_date", ""),
        days_remaining=latest_plan.get("days_remaining", 14),
        total_study_hours_planned=latest_plan.get("total_study_hours_planned", 0.0),
        tasks=task_models,
        ai_overall_strategy=latest_plan.get("ai_overall_strategy", "")
    )

