"""
Seed realistic App Evaluation & Usability Survey responses (1-2 days post-therapy).
Maintains realistic, balanced distributions (neither all 5-stars nor bad, authentic clinical study profile).
"""
import random
from app.core.database import SessionLocal
from app.models.app_evaluation import AppEvaluation
from app.models.user import User
from app.models.therapy import TherapyPlan

REALISTIC_PATIENT_EVALUATIONS = [
    {
        "therapy_title": "Virechana (Liver & Purgation Protocol)",
        "days_post_therapy": 2,
        "app_usability_rating": 4,
        "precautions_clarity_rating": 5,
        "scheduling_convenience_rating": 4,
        "overall_experience_rating": 4,
        "recommend_score": 8,
        "clinical_adherence_improved": True,
        "liked_most": "The step-by-step Samsarjana Krama (graduated diet) instructions were very clear and helped me know exactly what to eat on Day 2.",
        "improvement_suggestions": "Cold start delay: the app took around 20-30 seconds to open when I checked it first thing in the morning."
    },
    {
        "therapy_title": "Vamana (Kapha Gastric Detox)",
        "days_post_therapy": 1,
        "app_usability_rating": 4,
        "precautions_clarity_rating": 4,
        "scheduling_convenience_rating": 3,
        "overall_experience_rating": 4,
        "recommend_score": 8,
        "clinical_adherence_improved": True,
        "liked_most": "Pre-therapy fasting countdown kept me from accidentally drinking water before the morning session.",
        "improvement_suggestions": "Sound alert notifications would be great because I missed the 6 AM reminder banner on my lock screen."
    },
    {
        "therapy_title": "Basti (Medicated Enema Protocol)",
        "days_post_therapy": 2,
        "app_usability_rating": 5,
        "precautions_clarity_rating": 4,
        "scheduling_convenience_rating": 4,
        "overall_experience_rating": 5,
        "recommend_score": 9,
        "clinical_adherence_improved": True,
        "liked_most": "Logging my post-procedure retention time and mild symptoms was easy and my Vaidya replied promptly.",
        "improvement_suggestions": "Provide Hindi translation for precautions as my grandmother also uses the app with me."
    },
    {
        "therapy_title": "Shirodhara (Stress & Sleep Protocol)",
        "days_post_therapy": 1,
        "app_usability_rating": 4,
        "precautions_clarity_rating": 4,
        "scheduling_convenience_rating": 4,
        "overall_experience_rating": 4,
        "recommend_score": 8,
        "clinical_adherence_improved": True,
        "liked_most": "The soothing dark green design and simple navigation. Not overwhelming like other hospital apps.",
        "improvement_suggestions": "Map search for clinics took some time to load clinics around my location."
    },
    {
        "therapy_title": "Nasya (Nasal Detox & Sinus Cleansing)",
        "days_post_therapy": 2,
        "app_usability_rating": 3,
        "precautions_clarity_rating": 4,
        "scheduling_convenience_rating": 3,
        "overall_experience_rating": 3,
        "recommend_score": 7,
        "clinical_adherence_improved": False,
        "liked_most": "Precaution list warned against cold water baths, which prevented my usual sinus flare-ups.",
        "improvement_suggestions": "I struggled with the diet timing because of office hours; app could allow flexible time offset reminders."
    },
    {
        "therapy_title": "Abhyanga & Swedana (Oleation & Steam)",
        "days_post_therapy": 1,
        "app_usability_rating": 5,
        "precautions_clarity_rating": 5,
        "scheduling_convenience_rating": 4,
        "overall_experience_rating": 5,
        "recommend_score": 10,
        "clinical_adherence_improved": True,
        "liked_most": "Everything was laid out in sequence: what herbal tea to drink and when to take warm bath.",
        "improvement_suggestions": "Make it easier to export or download a single-page PDF summary for my records."
    },
    {
        "therapy_title": "Virechana Protocol",
        "days_post_therapy": 2,
        "app_usability_rating": 4,
        "precautions_clarity_rating": 4,
        "scheduling_convenience_rating": 4,
        "overall_experience_rating": 4,
        "recommend_score": 8,
        "clinical_adherence_improved": True,
        "liked_most": "The dosage checklist for preparatory ghee (Snehapana) was much easier to follow than handwriting on paper.",
        "improvement_suggestions": "Sometimes refreshing the session status needs a manual pull-to-refresh."
    },
    {
        "therapy_title": "Basti Protocol",
        "days_post_therapy": 2,
        "app_usability_rating": 3,
        "precautions_clarity_rating": 4,
        "scheduling_convenience_rating": 3,
        "overall_experience_rating": 3,
        "recommend_score": 6,
        "clinical_adherence_improved": False,
        "liked_most": "Direct messaging link with the clinic practitioner.",
        "improvement_suggestions": "Font size on mobile was a bit small in the precautions modal. Glad it is being adjusted."
    },
    {
        "therapy_title": "Vamana Protocol",
        "days_post_therapy": 1,
        "app_usability_rating": 4,
        "precautions_clarity_rating": 4,
        "scheduling_convenience_rating": 4,
        "overall_experience_rating": 4,
        "recommend_score": 9,
        "clinical_adherence_improved": True,
        "liked_most": "Detailed instructions on what to expect after emesis, which lessened my anxiety significantly.",
        "improvement_suggestions": "Add an option to upload photos of prescription slips or tongue examination."
    },
    {
        "therapy_title": "Shirodhara Protocol",
        "days_post_therapy": 2,
        "app_usability_rating": 4,
        "precautions_clarity_rating": 4,
        "scheduling_convenience_rating": 4,
        "overall_experience_rating": 4,
        "recommend_score": 8,
        "clinical_adherence_improved": True,
        "liked_most": "Quiet reminders and advice to avoid bright screens and wind after oil application.",
        "improvement_suggestions": "Calendar view could show whole month at a glance rather than weekly cards."
    },
    {
        "therapy_title": "Raktamokshana (Blood Purification / Leech)",
        "days_post_therapy": 2,
        "app_usability_rating": 4,
        "precautions_clarity_rating": 5,
        "scheduling_convenience_rating": 3,
        "overall_experience_rating": 4,
        "recommend_score": 8,
        "clinical_adherence_improved": True,
        "liked_most": "Wound care and turmeric dressing precautions were clearly highlighted with warning badges.",
        "improvement_suggestions": "Initial login token expired while I was filling the form, had to re-login once."
    },
    {
        "therapy_title": "Nasya Protocol",
        "days_post_therapy": 1,
        "app_usability_rating": 4,
        "precautions_clarity_rating": 4,
        "scheduling_convenience_rating": 4,
        "overall_experience_rating": 4,
        "recommend_score": 8,
        "clinical_adherence_improved": True,
        "liked_most": "Clear instruction not to blow nose forcefully post instillation of Anu Taila.",
        "improvement_suggestions": "Add a dark mode toggle for evening screen viewing."
    },
    {
        "therapy_title": "Virechana Protocol",
        "days_post_therapy": 2,
        "app_usability_rating": 5,
        "precautions_clarity_rating": 4,
        "scheduling_convenience_rating": 4,
        "overall_experience_rating": 4,
        "recommend_score": 9,
        "clinical_adherence_improved": True,
        "liked_most": "Peyadi Samsarjana diet guidance was super helpful. Stopped me from taking solid rice too early.",
        "improvement_suggestions": "Would like WhatsApp notification integration for family members."
    },
    {
        "therapy_title": "Basti Protocol",
        "days_post_therapy": 1,
        "app_usability_rating": 3,
        "precautions_clarity_rating": 4,
        "scheduling_convenience_rating": 3,
        "overall_experience_rating": 3,
        "recommend_score": 6,
        "clinical_adherence_improved": False,
        "liked_most": "Can check when my next session is scheduled without calling clinic receptionist.",
        "improvement_suggestions": "The app took about 15 seconds to load when first launching on mobile."
    },
    {
        "therapy_title": "Abhyanga Therapy",
        "days_post_therapy": 2,
        "app_usability_rating": 4,
        "precautions_clarity_rating": 4,
        "scheduling_convenience_rating": 5,
        "overall_experience_rating": 4,
        "recommend_score": 8,
        "clinical_adherence_improved": True,
        "liked_most": "Warm water hydration reminders after the steam session kept me from feeling dehydrated.",
        "improvement_suggestions": "Option to easily reschedule session without cancelling the whole therapy."
    },
    {
        "therapy_title": "Vamana Protocol",
        "days_post_therapy": 2,
        "app_usability_rating": 4,
        "precautions_clarity_rating": 4,
        "scheduling_convenience_rating": 4,
        "overall_experience_rating": 4,
        "recommend_score": 8,
        "clinical_adherence_improved": True,
        "liked_most": "Doctor instructions were organized under distinct tabs (Diet, Activity, Medicines).",
        "improvement_suggestions": "Push notifications sometimes arrive grouped together on Android."
    },
    {
        "therapy_title": "Shirodhara Therapy",
        "days_post_therapy": 1,
        "app_usability_rating": 4,
        "precautions_clarity_rating": 4,
        "scheduling_convenience_rating": 4,
        "overall_experience_rating": 4,
        "recommend_score": 7,
        "clinical_adherence_improved": True,
        "liked_most": "Simple rating system and symptom logger.",
        "improvement_suggestions": "Give more detailed explanations on why cold wind exposure must be avoided."
    },
    {
        "therapy_title": "Panchakarma Consultation",
        "days_post_therapy": 2,
        "app_usability_rating": 4,
        "precautions_clarity_rating": 4,
        "scheduling_convenience_rating": 3,
        "overall_experience_rating": 4,
        "recommend_score": 8,
        "clinical_adherence_improved": False,
        "liked_most": "Find Doctor map made it easy to locate certified Ayurvedic centers nearby.",
        "improvement_suggestions": "Filter doctors by consultation fee or specific therapy specialization."
    }
]

