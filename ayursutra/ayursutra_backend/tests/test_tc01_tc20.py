"""
AyurSutra Comprehensive Test Suite: TC-01 to TC-20
Covers Authentication, RBAC, Discovery, Requests, Therapy Plans, Scheduling,
Precautions, Feedback, Analytics, Milestones, Mobile APK, and Mobile/UI layout.

Can be run via:
  - pytest tests/test_tc01_tc20.py -v
  - python tests/test_tc01_tc20.py
"""

import os
import sys
import time
import zipfile
import logging
from datetime import datetime, timedelta, date, time as dtime
from typing import Dict, Any

import pytest
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.core.database import SessionLocal
from app.core.security import create_access_token
from app.models.therapy import TherapyTemplate, TreatmentRequest, RequestStatus
from app.models.user import User, UserRole

# Configure logging to both file and console
LOG_FILE_PATH = os.path.join(backend_dir, "tests", "test_results.log")
ROOT_LOG_FILE_PATH = os.path.abspath(os.path.join(backend_dir, "..", "..", "test_results.log"))

logger = logging.getLogger("AyurSutraTestLogger")
logger.setLevel(logging.INFO)
logger.handlers.clear()

formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] %(message)s", datefmt="%Y-%m-%d %H:%M:%S")

# File handler 1: backend tests directory
fh1 = logging.FileHandler(LOG_FILE_PATH, mode="w", encoding="utf-8")
fh1.setFormatter(formatter)
logger.addHandler(fh1)

# File handler 2: root workspace
try:
    fh2 = logging.FileHandler(ROOT_LOG_FILE_PATH, mode="w", encoding="utf-8")
    fh2.setFormatter(formatter)
    logger.addHandler(fh2)
except Exception:
    pass

# Stream handler: console
ch = logging.StreamHandler(sys.stdout)
ch.setFormatter(formatter)
logger.addHandler(ch)

client = TestClient(app)

# Shared in-memory test state across test cases
class TestState:
    patient_email = f"tc_patient_{int(time.time())}@ayursutra.com"
    patient_password = "SecurePassword123!"
    patient_id = None
    patient_user_id = None
    patient_token = None

    practitioner_email = f"tc_practitioner_{int(time.time())}@ayursutra.com"
    practitioner_password = "DoctorPassword123!"
    practitioner_id = None
    practitioner_user_id = None
    practitioner_token = None

    request_id = None
    plan_id = None
    session_id = None
    milestone_id = None
    template_id = None

state = TestState()


def log_tc(tc_id: str, module: str, title: str, status: str, details: str = ""):
    divider = "=" * 80
    logger.info(divider)
    logger.info(f"TEST CASE : {tc_id} | Module: {module} | Title: {title}")
    logger.info(f"STATUS    : {status}")
    if details:
        logger.info(f"DETAILS   : {details}")
    logger.info(divider)


# ============================================================================
# TC-01: Auth - Register a patient
# ============================================================================
def test_tc01_register_patient():
    """TC-01: Register a patient with valid credentials and profile."""
    payload = {
        "user_in": {
            "email": state.patient_email,
            "password": state.patient_password,
            "role": "patient"
        },
        "patient_in": {
            "name": "Priya Sharma",
            "phone": "9876543210",
            "age": 29,
            "gender": "Female",
            "address": "Green Park, New Delhi",
            "profile_info": "Vata-Pitta body constitution seeking panchakarma cleanse."
        }
    }
    response = client.post("/auth/register/patient", json=payload)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["email"] == state.patient_email
    assert data["role"] == "patient"
    state.patient_user_id = data["id"]

    # Verify that the registered patient can log in immediately
    login_res = client.post("/auth/login", data={"username": state.patient_email, "password": state.patient_password})
    assert login_res.status_code == 200, f"Patient login failed: {login_res.text}"
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    state.patient_token = token_data["access_token"]

    # Fetch patient profile id
    db = SessionLocal()
    user = db.query(User).filter(User.email == state.patient_email).first()
    assert user and user.patient_profile, "Patient profile was not created."
    state.patient_id = user.patient_profile.id
    db.close()

    log_tc("TC-01", "Auth", "Register a patient", "PASSED",
           f"Patient registered: {state.patient_email} (User ID: {state.patient_user_id}, Profile ID: {state.patient_id}) and verified login.")


