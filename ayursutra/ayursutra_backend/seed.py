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
            "name": "Vamana (Therapeutic Emesis)",
            "description": "Vamana is a Panchakarma therapy designed to eliminate excess Kapha dosha from the body through medically induced vomiting. It is particularly effective for respiratory conditions, skin diseases, and obesity.",
            "recommended_session_count": 7,
            "default_session_duration": 90,
            "instructions": "Pre-procedure: Consume oil-rich foods (Snehana) for 3–5 days. Avoid cold, heavy, or curd-based foods. Procedure day: Take Vamaka Yoga as prescribed. Post-procedure: Consume light, warm Khichdi for 3 days. Rest and avoid exertion."
        },
        {
            "name": "Virechana (Therapeutic Purgation)",
            "description": "Virechana eliminates excess Pitta dosha through the lower channels via medicated purgation. It is highly effective for liver disorders, skin diseases, chronic fever, and digestive issues.",
            "recommended_session_count": 5,
            "default_session_duration": 60,
            "instructions": "Pre-procedure: 3-day internal oleation (Sneha) as prescribed. Avoid irritating or spicy foods. Procedure day: Take prescribed Virechana medication on an empty stomach. Post-procedure: Begin with liquid diet, progress to solid food over 5 days. Avoid excessive physical activity."
        },
        {
            "name": "Basti (Medicated Enema Therapy)",
            "description": "Basti is considered the most effective Panchakarma therapy, targeting Vata dosha imbalances through medicated enemas. It is beneficial for neuromuscular disorders, constipation, arthritis, and back pain.",
            "recommended_session_count": 15,
            "default_session_duration": 45,
            "instructions": "Pre-procedure: Light diet the previous evening. Avoid excessive activity. Two types: Anuvasana Basti (oil-based) and Niruha Basti (decoction-based). Post-procedure: Rest for at least 30 minutes. Follow prescribed diet. Avoid cold environments."
        },
        {
            "name": "Nasya (Nasal Drug Administration)",
            "description": "Nasya involves administering medicated oils or powders through the nasal passage to cleanse and nourish the upper respiratory tract. It is effective for migraines, sinusitis, hair loss, and neurological conditions.",
            "recommended_session_count": 7,
            "default_session_duration": 30,
            "instructions": "Pre-procedure: Steam inhalation and gentle face massage. Lie in a supine position with head tilted back. Procedure: Administer prescribed nasal drops. Remain reclined for 5 minutes after administration. Post-procedure: Avoid cold water, cold foods, and cold environments. Gargle with warm salt water."
        },
        {
            "name": "Raktamokshana (Blood Purification)",
            "description": "Raktamokshana is a specialized Panchakarma therapy for purifying blood and eliminating toxins related to blood-borne disorders. It is effective for skin diseases, gout, varicose veins, and inflammatory conditions.",
            "recommended_session_count": 3,
            "default_session_duration": 60,
            "instructions": "Pre-procedure: Avoid blood thinners and alcohol for 1 week. Stay hydrated. Procedure: Performed by trained Ayurvedic physician using either leeches or controlled venesection. Post-procedure: Apply prescribed medicated paste. Avoid sun exposure. Light diet for 2 days."
        },
        {
            "name": "Shirodhara (Third Eye Oil Treatment)",
            "description": "Shirodhara is a calming therapy where warm medicated oil is poured in a continuous stream over the forehead (third eye area). It deeply relaxes the nervous system, reduces stress, anxiety, insomnia, and enhances mental clarity.",
            "recommended_session_count": 7,
            "default_session_duration": 60,
            "instructions": "Pre-procedure: Do not eat a heavy meal. Wear comfortable, expendable clothing. Procedure: Lie comfortably while warm oil streams over forehead for 30–40 minutes. Post-procedure: Rest for at least 1 hour. Avoid washing hair immediately. Gentle scalp massage is beneficial."
        },
        {
            "name": "Abhyanga (Full-Body Oil Massage)",
            "description": "Abhyanga is a full-body warm oil massage using specially selected Ayurvedic oils based on the patient's dosha. It improves circulation, nourishes tissues, relieves fatigue, and promotes skin health.",
            "recommended_session_count": 10,
            "default_session_duration": 60,
            "instructions": "Pre-procedure: Arrive relaxed, avoid heavy meal for 2 hours. Procedure: Warm oil applied with rhythmic strokes from head to toe. Post-procedure: Rest for 30 minutes. Take a warm (not hot) shower using herbal paste (Ubtan). Avoid cold environments and cold foods."
        },
        {
            "name": "Stress Management Program",
            "description": "A comprehensive multi-therapy program combining Shirodhara, Abhyanga, and Nasya to address chronic stress, anxiety, and burnout. Includes personalized dietary and lifestyle counseling.",
            "recommended_session_count": 14,
            "default_session_duration": 90,
            "instructions": "Follow the prescribed anti-stress diet (warm, nourishing foods). Practice daily meditation and pranayama for 15 minutes. Maintain a consistent sleep schedule. Avoid stimulants including caffeine. Weekly practitioner check-in required."
        },
        {
            "name": "Joint Mobility & Pain Relief",
            "description": "Targeted Panchakarma program for improving joint health, reducing chronic pain, and addressing conditions like arthritis through Basti, Abhyanga, and herbal treatments.",
            "recommended_session_count": 21,
            "default_session_duration": 75,
            "instructions": "Apply prescribed Ayurvedic oil locally before sessions. Avoid cold foods and cold water. Gentle yoga and walking are encouraged. Report any increase in pain immediately. Follow Vata-pacifying diet: warm, oily, nourishing foods."
        },
        {
            "name": "Detoxification (Shodhana) Program",
            "description": "A full Panchakarma detoxification program that combines preparatory oleation (Purvakarma), primary therapies, and post-therapy dietary management to completely cleanse the body of accumulated toxins (Ama).",
            "recommended_session_count": 21,
            "default_session_duration": 90,
            "instructions": "Week 1 (Purvakarma): Daily Abhyanga and Swedana. Week 2 (Pradhanakarma): Main therapies as prescribed. Week 3 (Paschatkarma): Gradual diet reintroduction. Consume only fresh, home-cooked food throughout. Avoid processed foods, alcohol, and tobacco completely."
        },
    ]
    
    # Only seed templates if none exist
    from app.models.therapy import TherapyTemplate as TT
    if not db.query(TT).first():
        for t_data in templates:
            template = TherapyTemplate(**t_data)
            db.add(template)
        
    db.commit()
    print("Database seeded successfully.")
    
if __name__ == "__main__":
    seed_db()
