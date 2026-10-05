from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import uuid
from database.db import get_collection
from models.schemas import PredictRequest, PredictResponse, PerformanceLogCreate
from routes.auth import get_current_user
from services.ml_service import ml_service

router = APIRouter(prefix="/api/predict", tags=["Predict"])

@router.post("", response_model=PredictResponse)
def predict_performance(req: PredictRequest = None, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    tasks_col = get_collection("tasks")
    logs_col = get_collection("performance_logs")

    if req:
        study_hours = req.study_hours
        tasks_completed = req.tasks_completed
        completion_rate = req.completion_rate
        avg_past_score = req.avg_past_score
        days_studied = req.days_studied
    else:
        # Calculate automatically from database history!
        user_tasks = list(tasks_col.find({"user_id": user_id}))
        total_tasks = len(user_tasks)
        completed_tasks = sum(1 for t in user_tasks if t.get("completed", False))
        completion_rate = (completed_tasks / total_tasks) if total_tasks > 0 else 0.5
        
        study_hours = sum(t.get("hours_logged", 0.0) for t in user_tasks)
        
        user_logs = list(logs_col.find({"user_id": user_id}))
        scores = [l.get("test_score") for l in user_logs if l.get("test_score") is not None]
        avg_past_score = sum(scores) / len(scores) if scores else 75.0
        days_studied = max(1, len(set(l.get("logged_at", "")[:10] for l in user_logs)))

    result = ml_service.predict(
        study_hours=study_hours,
        tasks_completed=tasks_completed if req else completed_tasks,
        completion_rate=completion_rate,
        avg_past_score=avg_past_score,
        days_studied=days_studied
    )

    # Store prediction history
    pred_col = get_collection("predictions")
    pred_col.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "predicted_score": result["predicted_score"],
        "category": result["category"],
        "risk_level": result["risk_level"],
        "predicted_at": datetime.utcnow().isoformat()
    })

    return PredictResponse(**result)

@router.post("/log-score")
def log_performance_entry(entry: PerformanceLogCreate, current_user: dict = Depends(get_current_user)):
    logs_col = get_collection("performance_logs")
    log_id = str(uuid.uuid4())
    now_str = datetime.utcnow().isoformat()

    doc = {
        "id": log_id,
        "user_id": current_user["id"],
        "subject": entry.subject,
        "hours_spent": entry.hours_spent,
        "tasks_completed": entry.tasks_completed,
        "test_score": entry.test_score,
        "notes": entry.notes or "",
        "logged_at": now_str
    }
    logs_col.insert_one(doc)

    # Get updated ML prediction immediately
    user_id = current_user["id"]
    user_logs = list(logs_col.find({"user_id": user_id}))
    scores = [l.get("test_score") for l in user_logs if l.get("test_score") is not None]
    avg_score = sum(scores) / len(scores) if scores else 75.0
    
    total_hours = sum(l.get("hours_spent", 0.0) for l in user_logs)
    total_tasks = sum(l.get("tasks_completed", 0) for l in user_logs)
    days_cnt = len(set(l.get("logged_at", "")[:10] for l in user_logs))

    updated_pred = ml_service.predict(
        study_hours=total_hours,
        tasks_completed=total_tasks,
        completion_rate=min(1.0, total_tasks / max(1, total_tasks + 2)),
        avg_past_score=avg_score,
        days_studied=max(1, days_cnt)
    )

    return {
        "message": "Performance log recorded successfully",
        "log_id": log_id,
        "new_prediction": updated_pred
    }

@router.get("/history")
def get_performance_history(current_user: dict = Depends(get_current_user)):
    logs_col = get_collection("performance_logs")
    logs = list(logs_col.find({"user_id": current_user["id"]}))
    for l in logs:
        l.pop("_id", None)
    return sorted(logs, key=lambda x: x.get("logged_at", ""), reverse=True)
