from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class UserCreate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=80)
    last_name: str = Field(default="", max_length=80)
    name: str | None = Field(default=None, max_length=160)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    age: int | None = Field(default=None, ge=5, le=120)
    gender: str = Field(default="", max_length=40)
    native_language: str = Field(default="", max_length=80)
    learning_language: str = Field(default="en", min_length=2, max_length=12, pattern=r"^[a-z]{2,12}$")
    education_level: str = Field(default="", max_length=80)
    current_level_id: int | None = None

    @model_validator(mode="after")
    def require_name(self):
        if not (self.first_name and self.first_name.strip()) and not (self.name and self.name.strip()):
            raise ValueError("A first name or full name is required")
        return self

    def names(self) -> tuple[str, str]:
        if self.first_name and self.first_name.strip():
            return self.first_name.strip(), self.last_name.strip()
        parts = (self.name or "").strip().split(maxsplit=1)
        return parts[0], parts[1] if len(parts) > 1 else ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class PasswordReset(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    created_at: datetime
    updated_at: datetime | None = None


class AdminUserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