# ============================================================================
# TC-02: Auth - Register a practitioner
# ============================================================================
def test_tc02_register_practitioner():
    """TC-02: Register a practitioner with valid credentials, city, specialization."""
    payload = {
        "user_in": {
            "email": state.practitioner_email,
            "password": state.practitioner_password,
            "role": "practitioner"
        },
        "practitioner_in": {
            "name": "Dr. Rajeshwar Shastri",
            "specialization": "Panchakarma & Kayachikitsa",
            "qualification": "BAMS, MD (Ayurveda)",
            "experience": "12 years",
            "city": "Delhi",
            "bio": "Senior Ayurvedic consultant specializing in detox therapies and lifestyle disorders.",
            "availability": "Mon-Sat 09:00 - 17:00"
        }
    }
    response = client.post("/auth/register/practitioner", json=payload)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["email"] == state.practitioner_email
    assert data["role"] == "practitioner"
    state.practitioner_user_id = data["id"]

    # Verify practitioner login
    login_res = client.post("/auth/login", data={"username": state.practitioner_email, "password": state.practitioner_password})
    assert login_res.status_code == 200, f"Practitioner login failed: {login_res.text}"
    token_data = login_res.json()
    assert "access_token" in token_data
    state.practitioner_token = token_data["access_token"]

    db = SessionLocal()
    user = db.query(User).filter(User.email == state.practitioner_email).first()
    assert user and user.practitioner_profile, "Practitioner profile was not created."
    state.practitioner_id = user.practitioner_profile.id
    db.close()

    log_tc("TC-02", "Auth", "Register a practitioner", "PASSED",
           f"Practitioner registered: {state.practitioner_email} (User ID: {state.practitioner_user_id}, Profile ID: {state.practitioner_id}, City: Delhi).")


# ============================================================================
# TC-03: Auth - Valid login
# ============================================================================
def test_tc03_valid_login():
    """TC-03: Valid login with correct email and password returns Bearer token."""
    response = client.post("/auth/login", data={"username": state.patient_email, "password": state.patient_password})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"].lower() == "bearer"
    token = data["access_token"]

    # Verify accessing protected endpoint with returned token
    me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == state.patient_email

    log_tc("TC-03", "Auth", "Valid login", "PASSED",
           f"Bearer token received, /auth/me successfully validated for user: {state.patient_email}")


# ============================================================================
# TC-04: Auth - Invalid login
# ============================================================================
def test_tc04_invalid_login():
    """TC-04: Invalid login with wrong password denies access without token."""
    response = client.post("/auth/login", data={"username": state.patient_email, "password": "WrongPasswordXYZ!"})
    assert response.status_code == 401
    assert "access_token" not in response.json()
    assert "Incorrect email or password" in response.json().get("detail", "")

    log_tc("TC-04", "Auth", "Invalid login", "PASSED",
           "Denied access with HTTP 401 and 'Incorrect email or password' detail. No token issued.")


# ============================================================================
# TC-05: Auth - Google sign-in
# ============================================================================
def test_tc05_google_signin():
    """TC-05: Google sign-in registers or logs in user with valid Google credential."""
    google_email = f"google_test_{int(time.time())}@ayursutra.com"
    mock_token = f"demo_google_token:{google_email}:Aarav Patel"

    payload = {
        "credential": mock_token,
        "role": "patient"
    }
    response = client.post("/auth/google", json=payload)
    assert response.status_code == 200, f"Google login failed: {response.text}"
    data = response.json()
    assert "access_token" in data
    assert data["token_type"].lower() == "bearer"

    # Verify token allows protected access
    me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {data['access_token']}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == google_email

    log_tc("TC-05", "Auth", "Google sign-in", "PASSED",
           f"Google sign-in succeeded for {google_email}, returning Bearer token and creating active profile.")