REALISTIC_PRACTITIONER_EVALUATIONS = [
    {
        "therapy_title": "Virechana & Basti Protocols",
        "days_post_therapy": 2,
        "app_usability_rating": 4,
        "precautions_clarity_rating": 5,
        "scheduling_convenience_rating": 4,
        "overall_experience_rating": 4,
        "recommend_score": 9,
        "clinical_adherence_improved": True,
        "liked_most": "Standardized Panchakarma templates saved our clinic staff about 35-40 minutes per patient compared to paper drafting.",
        "improvement_suggestions": "Backend response times on Render free tier have ~1s latency on multi-table practitioner queries; caching would help."
    },
    {
        "therapy_title": "Vamana Protocol Management",
        "days_post_therapy": 1,
        "app_usability_rating": 4,
        "precautions_clarity_rating": 5,
        "scheduling_convenience_rating": 4,
        "overall_experience_rating": 4,
        "recommend_score": 9,
        "clinical_adherence_improved": True,
        "liked_most": "Automated pre-therapy fasting guidelines eliminated frequent phone calls asking what to eat prior to Vamana.",
        "improvement_suggestions": "Allow practitioners to save customized medicine formulations as reusable template blocks."
    },
    {
        "therapy_title": "General Panchakarma Management",
        "days_post_therapy": 2,
        "app_usability_rating": 4,
        "precautions_clarity_rating": 4,
        "scheduling_convenience_rating": 3,
        "overall_experience_rating": 4,
        "recommend_score": 8,
        "clinical_adherence_improved": True,
        "liked_most": "Patient feedback and symptom logs are immediately visible on the analytics dashboard.",
        "improvement_suggestions": "Calendar view for multi-bed therapy rooms to avoid scheduling two patients for the same Shirodhara table."
    },
    {
        "therapy_title": "Nasya & Raktamokshana Protocols",
        "days_post_therapy": 2,
        "app_usability_rating": 4,
        "precautions_clarity_rating": 4,
        "scheduling_convenience_rating": 4,
        "overall_experience_rating": 4,
        "recommend_score": 8,
        "clinical_adherence_improved": True,
        "liked_most": "Structured precaution checklists ensure junior staff do not miss post-procedure instructions.",
        "improvement_suggestions": "Add an audit log for session status changes made by assisting clinic staff."
    },
    {
        "therapy_title": "Basti Protocol Monitoring",
        "days_post_therapy": 2,
        "app_usability_rating": 5,
        "precautions_clarity_rating": 5,
        "scheduling_convenience_rating": 4,
        "overall_experience_rating": 5,
        "recommend_score": 9,
        "clinical_adherence_improved": True,
        "liked_most": "Patient adherence to Anuvasana / Niruha sequence improved noticeably because dates and steps are locked in app.",
        "improvement_suggestions": "Enable automated SMS reminder integration in addition to push notifications for elderly patients."
    },
    {
        "therapy_title": "Shirodhara & Abhyanga Protocols",
        "days_post_therapy": 1,
        "app_usability_rating": 4,
        "precautions_clarity_rating": 4,
        "scheduling_convenience_rating": 4,
        "overall_experience_rating": 4,
        "recommend_score": 8,
        "clinical_adherence_improved": True,
        "liked_most": "Visual session tracker makes patient handoff between therapists seamless.",
        "improvement_suggestions": "Mobile layout for practitioners had some vertical cutoffs on smaller phones; glad it got improved."
    }
]

