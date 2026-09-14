from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, patients, practitioners, treatment_requests, therapy, feedback, notifications, chat

app = FastAPI(title="AyurSutra API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(patients.router, prefix="/patients", tags=["Patients"])
app.include_router(practitioners.router, prefix="/practitioners", tags=["Practitioners"])
app.include_router(treatment_requests.router, prefix="/treatment-requests", tags=["Treatment Requests"])
app.include_router(therapy.router, prefix="/therapy", tags=["Therapy"])
app.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])

@app.get("/")
def read_root():
    return {"message": "AyurSutra API is running"}

@app.get("/health")
def read_health():
    try:
        from app.core.database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}