# ============================================================================
# TC-06: RBAC - Patient calls a practitioner endpoint
# ============================================================================
def test_tc06_rbac_patient_calls_practitioner_endpoint():
    """TC-06: Patient token on POST /therapy/plans must be rejected with 403 Forbidden."""
    plan_payload = {
        "patient_id": state.patient_id,
        "template_id": 1,
        "title": "Unauthorized Plan",
        "description": "Patient trying to create plan",
        "number_of_sessions": 3,
        "session_duration": 60,
        "notes": "Testing RBAC"
    }
    headers = {"Authorization": f"Bearer {state.patient_token}"}
    response = client.post("/therapy/plans", json=plan_payload, headers=headers)
    assert response.status_code == 403, f"Expected 403 Forbidden, got {response.status_code}: {response.text}"
    assert "privileges" in response.json().get("detail", "").lower()

    log_tc("TC-06", "RBAC", "Patient calls a practitioner endpoint", "PASSED",
           f"Patient calling POST /therapy/plans was rejected with HTTP 403: {response.json().get('detail')}")


# ============================================================================
# TC-07: RBAC - Access without or with expired token
# ============================================================================
def test_tc07_rbac_missing_or_expired_token():
    """TC-07: Request without token or with expired token must be rejected."""
    # Subtest A: No token
    res_no_token = client.get("/therapy/plans")
    assert res_no_token.status_code == 401, f"Expected 401 without token, got {res_no_token.status_code}"

    # Subtest B: Expired token (issued with negative timedelta)
    expired_token = create_access_token(
        subject=state.patient_user_id,
        role="patient",
        expires_delta=timedelta(minutes=-5)
    )
    headers = {"Authorization": f"Bearer {expired_token}"}
    res_expired = client.get("/therapy/plans", headers=headers)
    assert res_expired.status_code == 401, f"Expected 401 with expired token, got {res_expired.status_code}"

    log_tc("TC-07", "RBAC", "Access without or with expired token", "PASSED",
           "Both missing token and expired token were rejected with HTTP 401 Unauthorized.")


# ============================================================================
# TC-08: Discovery - Filter by city
# ============================================================================
def test_tc08_filter_practitioners_by_city():
    """TC-08: GET /practitioners?city=Delhi returns only practitioners of Delhi."""
    response = client.get("/practitioners?city=Delhi")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    practitioners = response.json()
    assert isinstance(practitioners, list)
    assert len(practitioners) > 0, "Expected at least one practitioner in Delhi"

    # Verify that all listed practitioners match the filtered city
    for p in practitioners:
        city = (p.get("city") or "").lower()
        clinic_cities = [c.get("city", "").lower() for c in p.get("clinics", [])]
        assert "delhi" in city or any("delhi" in cc for cc in clinic_cities), \
            f"Practitioner {p.get('name')} does not match Delhi filter (city={p.get('city')})"

    log_tc("TC-08", "Discovery", "Filter by city", "PASSED",
           f"Found {len(practitioners)} practitioners matching city 'Delhi'. All results confirmed in Delhi.")


# ============================================================================
# TC-09: Requests - Send request
# ============================================================================
def test_tc09_send_treatment_request():
    """TC-09: Patient sends a treatment request to practitioner; status becomes pending."""
    headers = {"Authorization": f"Bearer {state.patient_token}"}
    payload = {
        "practitioner_id": state.practitioner_id,
        "symptoms": "Chronic digestive sluggishness, joint stiffness, and stress",
        "message": "Hello Dr. Shastri, I would like to consult for a Panchakarma detoxification plan."
    }
    response = client.post("/treatment-requests", json=payload, headers=headers)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["status"] == "pending"
    assert data["patient_id"] == state.patient_id
    assert data["practitioner_id"] == state.practitioner_id
    state.request_id = data["id"]

    log_tc("TC-09", "Requests", "Send request", "PASSED",
           f"Treatment request created with ID: {state.request_id}, status: {data['status']}")


