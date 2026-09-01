from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

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
            "education_level": "College",
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
    assert profile_response.json()["education_level"] == "College"
    assert profile_response.json()["current_level_id"] == 1


def test_registration_rejects_invalid_values_and_duplicate_email():
    base_payload = {
        "first_name": "Sam",
        "email": f"sam+{uuid4().hex}@example.com",
        "password": "StrongPass123!",
        "learning_language": "hi",
    }

    assert client.post("/auth/register", json={**base_payload, "age": 4}).status_code == 422
    assert client.post("/auth/register", json={**base_payload, "password": "short"}).status_code == 422
    assert client.post("/auth/register", json={**base_payload, "learning_language": "EN"}).status_code == 422
    assert client.post("/auth/register", json={**base_payload, "learning_language": "zz"}).status_code == 400
    assert client.post("/auth/register", json={**base_payload, "first_name": " "}).status_code == 422

    assert client.post("/auth/register", json=base_payload).status_code == 201
    assert client.post("/auth/register", json=base_payload).status_code == 400


def test_password_reset_updates_login_password():
    email = f"reset+{uuid4().hex}@example.com"
    payload = {"first_name": "Reset", "email": email, "password": "OldPass123!", "learning_language": "ta"}
    assert client.post("/auth/register", json=payload).status_code == 201

    missing_user = client.post("/auth/forgot-password", json={"email": "missing@example.com", "password": "NewPass123!"})
    assert missing_user.status_code == 404

    reset = client.post("/auth/forgot-password", json={"email": email, "password": "NewPass123!"})
    assert reset.status_code == 200
    assert client.post("/auth/login", json={"email": email, "password": "OldPass123!"}).status_code == 401
    assert client.post("/auth/login", json={"email": email, "password": "NewPass123!"}).status_code == 200
