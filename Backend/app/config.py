import os
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "mysql+pymysql://root:root@localhost:3306/duoling_db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "https://neolit-literacy-platform.vercel.app,https://neolit-literacy-platform-niylk93x0.vercel.app,http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173,http://127.0.0.1:4173",
    )
    CORS_ORIGIN_REGEX: str = os.getenv(
        "CORS_ORIGIN_REGEX",
        r"^https://neolit-literacy-platform(?:-[a-z0-9-]+)*\.vercel\.app$",
    )
    ADMIN_SETUP_KEY: str = os.getenv("ADMIN_SETUP_KEY", "")

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent / ".env",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
if settings.DATABASE_URL.startswith("sqlite:///./"):
    relative_path = settings.DATABASE_URL.removeprefix("sqlite:///./")
    settings.DATABASE_URL = f"sqlite:///{(BACKEND_DIR / relative_path).resolve().as_posix()}"