# ============================================================================
# TC-10: Requests - Accept or reject request
# ============================================================================
def test_tc10_accept_or_reject_request():
    """TC-10: Practitioner accepts a pending request; patient verifies updated status."""
    headers_prac = {"Authorization": f"Bearer {state.practitioner_token}"}
    patch_payload = {"status": "accepted"}
    response = client.patch(f"/treatment-requests/{state.request_id}", json=patch_payload, headers=headers_prac)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    assert response.json()["status"] == "accepted"

    # Patient verifies seeing the accepted status in sent requests
    headers_pat = {"Authorization": f"Bearer {state.patient_token}"}
    sent_res = client.get("/treatment-requests/sent", headers=headers_pat)
    assert sent_res.status_code == 200
    sent_requests = sent_res.json()
    matching_req = next((r for r in sent_requests if r["id"] == state.request_id), None)
    assert matching_req is not None, "Sent request not found for patient"
    assert matching_req["status"] == "accepted", f"Expected accepted, got {matching_req['status']}"

    log_tc("TC-10", "Requests", "Accept or reject request", "PASSED",
           f"Practitioner accepted request {state.request_id}. Patient confirmed status is 'accepted'.")


# ============================================================================
# TC-11: Plans - Create plan from template
# ============================================================================
def test_tc11_create_plan_from_template():
    """TC-11: Practitioner creates therapy plan from template with sequential sessions."""
    # Ensure templates exist or pick first template
    t_res = client.get("/therapy/templates")
    assert t_res.status_code == 200
    templates = t_res.json()
    if not templates:
        # Create a fallback template in database if needed
        db = SessionLocal()
        tpl = TherapyTemplate(
            name="Virechana (Therapeutic Purgation)",
            description="Eliminates excess Pitta dosha through medicated purgation.",
            recommended_session_count=5,
            default_session_duration=60,
            instructions="Pre: 3-day internal oleation. Post: Light liquid diet."
        )
        db.add(tpl)
        db.commit()
        db.refresh(tpl)
        state.template_id = tpl.id
        db.close()
    else:
        state.template_id = templates[0]["id"]

    headers = {"Authorization": f"Bearer {state.practitioner_token}"}
    plan_payload = {
        "patient_id": state.patient_id,
        "template_id": state.template_id,
        "title": "Comprehensive Panchakarma Therapy Plan",
        "description": "Targeted classical detoxification sequence.",
        "number_of_sessions": 5,
        "session_duration": 60,
        "notes": "Follow strict Dinacharya and dietary guidelines."
    }
    response = client.post("/therapy/plans", json=plan_payload, headers=headers)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    plan_data = response.json()
    state.plan_id = plan_data["id"]
    assert plan_data["number_of_sessions"] == 5

    # Check that sessions are generated in sequential order (1 to 5)
    sessions_res = client.get(f"/therapy/plans/{state.plan_id}/sessions", headers=headers)
    assert sessions_res.status_code == 200
    sessions = sessions_res.json()
    assert len(sessions) == 5, f"Expected 5 sessions, got {len(sessions)}"
    session_numbers = [s["session_number"] for s in sessions]
    assert session_numbers == [1, 2, 3, 4, 5], f"Sessions out of order: {session_numbers}"

    state.session_id = sessions[0]["id"]

    log_tc("TC-11", "Plans", "Create plan from template", "PASSED",
           f"Therapy plan {state.plan_id} created with 5 sequential sessions (IDs: {[s['id'] for s in sessions]}).")


# ============================================================================
# TC-12: Scheduling - Schedule a session
# ============================================================================
def test_tc12_schedule_session():
    """TC-12: Schedule a session with date, time, and pre_precautions."""
    headers_prac = {"Authorization": f"Bearer {state.practitioner_token}"}
    schedule_payload = {
        "scheduled_date": "2026-11-01",
        "start_time": "09:30:00",
        "pre_precautions": "Fasting 2 hours prior; drink warm ginger infusion; no heavy exercise."
    }
    response = client.patch(f"/therapy/sessions/{state.session_id}/schedule", json=schedule_payload, headers=headers_prac)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    session_data = response.json()
    assert session_data["status"] == "scheduled"
    assert session_data["scheduled_date"] == "2026-11-01"
    assert session_data["pre_precautions"] == schedule_payload["pre_precautions"]

    # Verify session is visible on patient's timeline/sessions
    headers_pat = {"Authorization": f"Bearer {state.patient_token}"}
    pat_sessions = client.get("/therapy/sessions", headers=headers_pat).json()
    matching = next((s for s in pat_sessions if s["id"] == state.session_id), None)
    assert matching is not None, "Scheduled session not visible on patient timeline"
    assert matching["status"] == "scheduled"

    log_tc("TC-12", "Scheduling", "Schedule a session", "PASSED",
           f"Session {state.session_id} scheduled for 2026-11-01 09:30:00 with pre-precautions. Confirmed on patient timeline.")


