from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class LearnerProfile(Base):
    __tablename__ = "learner_profiles"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(40), default="", nullable=False)
    native_language = Column(String(80), default="", nullable=False)
    learning_language = Column(String(20), default="en", nullable=False)
    education_level = Column(String(80), default="", nullable=False)
    current_level_id = Column(Integer, ForeignKey("levels.id"), nullable=True, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", back_populates="profile")
    current_level = relationship("Level")


class Language(Base):
    __tablename__ = "languages"
    id = Column(Integer, primary_key=True)
    name = Column(String(80), unique=True, nullable=False)
    code = Column(String(12), unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    modules = relationship("Module", back_populates="language")
    contents = relationship("Content", back_populates="language")


class Level(Base):
    __tablename__ = "levels"
    id = Column(Integer, primary_key=True)
    name = Column(String(40), unique=True, nullable=False)
    description = Column(Text, default="", nullable=False)
    minimum_score = Column(Integer, nullable=False)
    maximum_score = Column(Integer, nullable=False)
    modules = relationship("Module", back_populates="level")


class Module(Base):
    __tablename__ = "modules"
    id = Column(Integer, primary_key=True)
    language_id = Column(Integer, ForeignKey("languages.id"), nullable=False, index=True)
    level_id = Column(Integer, ForeignKey("levels.id"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, default="", nullable=False)
    order_number = Column(Integer, default=1, nullable=False)
    language = relationship("Language", back_populates="modules")
    level = relationship("Level", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, default="", nullable=False)
    order_number = Column(Integer, default=1, nullable=False)
    lesson_type = Column(String(40), default="mixed", nullable=False)
    module = relationship("Module", back_populates="lessons")
    activities = relationship("Activity", back_populates="lesson", cascade="all, delete-orphan")
    contents = relationship("Content", back_populates="lesson", cascade="all, delete-orphan")


class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    activity_type = Column(String(40), nullable=False)
    content = Column(Text, nullable=False)
    order_number = Column(Integer, default=1, nullable=False)
    lesson = relationship("Lesson", back_populates="activities")


class Content(Base):
    __tablename__ = "contents"
    id = Column(Integer, primary_key=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False, index=True)
    language_id = Column(Integer, ForeignKey("languages.id"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    content_type = Column(String(40), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    lesson = relationship("Lesson", back_populates="contents")
    language = relationship("Language", back_populates="contents")
    translations = relationship("ContentTranslation", back_populates="content", cascade="all, delete-orphan")


class ContentTranslation(Base):
    __tablename__ = "content_translations"
    id = Column(Integer, primary_key=True)
    content_id = Column(Integer, ForeignKey("contents.id"), nullable=False, index=True)
    language_id = Column(Integer, ForeignKey("languages.id"), nullable=False, index=True)
    translated_text = Column(Text, nullable=False)
    content = relationship("Content", back_populates="translations")
    language = relationship("Language")


class Assessment(Base):
    __tablename__ = "assessments"
    id = Column(Integer, primary_key=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, default="", nullable=False)
    assessment_type = Column(String(30), nullable=False, index=True)
    language_id = Column(Integer, ForeignKey("languages.id"), nullable=False, index=True)
    level_id = Column(Integer, ForeignKey("levels.id"), nullable=False, index=True)
    total_marks = Column(Integer, default=0, nullable=False)
    passing_marks = Column(Integer, default=0, nullable=False)
    language = relationship("Language")
    level = relationship("Level")
    questions = relationship("Question", back_populates="assessment", cascade="all, delete-orphan")
    attempts = relationship("AssessmentAttempt", back_populates="assessment")


class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(30), nullable=False)
    marks = Column(Integer, default=1, nullable=False)
    correct_answer = Column(Text, default="", nullable=False)
    assessment = relationship("Assessment", back_populates="questions")
    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan")


class QuestionOption(Base):
    __tablename__ = "question_options"
    id = Column(Integer, primary_key=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False, index=True)
    option_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)
    question = relationship("Question", back_populates="options")


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False, index=True)
    score = Column(Integer, default=0, nullable=False)
    percentage = Column(Integer, default=0, nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    user = relationship("User", back_populates="attempts")
    assessment = relationship("Assessment", back_populates="attempts")
    answers = relationship("AssessmentAnswer", back_populates="attempt", cascade="all, delete-orphan")


class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"
    id = Column(Integer, primary_key=True)
    attempt_id = Column(Integer, ForeignKey("assessment_attempts.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False, index=True)
    answer_text = Column(Text, default="", nullable=False)
    marks_obtained = Column(Integer, default=0, nullable=False)
    attempt = relationship("AssessmentAttempt", back_populates="answers")
    question = relationship("Question")


class LearnerProgress(Base):
    __tablename__ = "learner_progress"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    skill = Column(String(30), nullable=False)
    score = Column(Integer, default=0, nullable=False)
    proficiency_level = Column(String(40), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=True, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", back_populates="progress")
    assessment = relationship("Assessment")
