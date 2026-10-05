from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import uuid
from typing import List
from database.db import get_collection
from models.schemas import TaskCreate, TaskItem, TaskUpdate
from routes.auth import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("", response_model=List[TaskItem])
def get_user_tasks(current_user: dict = Depends(get_current_user)):
    tasks_col = get_collection("tasks")
    user_id = current_user["id"]
    raw_tasks = list(tasks_col.find({"user_id": user_id}))
    
    return [
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

@router.post("", response_model=TaskItem)
def create_task(task_in: TaskCreate, current_user: dict = Depends(get_current_user)):
    tasks_col = get_collection("tasks")
    now_str = datetime.utcnow().isoformat()
    task_id = str(uuid.uuid4())
    
    task_doc = {
        "id": task_id,
        "user_id": current_user["id"],
        "subject": task_in.subject,
        "topic": task_in.topic,
        "duration_minutes": task_in.duration_minutes,
        "priority": task_in.priority,
        "recommendation": task_in.recommendation or "",
        "completed": False,
        "hours_logged": 0.0,
        "completed_at": None,
        "created_at": now_str
    }
    tasks_col.insert_one(task_doc)

    return TaskItem(**task_doc)

@router.put("/{task_id}", response_model=TaskItem)
def update_task(task_id: str, update_in: TaskUpdate, current_user: dict = Depends(get_current_user)):
    tasks_col = get_collection("tasks")
    logs_col = get_collection("performance_logs")
    
    task = tasks_col.find_one({"id": task_id, "user_id": current_user["id"]})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    updates = {}
    if update_in.completed is not None:
        updates["completed"] = update_in.completed
        if update_in.completed:
            updates["completed_at"] = datetime.utcnow().isoformat()
        else:
            updates["completed_at"] = None

    if update_in.hours_logged is not None:
        updates["hours_logged"] = update_in.hours_logged
        # Also log performance entry to feed into ML dataset!
        logs_col.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": current_user["id"],
            "subject": task.get("subject", "General"),
            "hours_spent": update_in.hours_logged,
            "tasks_completed": 1 if update_in.completed else 0,
            "logged_at": datetime.utcnow().isoformat()
        })

    tasks_col.update_one({"id": task_id}, {"$set": updates})
    updated_doc = tasks_col.find_one({"id": task_id})
    return TaskItem(**updated_doc)

@router.delete("/{task_id}")
def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    tasks_col = get_collection("tasks")
    res = tasks_col.delete_one({"id": task_id, "user_id": current_user["id"]})
    if not res:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}