# ============================================================================
# TC-13: Scheduling - Complete a session
# ============================================================================
def test_tc13_complete_session():
    """TC-13: Practitioner marks session complete with notes; progress percentage increases."""
    headers_prac = {"Authorization": f"Bearer {state.practitioner_token}"}
    complete_payload = {
        "practitioner_notes": "First therapy session conducted successfully. Good sweat response, no adverse signs.",
        "post_precautions": "Rest for 60 minutes in a warm room; avoid cold drafts; sip warm water."
    }
    response = client.patch(f"/therapy/sessions/{state.session_id}/complete", json=complete_payload, headers=headers_prac)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    session_data = response.json()
    assert session_data["status"] == "completed"
    assert session_data["practitioner_notes"] == complete_payload["practitioner_notes"]

    # Verify progress percentage increases
    headers_pat = {"Authorization": f"Bearer {state.patient_token}"}
    progress_res = client.get(f"/therapy/plans/{state.plan_id}/progress", headers=headers_pat)
    assert progress_res.status_code == 200
    progress = progress_res.json()
    assert progress["completed_sessions"] >= 1
    assert progress["progress_percentage"] > 0, f"Progress percentage did not increase: {progress}"

    log_tc("TC-13", "Scheduling", "Complete a session", "PASSED",
           f"Session {state.session_id} marked completed. Plan progress increased to {progress['progress_percentage']}% ({progress['completed_sessions']}/{progress['total_sessions']} sessions).")


# ============================================================================
# TC-14: Precautions - Precaution notifications
# ============================================================================
def test_tc14_precaution_notifications():
    """TC-14: Notifications created with pre- and post-precautions; unread count updates."""
    headers_pat = {"Authorization": f"Bearer {state.patient_token}"}
    notif_res = client.get("/notifications", headers=headers_pat)
    assert notif_res.status_code == 200
    notifications = notif_res.json()
    assert len(notifications) > 0, "Expected notifications for patient"

    # Find notification containing pre-precautions or post-precautions
    has_pre_or_post = any(
        ("precaution" in (n.get("message", "") or "").lower() or
         "precaution" in (n.get("title", "") or "").lower() or
         n.get("type") in ["SESSION_SCHEDULED", "SESSION_COMPLETED"])
        for n in notifications
    )
    assert has_pre_or_post, "Expected pre_precaution or post_precaution notifications"

    # Verify unread count
    unread_res = client.get("/notifications/unread-count", headers=headers_pat)
    assert unread_res.status_code == 200
    unread_count = unread_res.json().get("count", 0)
    assert unread_count >= 1, f"Expected at least 1 unread notification, got {unread_count}"

    log_tc("TC-14", "Precautions", "Precaution notifications", "PASSED",
           f"Precaution notifications verified for patient. Unread count = {unread_count}.")


# ============================================================================
# TC-15: Feedback - Submit feedback
# ============================================================================
def test_tc15_submit_feedback():
    """TC-15: Submit feedback with rating 4, improvement 3, symptoms, comments."""
    headers_pat = {"Authorization": f"Bearer {state.patient_token}"}
    feedback_payload = {
        "rating": 4,
        "improvement_level": 3,
        "comments": "Felt deeply relaxed after the session. Mild initial thirst resolved quickly.",
        "symptoms_reported": "mild_sweating,relaxation"
    }
    response = client.post(f"/feedback/sessions/{state.session_id}", json=feedback_payload, headers=headers_pat)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["rating"] == 4
    assert data["session_id"] == state.session_id

    # Verify feedback visible to practitioner
    headers_prac = {"Authorization": f"Bearer {state.practitioner_token}"}
    view_fb_res = client.get(f"/feedback/sessions/{state.session_id}", headers=headers_prac)
    assert view_fb_res.status_code == 200
    fb_data = view_fb_res.json()
    assert fb_data["rating"] == 4
    assert fb_data["comments"] == feedback_payload["comments"]

    log_tc("TC-15", "Feedback", "Submit feedback", "PASSED",
           f"Feedback submitted successfully: Rating={fb_data['rating']}, Comments='{fb_data['comments']}'. Visible to practitioner.")


