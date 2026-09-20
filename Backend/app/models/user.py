from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(80), nullable=False)
    last_name = Column(String(80), default="", nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)
    is_active = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    attempts = relationship("AssessmentAttempt", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("LearnerProgress", back_populates="user", cascade="all, delete-orphan")
    stats = relationship("LearnerStats", back_populates="user", uselist=False, cascade="all, delete-orphan")
    lesson_completions = relationship("LessonCompletion", back_populates="user", cascade="all, delete-orphan")
    game_activity = relationship("GameActivity", back_populates="user", cascade="all, delete-orphan")
    profile = relationship("LearnerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

    @property
    def name(self):
        return f"{self.first_name} {self.last_name}".strip()
