import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.db.session import get_db, Base
from app.models.user import User, UserRole
from app.core.security import hash_password

# Use in-memory SQLite with StaticPool so all threads share the memory DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


# 1. Successful Registration
def test_successful_registration():
    response = client.post(
        "/auth/register",
        json={
            "full_name": "Student Alex",
            "email": "alex@student.edu",
            "password": "Password123!",
            "role": "STUDENT",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "alex@student.edu"
    assert data["user"]["role"] == "STUDENT"


# 2. Duplicate Email Registration
def test_duplicate_email_registration():
    payload = {
        "full_name": "Student Alex",
        "email": "alex@student.edu",
        "password": "Password123!",
        "role": "STUDENT",
    }
    client.post("/auth/register", json=payload)
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


# 3. Invalid Email Registration
def test_invalid_email_registration():
    response = client.post(
        "/auth/register",
        json={
            "full_name": "Invalid Email",
            "email": "not-an-email",
            "password": "Password123!",
            "role": "STUDENT",
        },
    )
    assert response.status_code == 422


# 4. Short Password Registration
def test_short_password_registration():
    response = client.post(
        "/auth/register",
        json={
            "full_name": "Short Pass",
            "email": "short@student.edu",
            "password": "123",
            "role": "STUDENT",
        },
    )
    assert response.status_code == 422


# 5. Public Registration with ADMIN Role Blocked
def test_admin_public_registration_blocked():
    response = client.post(
        "/auth/register",
        json={
            "full_name": "Fake Admin",
            "email": "hacker@admin.com",
            "password": "Password123!",
            "role": "ADMIN",
        },
    )
    assert response.status_code in [400, 422]


# 6. Successful Login
def test_successful_login():
    client.post(
        "/auth/register",
        json={
            "full_name": "User One",
            "email": "user1@edupass.org",
            "password": "SecurePassword123!",
            "role": "INSTITUTION",
        },
    )
    response = client.post(
        "/auth/login",
        json={
            "email": "user1@edupass.org",
            "password": "SecurePassword123!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "INSTITUTION"


# 7. Invalid Login
def test_invalid_login():
    client.post(
        "/auth/register",
        json={
            "full_name": "User One",
            "email": "user1@edupass.org",
            "password": "SecurePassword123!",
            "role": "INSTITUTION",
        },
    )
    response = client.post(
        "/auth/login",
        json={
            "email": "user1@edupass.org",
            "password": "WrongPassword!",
        },
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


# 8. GET /auth/me Without Token
def test_get_me_unauthenticated():
    response = client.get("/auth/me")
    assert response.status_code == 401


# 9. GET /auth/me With Valid Token
def test_get_me_authenticated():
    reg = client.post(
        "/auth/register",
        json={
            "full_name": "Me User",
            "email": "me@edupass.org",
            "password": "SecurePassword123!",
            "role": "VERIFIER",
        },
    ).json()
    token = reg["access_token"]

    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@edupass.org"
    assert data["role"] == "VERIFIER"


# 10. Student Accessing Student Endpoint
def test_student_role_authorization():
    reg = client.post(
        "/auth/register",
        json={
            "full_name": "Student Bob",
            "email": "bob@student.edu",
            "password": "Password123!",
            "role": "STUDENT",
        },
    ).json()
    token = reg["access_token"]

    response = client.get(
        "/protected/student",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Access granted to STUDENT endpoint"


# 11. Student Attempting Institution Endpoint (Forbidden)
def test_student_attempting_institution_endpoint():
    reg = client.post(
        "/auth/register",
        json={
            "full_name": "Student Bob",
            "email": "bob@student.edu",
            "password": "Password123!",
            "role": "STUDENT",
        },
    ).json()
    token = reg["access_token"]

    response = client.get(
        "/protected/institution",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
    assert "Access forbidden" in response.json()["detail"]


# 12. Institution Accessing Institution Endpoint
def test_institution_role_authorization():
    reg = client.post(
        "/auth/register",
        json={
            "full_name": "MIT Registrar",
            "email": "registrar@mit.edu",
            "password": "Password123!",
            "role": "INSTITUTION",
        },
    ).json()
    token = reg["access_token"]

    response = client.get(
        "/protected/institution",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200


# 13. Admin Endpoint Authorization
def test_admin_role_authorization():
    db = TestingSessionLocal()
    admin = User(
        full_name="Platform Admin",
        email="admin@edupass.org",
        password_hash=hash_password("AdminPass123!"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    db.close()

    login_res = client.post(
        "/auth/login",
        json={
            "email": "admin@edupass.org",
            "password": "AdminPass123!",
        },
    ).json()
    token = login_res["access_token"]

    response = client.get(
        "/protected/admin",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200


# 14. Logout
def test_logout():
    reg = client.post(
        "/auth/register",
        json={
            "full_name": "Logout Test",
            "email": "logout@edupass.org",
            "password": "Password123!",
            "role": "EMPLOYER",
        },
    ).json()
    token = reg["access_token"]

    response = client.post(
        "/auth/logout",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Successfully logged out"