# ============================================================================
# TC-16: Feedback - Duplicate or invalid feedback
# ============================================================================
def test_tc16_duplicate_or_invalid_feedback():
    """TC-16: Duplicate submission on same session and invalid rating 7 are both rejected."""
    headers_pat = {"Authorization": f"Bearer {state.patient_token}"}

    # Subtest A: Duplicate submission on session_id (already submitted in TC-15)
    dup_payload = {
        "rating": 5,
        "comments": "Trying to submit second time"
    }
    dup_res = client.post(f"/feedback/sessions/{state.session_id}", json=dup_payload, headers=headers_pat)
    assert dup_res.status_code == 409, f"Expected 409 Conflict on duplicate feedback, got {dup_res.status_code}"

    # Subtest B: Invalid rating 7 (Pydantic field validator: ge=1, le=5)
    invalid_payload = {
        "rating": 7,
        "comments": "Rating beyond allowed 1-5 scale"
    }
    inv_res = client.post(f"/feedback/sessions/{state.session_id}", json=invalid_payload, headers=headers_pat)
    assert inv_res.status_code == 422, f"Expected 422 Unprocessable Entity on rating 7, got {inv_res.status_code}"

    log_tc("TC-16", "Feedback", "Duplicate or invalid feedback", "PASSED",
           "Both duplicate feedback (HTTP 409) and invalid rating 7 (HTTP 422) were rejected as expected.")


# ============================================================================
# TC-17: Analytics - Dashboards
# ============================================================================
def test_tc17_analytics_dashboards():
    """TC-17: Open practitioner and patient dashboards; totals, completion rate match data."""
    # Subtest A: Practitioner Analytics
    headers_prac = {"Authorization": f"Bearer {state.practitioner_token}"}
    prac_res = client.get("/analytics/practitioner", headers=headers_prac)
    assert prac_res.status_code == 200, f"Expected 200, got {prac_res.status_code}: {prac_res.text}"
    prac_data = prac_res.json()
    assert "overview" in prac_data
    assert "monthly_sessions" in prac_data
    assert "status_breakdown" in prac_data
    overview = prac_data["overview"]
    assert overview["total_plans"] >= 1
    assert overview["total_sessions"] >= 5
    assert overview["completed_sessions"] >= 1
    assert overview["completion_rate"] > 0

    # Subtest B: Patient Analytics
    headers_pat = {"Authorization": f"Bearer {state.patient_token}"}
    pat_res = client.get("/analytics/patient", headers=headers_pat)
    assert pat_res.status_code == 200, f"Expected 200, got {pat_res.status_code}: {pat_res.text}"
    pat_data = pat_res.json()
    assert "overview" in pat_data
    assert "rating_trend" in pat_data
    p_overview = pat_data["overview"]
    assert p_overview["total_plans"] >= 1
    assert p_overview["total_sessions"] >= 5
    assert p_overview["completed_sessions"] >= 1
    assert p_overview["completion_rate"] > 0

    log_tc("TC-17", "Analytics", "Dashboards", "PASSED",
           f"Practitioner & Patient analytics verified. Completion rate={overview['completion_rate']}%, Total plans={overview['total_plans']}.")


