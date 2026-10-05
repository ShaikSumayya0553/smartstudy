from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

from database.db import get_database
from routes import auth, profile, study_plan, tasks, predict, dashboard
from services.ml_service import ml_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("smartstudy")

app = FastAPI(
    title="SmartStudy API",
    description="AI-Powered Personalized Study Planner & ML Performance Analytics",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(study_plan.router)
app.include_router(tasks.router)
app.include_router(predict.router)
app.include_router(dashboard.router)

@app.on_event("startup")
def on_startup():
    logger.info("Initializing SmartStudy FastAPI backend...")
    db = get_database()
    logger.info(f"Database instance ready: {db}")
    # Pre-warm ML model
    ml_service.load_model()
    logger.info("SmartStudy startup completed successfully!")

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "SmartStudy API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
