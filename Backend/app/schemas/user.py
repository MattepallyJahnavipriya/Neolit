from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


class UserCreate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=80)
    last_name: str = Field(default="", max_length=80)
    name: str | None = Field(default=None, max_length=160)
    email: EmailStr
    password: str = Field(min_length=8)
    age: int | None = Field(default=None, ge=5, le=120)
    native_language: str = Field(default="", max_length=80)
    learning_language: str = Field(default="en", min_length=2, max_length=12)
    gender: str = Field(default="", max_length=40)
    current_level_id: int | None = None
    role: str = Field(default="user", max_length=20)

    @field_validator("first_name", "last_name", "name", "native_language", "learning_language", "gender", "role", mode="before")
    @classmethod
    def strip_text(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("role")
    @classmethod
    def validate_role(cls, value):
        normalized = (value or "user").lower()
        if normalized not in {"user", "admin"}:
            raise ValueError("Role must be either 'user' or 'admin'")
        return normalized

    @model_validator(mode="after")
    def require_name(self):
        if not self.first_name and not self.name:
            raise ValueError("A first name or full name is required")
        return self

    def names(self) -> tuple[str, str]:
        if self.first_name:
            return self.first_name.strip(), self.last_name.strip()
        parts = (self.name or "").strip().split(maxsplit=1)
        return parts[0], parts[1] if len(parts) > 1 else ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    login_mode: str = Field(default="auto", max_length=10)

    @field_validator("login_mode", mode="before")
    @classmethod
    def validate_login_mode(cls, value):
        normalized = (value or "auto").lower()
        if normalized not in {"auto", "user", "admin"}:
            raise ValueError("Login mode must be user or admin")
        return normalized

class AdminUserUpdate(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(default="", max_length=80)
    email: EmailStr
    role: str = Field(default="user", max_length=20)

    @field_validator("first_name", "last_name", "role", mode="before")
    @classmethod
    def strip_update_text(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("role")
    @classmethod
    def validate_update_role(cls, value):
        normalized = value.lower()
        if normalized not in {"user", "admin"}:
            raise ValueError("Role must be either 'user' or 'admin'")
        return normalized


class AdminPasswordReset(BaseModel):
    password: str = Field(min_length=8, max_length=255)


class PasswordReset(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    role: str = "user"
    created_at: datetime
    updated_at: datetime | None = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
