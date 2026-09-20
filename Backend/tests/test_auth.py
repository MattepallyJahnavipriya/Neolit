from uuid import uuid4

from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.models.user import User
from app.main import app
from app.utils.security import create_access_token
from app.utils.security import get_password_hash

client = TestClient(app)


def test_register_and_login_flow():
    email = f"alice.profile+{uuid4().hex}@example.com"
    response = client.post(
        "/auth/register",
        json={
            "name": "Alice",
            "email": email,
            "password": "StrongPass123!",
            "age": 25,
            "native_language": "Hindi",
            "learning_language": "en",
            "gender": "female",
            "current_level_id": 1,
        },
    )
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["user"]["email"] == email
    assert "password" not in data["user"]

    login_response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": "StrongPass123!",
        },
    )
    assert login_response.status_code == 200, login_response.text
    token = login_response.json()["access_token"]
    assert token
    assert "neolit_access_token=" in login_response.headers["set-cookie"]
    assert "Path=/" in login_response.headers["set-cookie"]

    me_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200, me_response.text
    assert me_response.json()["email"] == email

    profile_response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert profile_response.status_code == 200, profile_response.text
    assert profile_response.json()["age"] == 25
    assert profile_response.json()["native_language"] == "Hindi"
    assert profile_response.json()["learning_language"] == "en"
    assert profile_response.json()["gender"] == "female"
    assert profile_response.json()["current_level_id"] == 1

    reset_response = client.post(
        "/auth/forgot-password",
        json={"email": email, "password": "NewStrongPass456!"},
    )
    assert reset_response.status_code == 200, reset_response.text

    old_login_response = client.post(
        "/auth/login",
        json={"email": email, "password": "StrongPass123!"},
    )
    assert old_login_response.status_code == 401

    new_login_response = client.post(
        "/auth/login",
        json={"email": email, "password": "NewStrongPass456!"},
    )
    assert new_login_response.status_code == 200, new_login_response.text


def test_admin_role_registration_and_protection():
    public_email = f"public-role+{uuid4().hex}@example.com"
    admin_email = f"admin+{uuid4().hex}@example.com"
    register_response = client.post(
        "/api/auth/register",
        json={
            "name": "Admin User",
            "email": public_email,
            "password": "StrongPass123!",
            "role": "admin",
        },
    )
    assert register_response.status_code == 201, register_response.text
    assert register_response.json()["user"]["email"] == public_email
    assert register_response.json()["user"]["role"] == "user"

    db = SessionLocal()
    db_admin = User(
        first_name="Admin",
        last_name="User",
        email=admin_email,
        password_hash=get_password_hash("StrongPass123!"),
        role="admin",
    )
    db.add(db_admin)
    db.commit()
    db.close()

    token = client.post(
        "/api/auth/login",
        json={"email": admin_email, "password": "StrongPass123!", "login_mode": "admin"},
    ).json()["access_token"]

    admin_ok = client.get(
        "/api/admin/overview",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert admin_ok.status_code == 200, admin_ok.text

    user_email = f"learner+{uuid4().hex}@example.com"
    user_register = client.post(
        "/api/auth/register",
        json={
            "name": "Normal User",
            "email": user_email,
            "password": "StrongPass123!",
        },
    )
    assert user_register.status_code == 201, user_register.text
    user_token = client.post(
        "/api/auth/login",
        json={"email": user_email, "password": "StrongPass123!", "login_mode": "user"},
    ).json()["access_token"]

    admin_denied = client.get(
        "/api/admin/overview",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert admin_denied.status_code == 403, admin_denied.text

    users_response = client.get(
        "/api/admin/users",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert users_response.status_code == 200, users_response.text
    payload = users_response.json()
    assert isinstance(payload, list)
    assert any(item["email"] == admin_email for item in payload)
    assert any(item["email"] == user_email for item in payload)


def test_registration_validation_and_duplicate_email():
    missing_name = client.post(
        "/api/auth/register",
        json={"email": "valid@example.com", "password": "StrongPass123!"},
    )
    assert missing_name.status_code == 422

    whitespace_name = client.post(
        "/api/auth/register",
        json={"first_name": "   ", "email": "whitespace@example.com", "password": "StrongPass123!"},
    )
    assert whitespace_name.status_code == 422

    short_password = client.post(
        "/api/auth/register",
        json={"name": "Valid User", "email": "valid@example.com", "password": "short"},
    )
    assert short_password.status_code == 422

    invalid_email = client.post(
        "/api/auth/register",
        json={"name": "Valid User", "email": "not-an-email", "password": "StrongPass123!"},
    )
    assert invalid_email.status_code == 422

    email = f"duplicate+{uuid4().hex}@example.com"
    first = client.post(
        "/api/auth/register",
        json={"name": "Valid User", "email": email, "password": "StrongPass123!"},
    )
    assert first.status_code == 201, first.text
    duplicate = client.post(
        "/api/auth/register",
        json={"name": "Another User", "email": email.upper(), "password": "StrongPass123!"},
    )
    assert duplicate.status_code == 400


def test_reset_validation_and_unknown_email_do_not_change_accounts():
    invalid_reset = client.post(
        "/api/auth/forgot-password",
        json={"email": "not-an-email", "password": "short"},
    )
    assert invalid_reset.status_code == 422

    unknown_reset = client.post(
        "/api/auth/forgot-password",
        json={"email": "unknown@example.com", "password": "NewStrongPass456!"},
    )
    assert unknown_reset.status_code == 200


def test_invalid_token_returns_401():
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer malformed.token"},
    )
    assert response.status_code == 401

    invalid_subject = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {create_access_token('not-a-number')}"},
    )
    assert invalid_subject.status_code == 401


def test_assessment_submission_accepts_numeric_option_ids():
    email = f"assessment+{uuid4().hex}@example.com"
    register_response = client.post(
        "/api/auth/register",
        json={"name": "Assessment User", "email": email, "password": "StrongPass123!"},
    )
    assert register_response.status_code == 201, register_response.text

    token = client.post(
        "/api/auth/login",
        json={"email": email, "password": "StrongPass123!"},
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    assessment_response = client.get("/api/assessments", headers=headers)
    assert assessment_response.status_code == 200, assessment_response.text
    assessment_id = assessment_response.json()[0]["id"]

    attempt_response = client.post(
        f"/api/assessments/{assessment_id}/submit",
        headers=headers,
        json={"answers": {"1": 2, "2": "Reading books"}, "started_at": "2026-08-31T06:00:00Z"},
    )
    assert attempt_response.status_code == 201, attempt_response.text
    data = attempt_response.json()
    assert data["score"] >= 0
    assert data["total_marks"] > 0


def test_profile_update_rejects_invalid_boundaries():
    email = f"profile.validation+{uuid4().hex}@example.com"
    register_response = client.post(
        "/api/auth/register",
        json={"name": "Profile User", "email": email, "password": "StrongPass123!"},
    )
    assert register_response.status_code == 201, register_response.text
    token = client.post(
        "/api/auth/login",
        json={"email": email, "password": "StrongPass123!"},
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    invalid_age = client.put(
        "/api/users/me",
        headers=headers,
        json={"first_name": "Profile", "last_name": "User", "age": 121, "learning_language": "en"},
    )
    assert invalid_age.status_code == 422

    blank_first_name = client.put(
        "/api/users/me",
        headers=headers,
        json={"first_name": "   ", "last_name": "User", "age": 25, "learning_language": "en"},
    )
    assert blank_first_name.status_code == 422
