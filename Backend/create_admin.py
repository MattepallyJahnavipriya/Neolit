from getpass import getpass

from app.database import SessionLocal
from app.models.learning import LearnerProfile
from app.models.user import User
from app.utils.security import get_password_hash


def prompt_required(label):
    value = input(f"{label}: ").strip()
    if not value:
        raise ValueError(f"{label} is required")
    return value


def main():
    print("NeoLit admin account setup")
    first_name = prompt_required("First name")
    last_name = input("Last name (optional): ").strip()
    email = prompt_required("Email").lower()
    password = getpass("Password (minimum 8 characters): ")
    confirm_password = getpass("Confirm password: ")

    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if password != confirm_password:
        raise ValueError("Passwords do not match")

    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            if existing_user.role == "admin":
                raise ValueError("An admin account with this email already exists")
            raise ValueError("This email already belongs to a user account")

        admin = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password_hash=get_password_hash(password),
            role="admin",
            is_active=1,
        )
        db.add(admin)
        db.flush()
        db.add(LearnerProfile(user_id=admin.id, learning_language="en"))
        db.commit()
        print(f"Admin account created: {email}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyboardInterrupt) as error:
        print(f"Could not create admin: {error}")
        raise SystemExit(1)
