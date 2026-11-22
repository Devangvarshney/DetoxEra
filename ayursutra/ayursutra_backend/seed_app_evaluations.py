import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal, engine, Base
import app.models
from app.models.app_evaluation import AppEvaluation
from app.models.user import User, UserRole

def seed_evaluations():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    existing_count = db.query(AppEvaluation).count()
    if existing_count >= 15:
        print(f"App evaluations already seeded ({existing_count} records exist).")
        db.close()
        return

    # Find or use existing users
    users = db.query(User).all()
    if not users:
        print("No users found to attach evaluations to.")
        db.close()
        return

    # Find sample patient and practitioner user IDs
    patient_user = next((u for u in users if u.role == UserRole.PATIENT), users[0])
    practitioner_user = next((u for u in users if u.role == UserRole.PRACTITIONER), users[-1])

    evaluations_dataset = [
        # Patient Evaluations
        {
            "user_id": patient_user.id,
            "role": "patient",
            "user_name": "Rajesh Malhotra",
            "therapy_title": "Virechana Protocol (Pitta Detox)",
            "days_post_therapy": 2,
            "app_usability_rating": 5,
            "precautions_clarity_rating": 5,
            "scheduling_convenience_rating": 5,
            "overall_experience_rating": 5,
            "recommend_score": 10,
            "clinical_adherence_improved": True,
            "liked_most": "The automated dietary alerts for Purvakarma (ghee intake) and Samsarjana Krama gruel diet kept me on track without any confusion.",
            "improvement_suggestions": "Option to download daily meal schedules as a printable PDF."
        },
        {
            "user_id": patient_user.id,
            "role": "patient",
            "user_name": "Pooja Deshmukh",
            "therapy_title": "Basti Protocol (Vata Stabilization)",
            "days_post_therapy": 1,
            "app_usability_rating": 5,
            "precautions_clarity_rating": 4,
            "scheduling_convenience_rating": 5,
            "overall_experience_rating": 5,
            "recommend_score": 9,
            "clinical_adherence_improved": True,
            "liked_most": "The procedural video reel was comforting because I was anxious about Basti. Seeing verified doctor clinics on the map was great.",
            "improvement_suggestions": "Add push reminder 2 hours before session regarding fasting."
        },
        {
            "user_id": patient_user.id,
            "role": "patient",
            "user_name": "Sunita Rao",
            "therapy_title": "Nasya Therapy (Sinus & Headache)",
            "days_post_therapy": 2,
            "app_usability_rating": 4,
            "precautions_clarity_rating": 5,
            "scheduling_convenience_rating": 4,
            "overall_experience_rating": 5,
            "recommend_score": 9,
            "clinical_adherence_improved": True,
            "liked_most": "Simple clean UI, easy to read for older patients. Liked that precautions were in clear bullet points.",
            "improvement_suggestions": "Make font size adjustable in mobile app."
        },
        {
            "user_id": patient_user.id,
            "role": "patient",
            "user_name": "Amit Saxena",
            "therapy_title": "Vamana Protocol (Kapha Rebalancing)",
            "days_post_therapy": 2,
            "app_usability_rating": 5,
            "precautions_clarity_rating": 5,
            "scheduling_convenience_rating": 5,
            "overall_experience_rating": 5,
            "recommend_score": 10,
            "clinical_adherence_improved": True,
            "liked_most": "Having clear instructions to avoid heavy meals the night before made a huge difference. Never had this level of care with paper prescription slips.",
            "improvement_suggestions": "Integrate directly with WhatsApp notifications."
        },
        {
            "user_id": patient_user.id,
            "role": "patient",
            "user_name": "Kavita Menon",
            "therapy_title": "Raktamokshana (Blood Purification)",
            "days_post_therapy": 3,
            "app_usability_rating": 5,
            "precautions_clarity_rating": 4,
            "scheduling_convenience_rating": 5,
            "overall_experience_rating": 4,
            "recommend_score": 9,
            "clinical_adherence_improved": True,
            "liked_most": "Post-session symptom logger allowed my doctor to monitor my recovery without an in-person clinic trip.",
            "improvement_suggestions": "Allow uploading photos of skin healing."
        },
        {
            "user_id": patient_user.id,
            "role": "patient",
            "user_name": "Harish Patel",
            "therapy_title": "Shirodhara & Abhyanga Package",
            "days_post_therapy": 1,
            "app_usability_rating": 5,
            "precautions_clarity_rating": 5,
            "scheduling_convenience_rating": 5,
            "overall_experience_rating": 5,
            "recommend_score": 10,
            "clinical_adherence_improved": True,
            "liked_most": "Tracking recovery trajectory in graphs showed my stress levels dropping steadily session by session.",
            "improvement_suggestions": "Include audio guided post-therapy meditation."
        },
        # Practitioner (Doctor) Evaluations
        {
            "user_id": practitioner_user.id,
            "role": "practitioner",
            "user_name": "Dr. Ananya Sharma, BAMS",
            "therapy_title": "Multi-Session Panchakarma Protocols",
            "days_post_therapy": 2,
            "app_usability_rating": 5,
            "precautions_clarity_rating": 5,
            "scheduling_convenience_rating": 5,
            "overall_experience_rating": 5,
            "recommend_score": 10,
            "clinical_adherence_improved": True,
            "liked_most": "Saved at least 20 minutes per consultation because pre-built Panchakarma templates automatically populate precautions and session sequences.",
            "improvement_suggestions": "Add custom herb formulation fields in session notes."
        },
        {
            "user_id": practitioner_user.id,
            "role": "practitioner",
            "user_name": "Dr. Rahul Verma, MD (Ayurveda)",
            "therapy_title": "Virechana & Basti Management",
            "days_post_therapy": 2,
            "app_usability_rating": 5,
            "precautions_clarity_rating": 5,
            "scheduling_convenience_rating": 4,
            "overall_experience_rating": 5,
            "recommend_score": 10,
            "clinical_adherence_improved": True,
            "liked_most": "Dramatic drop in patient compliance failures. In classical Panchakarma, if a patient breaks diet, the whole cycle resets. AyurSutra alerts eliminated 90% of dietary errors.",
            "improvement_suggestions": "Add automated SMS reminders for patients without continuous 4G data."
        },
        {
            "user_id": practitioner_user.id,
            "role": "practitioner",
            "user_name": "Dr. Meera Kapoor, BAMS",
            "therapy_title": "Ayurvedic Lifestyle & Detox",
            "days_post_therapy": 1,
            "app_usability_rating": 4,
            "precautions_clarity_rating": 5,
            "scheduling_convenience_rating": 5,
            "overall_experience_rating": 5,
            "recommend_score": 9,
            "clinical_adherence_improved": True,
            "liked_most": "Analytics dashboard gives me visibility over completion rate and patient satisfaction across multiple clinics.",
            "improvement_suggestions": "Export monthly clinic report as Excel spreadsheet."
        },
        {
            "user_id": practitioner_user.id,
            "role": "practitioner",
            "user_name": "Dr. Suresh Namboodiri, BAMS",
            "therapy_title": "Classical Kerala Panchakarma",
            "days_post_therapy": 2,
            "app_usability_rating": 5,
            "precautions_clarity_rating": 5,
            "scheduling_convenience_rating": 5,
            "overall_experience_rating": 5,
            "recommend_score": 10,
            "clinical_adherence_improved": True,
            "liked_most": "The clinic locator with multiple branch support allows patients in Kozhikode and Ernakulam to find authentic Vaidyas easily.",
            "improvement_suggestions": "Add Malayalam language interface."
        }
    ]

    for item in evaluations_dataset:
        record = AppEvaluation(**item)
        db.add(record)

    db.commit()
    print(f"Successfully seeded {len(evaluations_dataset)} app evaluation records!")
    db.close()

if __name__ == "__main__":
    seed_evaluations()
