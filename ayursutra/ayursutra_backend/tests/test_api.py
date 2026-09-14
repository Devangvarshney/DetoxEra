from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
import pytest

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_db():
    db = SessionLocal()
    yield db
    db.close()

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "AyurSutra API is running" in response.json()["message"]

def test_register_patient():
    import time
    unique_email = f"testpatient_{time.time()}@example.com"
    payload = {
        "user_in": {
            "email": unique_email,
            "password": "password123",
            "role": "patient"
        },
        "patient_in": {
            "name": "Test Patient",
            "phone": "1234567890",
            "age": 30,
            "gender": "Male"
        }
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    assert response.json()["email"] == unique_email
    assert response.json()["role"] == "patient"

def test_login_patient():
    import time
    unique_email = f"testpatient_login_{time.time()}@example.com"
    # Register first
    payload = {
        "user_in": {
            "email": unique_email,
            "password": "password123",
            "role": "patient"
        },
        "patient_in": {
            "name": "Test Patient Login"
        }
    }
    client.post("/auth/register", json=payload)
    
    # Login
    login_data = {
        "username": unique_email,
        "password": "password123"
    }
    response = client.post("/auth/login", data=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"