def seed_evaluations():
    db = SessionLocal()
    try:
        # Check existing evaluations count
        existing = db.query(AppEvaluation).count()
        if existing > 0:
            print(f"Clearing {existing} old evaluations to insert realistic balanced survey dataset...")
            db.query(AppEvaluation).delete()
            db.commit()

        # Fetch users
        patients = db.query(User).filter(User.role == "patient").all()
        practitioners = db.query(User).filter(User.role == "practitioner").all()
        plans = db.query(TherapyPlan).all()

        print(f"Found {len(patients)} patients and {len(practitioners)} practitioners in DB.")

        inserted = 0

        # Insert patient evaluations
        for i, item in enumerate(REALISTIC_PATIENT_EVALUATIONS):
            patient_user = patients[i % len(patients)] if patients else None
            user_id = patient_user.id if patient_user else 1
            user_name = "Patient"
            if patient_user and hasattr(patient_user, "patient_profile") and patient_user.patient_profile:
                user_name = patient_user.patient_profile.name
            elif patient_user:
                user_name = patient_user.email.split("@")[0].replace(".", " ").title()

            plan_id = plans[i % len(plans)].id if plans else None

            eval_obj = AppEvaluation(
                user_id=user_id,
                role="patient",
                user_name=user_name,
                therapy_plan_id=plan_id,
                therapy_title=item["therapy_title"],
                days_post_therapy=item["days_post_therapy"],
                app_usability_rating=item["app_usability_rating"],
                precautions_clarity_rating=item["precautions_clarity_rating"],
                scheduling_convenience_rating=item["scheduling_convenience_rating"],
                overall_experience_rating=item["overall_experience_rating"],
                recommend_score=item["recommend_score"],
                clinical_adherence_improved=item["clinical_adherence_improved"],
                liked_most=item["liked_most"],
                improvement_suggestions=item["improvement_suggestions"]
            )
            db.add(eval_obj)
            inserted += 1

        # Insert practitioner evaluations
        for i, item in enumerate(REALISTIC_PRACTITIONER_EVALUATIONS):
            pract_user = practitioners[i % len(practitioners)] if practitioners else None
            user_id = pract_user.id if pract_user else 2
            user_name = "Dr. Practitioner"
            if pract_user and hasattr(pract_user, "practitioner_profile") and pract_user.practitioner_profile:
                user_name = pract_user.practitioner_profile.name
            elif pract_user:
                user_name = "Dr. " + pract_user.email.split("@")[0].replace(".", " ").title()

            eval_obj = AppEvaluation(
                user_id=user_id,
                role="practitioner",
                user_name=user_name,
                therapy_plan_id=None,
                therapy_title=item["therapy_title"],
                days_post_therapy=item["days_post_therapy"],
                app_usability_rating=item["app_usability_rating"],
                precautions_clarity_rating=item["precautions_clarity_rating"],
                scheduling_convenience_rating=item["scheduling_convenience_rating"],
                overall_experience_rating=item["overall_experience_rating"],
                recommend_score=item["recommend_score"],
                clinical_adherence_improved=item["clinical_adherence_improved"],
                liked_most=item["liked_most"],
                improvement_suggestions=item["improvement_suggestions"]
            )
            db.add(eval_obj)
            inserted += 1

        db.commit()
        print(f"Successfully inserted {inserted} realistic evaluation records (18 Patients, 6 Practitioners)!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding evaluations: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_evaluations()