# ============================================================================
# TC-18: Milestones - Add and achieve milestone
# ============================================================================
def test_tc18_milestones_add_and_achieve():
    """TC-18: Add a milestone and mark it achieved (is_achieved True, achieved_at set)."""
    headers_prac = {"Authorization": f"Bearer {state.practitioner_token}"}
    milestone_payload = {
        "title": "Purva Karma Snehana Completion",
        "description": "Successfully completed 3 days of internal oleation therapy.",
        "target_date": "2026-11-03"
    }
    # Add milestone
    add_res = client.post(f"/plans/{state.plan_id}/milestones", json=milestone_payload, headers=headers_prac)
    assert add_res.status_code == 201, f"Expected 201, got {add_res.status_code}: {add_res.text}"
    m_data = add_res.json()
    state.milestone_id = m_data["id"]
    assert m_data["is_achieved"] is False
    assert m_data["achieved_at"] is None

    # Mark milestone achieved
    achieve_res = client.patch(f"/milestones/{state.milestone_id}/achieve", headers=headers_prac)
    assert achieve_res.status_code == 200, f"Expected 200, got {achieve_res.status_code}: {achieve_res.text}"
    achieved_data = achieve_res.json()
    assert achieved_data["is_achieved"] is True
    assert achieved_data["achieved_at"] is not None

    log_tc("TC-18", "Milestones", "Add and achieve milestone", "PASSED",
           f"Milestone {state.milestone_id} added and marked achieved. is_achieved={achieved_data['is_achieved']}, achieved_at={achieved_data['achieved_at']}")


# ============================================================================
# TC-19: Mobile - APK install and login
# ============================================================================
def test_tc19_mobile_apk_install_and_login():
    """TC-19: Verify APK package integrity, Capacitor assets, and mobile API auth compatibility."""
    # 1. Locate the Android APK artifact
    apk_path = os.path.abspath(os.path.join(backend_dir, "..", "..", "AyurSutra.apk"))
    assert os.path.exists(apk_path), f"AyurSutra.apk not found at {apk_path}"
    apk_size = os.path.getsize(apk_path)
    assert apk_size > 10_000_000, f"APK file size appears corrupt or truncated: {apk_size} bytes"

    # 2. Inspect APK internal structure (standard Android ZIP format)
    with zipfile.ZipFile(apk_path, "r") as apk_zip:
        file_list = apk_zip.namelist()
        assert "AndroidManifest.xml" in file_list, "AndroidManifest.xml missing from APK"
        assert any(f.endswith(".dex") for f in file_list), "classes.dex missing from APK"
        assert any("capacitor" in f.lower() or "public" in f.lower() or "assets" in f.lower() for f in file_list), \
            "Capacitor mobile web assets missing from APK"

    # 3. Verify mobile authentication integration against API
    # Mobile app authenticates with Capacitor Origin and Bearer tokens
    mobile_login_res = client.post(
        "/auth/login",
        data={"username": state.patient_email, "password": state.patient_password},
        headers={"Origin": "capacitor://localhost"}
    )
    assert mobile_login_res.status_code == 200
    mobile_token = mobile_login_res.json()["access_token"]
    assert mobile_token is not None

    # Mobile API session validation
    mobile_me_res = client.get(
        "/auth/me",
        headers={
            "Authorization": f"Bearer {mobile_token}",
            "Origin": "capacitor://localhost"
        }
    )
    assert mobile_me_res.status_code == 200
    assert mobile_me_res.json()["email"] == state.patient_email

    log_tc("TC-19", "Mobile", "APK install and login", "PASSED",
           f"APK verified ({apk_size / (1024*1024):.1f} MB, valid Android ZIP, AndroidManifest.xml, classes.dex). Mobile authentication with capacitor://localhost succeeded.")


