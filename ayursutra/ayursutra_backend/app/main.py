from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, patients, practitioners, treatment_requests, therapy, feedback, notifications
from app.api import analytics, milestones

app = FastAPI(title="AyurSutra API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins,
    allow_origin_regex=r"https?://.*|capacitor://.*",
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
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(milestones.router, prefix="/milestones", tags=["Milestones"])

@app.on_event("startup")
def startup_db_migration():
    try:
        from app.core.database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS city VARCHAR(255);"))
            conn.execute(text("ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS clinic_name VARCHAR(255);"))
            conn.execute(text("ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS clinic_address VARCHAR(500);"))
            conn.execute(text("ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS consultation_fee VARCHAR(50);"))
            conn.execute(text("ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS phone VARCHAR(50);"))
            conn.execute(text("ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS accreditation VARCHAR(255);"))
            conn.execute(text("ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS therapies VARCHAR(500);"))
            conn.execute(text("ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS profile_image VARCHAR(1000);"))
            conn.execute(text("ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS timing VARCHAR(255);"))
            conn.execute(text("ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS is_profile_completed BOOLEAN DEFAULT FALSE;"))
            conn.commit()
    except Exception as e:
        print(f"Database migration notice: {e}")

@app.get("/")
def read_root():
    return {"message": "AyurSutra API is running", "version": "2.0.0"}

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

