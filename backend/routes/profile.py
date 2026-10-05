from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import uuid
from database.db import get_collection
from models.schemas import StudyProfileCreate, StudyProfileResponse
from routes.auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.get("", response_model=StudyProfileResponse)
def get_profile(current_user: dict = Depends(get_current_user)):
    profiles_col = get_collection("profiles")
    profile = profiles_col.find_one({"user_id": current_user["id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Study profile not found. Please create one.")
    
    return StudyProfileResponse(
        id=profile["id"],
        user_id=profile["user_id"],
        subjects=profile.get("subjects", []),
        available_hours_per_day=profile.get("available_hours_per_day", 4.0),
        exam_date=profile.get("exam_date", ""),
        target_score=profile.get("target_score", 85.0),
        learning_style=profile.get("learning_style", "Visual & Practical"),
        updated_at=profile.get("updated_at", "")
    )

@router.post("", response_model=StudyProfileResponse)
def create_or_update_profile(profile_in: StudyProfileCreate, current_user: dict = Depends(get_current_user)):
    profiles_col = get_collection("profiles")
    now_str = datetime.utcnow().isoformat()
    
    existing = profiles_col.find_one({"user_id": current_user["id"]})
    subjects_data = [s.model_dump() for s in profile_in.subjects]
    
    if existing:
        profiles_col.update_one(
            {"user_id": current_user["id"]},
            {"$set": {
                "subjects": subjects_data,
                "available_hours_per_day": profile_in.available_hours_per_day,
                "exam_date": profile_in.exam_date,
                "target_score": profile_in.target_score,
                "learning_style": profile_in.learning_style,
                "updated_at": now_str
            }}
        )
        profile_id = existing["id"]
    else:
        profile_id = str(uuid.uuid4())
        doc = {
            "id": profile_id,
            "user_id": current_user["id"],
            "subjects": subjects_data,
            "available_hours_per_day": profile_in.available_hours_per_day,
            "exam_date": profile_in.exam_date,
            "target_score": profile_in.target_score,
            "learning_style": profile_in.learning_style,
            "updated_at": now_str
        }
        profiles_col.insert_one(doc)

    return StudyProfileResponse(
        id=profile_id,
        user_id=current_user["id"],
        subjects=profile_in.subjects,
        available_hours_per_day=profile_in.available_hours_per_day,
        exam_date=profile_in.exam_date,
        target_score=profile_in.target_score,
        learning_style=profile_in.learning_style,
        updated_at=now_str
    )
