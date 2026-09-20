from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.dependencies import get_current_user, require_admin
from app.models.user import User
from app.models.learning import LearnerProfile
from app.schemas.user import PasswordReset, Token, UserCreate, UserLogin, UserResponse
from app.utils.security import create_access_token, get_password_hash, verify_password

router = APIRouter()


@router.post("/admin/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def bootstrap_admin_user(
    payload: UserCreate,
    admin_setup_key: str = Header(default="", alias="X-Admin-Setup-Key"),
    db: Session = Depends(get_db),
):
    if not settings.ADMIN_SETUP_KEY or admin_setup_key != settings.ADMIN_SETUP_KEY:
        raise HTTPException(status_code=403, detail="Admin setup is not available")

    if db.query(User).filter(User.role == "admin").first():
        raise HTTPException(status_code=409, detail="An admin account already exists")

    first_name, last_name = payload.names()
    user = User(
        first_name=first_name,
        last_name=last_name,
        email=payload.email.lower(),
        password_hash=get_password_hash(payload.password),
        role="admin",
    )
    profile = LearnerProfile(
        native_language=payload.native_language.strip(),
        learning_language=payload.learning_language,
        gender=payload.gender.strip(),
        user=user,
    )
    db.add(user)
    db.add(profile)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Could not create admin account")

    return {
        "message": "Admin account created successfully",
        "user": UserResponse.model_validate(user),
    }


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

    first_name, last_name = payload.names()
    user = User(
        first_name=first_name,
        last_name=last_name,
        email=payload.email.lower(),
        password_hash=get_password_hash(payload.password),
        role="user",
    )
    profile = LearnerProfile(
        age=payload.age,
        native_language=payload.native_language.strip(),
        learning_language=payload.learning_language,
        gender=payload.gender.strip(),
        current_level_id=payload.current_level_id,
    )

    db.add(user)
    try:
        db.commit()
        db.refresh(user)
        profile.user_id = user.id
        db.add(profile)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Could not create user")

    return {
        "message": "User registered successfully",
        "user": UserResponse.model_validate(user),
    }


@router.post("/admin/users", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_admin_user(
    payload: UserCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    first_name, last_name = payload.names()
    user = User(
        first_name=first_name,
        last_name=last_name,
        email=payload.email.lower(),
        password_hash=get_password_hash(payload.password),
        role=payload.role,
    )
    profile = LearnerProfile(
        age=payload.age,
        native_language=payload.native_language.strip(),
        learning_language=payload.learning_language,
        gender=payload.gender.strip(),
        current_level_id=payload.current_level_id,
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
        profile.user_id = user.id
        db.add(profile)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Could not create user")

    return {
        "message": "Account created successfully",
        "user": UserResponse.model_validate(user),
    }


import time

@router.post("/login", response_model=dict)
def login_user(payload: UserLogin, response: Response, db: Session = Depends(get_db)):
    start = time.perf_counter()

    # 1. Database lookup
    db_start = time.perf_counter()
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    db_time = time.perf_counter() - db_start

    # 2. Password verification
    password_start = time.perf_counter()
    password_valid = user and verify_password(
        payload.password,
        user.password_hash
    )
    password_time = time.perf_counter() - password_start

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account is disabled.")

    if payload.login_mode != "auto" and user.role != payload.login_mode:
        raise HTTPException(
            status_code=400,
            detail=f"These credentials are not valid for {payload.login_mode} login.",
        )

    # 3. JWT creation
    token_start = time.perf_counter()
    token = create_access_token(user.id)
    token_time = time.perf_counter() - token_start

    response.set_cookie(
        key="neolit_access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    total_time = time.perf_counter() - start

    print(
        f"LOGIN TIMING | "
        f"DB={db_time:.3f}s | "
        f"PASSWORD={password_time:.3f}s | "
        f"JWT={token_time:.3f}s | "
        f"TOTAL={total_time:.3f}s"
    )

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user),
    }


@router.post("/login/admin", response_model=dict)
def admin_login(payload: UserLogin, response: Response, db: Session = Depends(get_db)):
    admin_payload = payload.model_copy(update={"login_mode": "admin"})
    return login_user(admin_payload, response, db)

@router.post("/forgot-password")
def reset_password(payload: PasswordReset, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if user:
        user.password_hash = get_password_hash(payload.password)
        db.commit()

    return {"message": "If that email is registered, the password was reset successfully"}


@router.post("/logout")
def logout_user(response: Response):
    response.delete_cookie(
        key="neolit_access_token",
        secure=True,
        samesite="none",
        path="/",
    )
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