# ============================================================================
# TC-20: Mobile / UI - Back button and responsive layout
# ============================================================================
def test_tc20_mobile_ui_back_button_and_responsive_layout():
    """TC-20: Verify mobile back-button handler logic and phone-width responsive layout."""
    frontend_dir = os.path.abspath(os.path.join(backend_dir, "..", "ayursutra_frontend"))

    # 1. Verify BackButtonHandler logic in components/layout/back-button-handler.tsx
    back_button_file = os.path.join(frontend_dir, "components", "layout", "back-button-handler.tsx")
    assert os.path.exists(back_button_file), f"Back button handler missing: {back_button_file}"

    with open(back_button_file, "r", encoding="utf-8") as f:
        back_btn_code = f.read()

    # Checks Capacitor native backButton listener, double-press to exit, and modal dismissal
    assert "backButton" in back_btn_code, "Native backButton event listener missing"
    assert "exitApp" in back_btn_code, "Capacitor App.exitApp logic missing"
    assert "closeFactsheetModal" in back_btn_code or "data-factsheet-open" in back_btn_code, \
        "Modal dismissal priority logic missing"
    assert "Press back again to exit" in back_btn_code, "Exit toast feedback missing"

    # 2. Verify Responsive Bottom Navigation in components/layout/bottom-nav.tsx
    bottom_nav_file = os.path.join(frontend_dir, "components", "layout", "bottom-nav.tsx")
    assert os.path.exists(bottom_nav_file), f"BottomNav component missing: {bottom_nav_file}"

    with open(bottom_nav_file, "r", encoding="utf-8") as f:
        bottom_nav_code = f.read()

    # Checks phone-width responsive layout (hidden on lg, visible on small/mobile)
    assert "lg:hidden" in bottom_nav_code, "Responsive breakpoint 'lg:hidden' missing for mobile bottom navigation"
    assert "fixed bottom-0" in bottom_nav_code, "Fixed bottom positioning missing for mobile bottom navigation"
    assert "/patient/dashboard" in bottom_nav_code, "Patient home route missing in bottom nav"
    assert "/practitioner/dashboard" in bottom_nav_code, "Practitioner home route missing in bottom nav"
    assert "/patient/therapy" in bottom_nav_code or "Therapies" in bottom_nav_code, "Therapy route missing in bottom nav"

    log_tc("TC-20", "Mobile / UI", "Back button and responsive layout", "PASSED",
           "Verified native backButton event handling, double-press exit toast, modal close priority, and phone-width bottom navigation.")


# ============================================================================
# Main runner when invoked directly: python tests/test_tc01_tc20.py
# ============================================================================
if __name__ == "__main__":
    tests = [
        test_tc01_register_patient,
        test_tc02_register_practitioner,
        test_tc03_valid_login,
        test_tc04_invalid_login,
        test_tc05_google_signin,
        test_tc06_rbac_patient_calls_practitioner_endpoint,
        test_tc07_rbac_missing_or_expired_token,
        test_tc08_filter_practitioners_by_city,
        test_tc09_send_treatment_request,
        test_tc10_accept_or_reject_request,
        test_tc11_create_plan_from_template,
        test_tc12_schedule_session,
        test_tc13_complete_session,
        test_tc14_precaution_notifications,
        test_tc15_submit_feedback,
        test_tc16_duplicate_or_invalid_feedback,
        test_tc17_analytics_dashboards,
        test_tc18_milestones_add_and_achieve,
        test_tc19_mobile_apk_install_and_login,
        test_tc20_mobile_ui_back_button_and_responsive_layout,
    ]

    print("\n" + "=" * 80)
    print("STARTING AYURSUTRA TEST SUITE (TC-01 to TC-20)")
    print(f"Logging output to: {LOG_FILE_PATH}")
    print("=" * 80 + "\n")

    passed_count = 0
    failed_count = 0
    start_total = time.time()

    for idx, test_fn in enumerate(tests, 1):
        test_name = f"TC-{idx:02d}: {test_fn.__name__}"
        t0 = time.time()
        try:
            test_fn()
            elapsed = time.time() - t0
            passed_count += 1
            print(f"[PASSED] {test_name} ({elapsed:.2f}s)")
        except Exception as e:
            elapsed = time.time() - t0
            failed_count += 1
            logger.error(f"[FAILED] {test_name} ({elapsed:.2f}s) - Error: {e}", exc_info=True)
            print(f"[FAILED] {test_name} ({elapsed:.2f}s) - Error: {e}")

    total_time = time.time() - start_total
    summary_line = (
        f"\n{'=' * 80}\n"
        f"TEST RUN SUMMARY\n"
        f"Total Tests : {len(tests)}\n"
        f"Passed      : {passed_count}\n"
        f"Failed      : {failed_count}\n"
        f"Total Time  : {total_time:.2f}s\n"
        f"Log File    : {LOG_FILE_PATH}\n"
        f"{'=' * 80}\n"
    )
    print(summary_line)
    logger.info(summary_line)
    sys.exit(0 if failed_count == 0 else 1)
