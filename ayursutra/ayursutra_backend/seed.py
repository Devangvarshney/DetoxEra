import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.models.practitioner import Practitioner
from app.models.therapy import TherapyTemplate
from app.core.security import get_password_hash

def seed_db():
    db = SessionLocal()
    
    # Check if practitioners exist
    if db.query(Practitioner).first():
        print("Database already seeded.")
        return
        
    print("Seeding database...")
    
    # Practitioners
    practitioners_data = [
        {
            "name": "Dr. Ananya Sharma",
            "email": "ananya@ayursutra.com",
            "specialization": "Ayurveda",
            "experience": "8 years",
            "bio": "Expert in holistic Ayurvedic healing.",
            "qualification": "BAMS"
        },
        {
            "name": "Dr. Rahul Verma",
            "email": "rahul@ayursutra.com",
            "specialization": "Panchakarma",
            "experience": "10 years",
            "bio": "Specialist in detoxification therapies.",
            "qualification": "MD (Ayurveda)"
        },
        {
            "name": "Dr. Meera Kapoor",
            "email": "meera@ayursutra.com",
            "specialization": "Ayurvedic Wellness",
            "experience": "6 years",
            "bio": "Focuses on diet and lifestyle management.",
            "qualification": "BAMS"
        }
    ]
    
    for p_data in practitioners_data:
        user = User(
            email=p_data["email"],
            hashed_password=get_password_hash("password123"),
            role=UserRole.PRACTITIONER
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        practitioner = Practitioner(
            user_id=user.id,
            name=p_data["name"],
            specialization=p_data["specialization"],
            experience=p_data["experience"],
            bio=p_data["bio"],
            qualification=p_data["qualification"]
        )
        db.add(practitioner)
        
    # Templates
    templates = [
        {
            "name": "Stress Management",
            "description": "A comprehensive therapy plan to relieve stress and anxiety.",
            "recommended_session_count": 5,
            "default_session_duration": 60,
            "instructions": "Follow the prescribed diet. Practice daily meditation."
        },
        {
            "name": "Joint Mobility",
            "description": "Targeted therapies for improving joint health and reducing pain.",
            "recommended_session_count": 7,
            "default_session_duration": 45,
            "instructions": "Avoid cold foods. Apply recommended oils."
        }
    ]
    
    for t_data in templates:
        template = TherapyTemplate(**t_data)
        db.add(template)
        
    db.commit()
    print("Database seeded successfully.")
    
if __name__ == "__main__":
    seed_db()
