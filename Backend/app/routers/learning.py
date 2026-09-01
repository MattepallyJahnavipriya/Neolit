from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.learning import (
    Assessment, AssessmentAnswer, AssessmentAttempt, Language, LearnerProfile,
    LearnerProgress, Lesson, Level, Module, Question,
)
from app.models.user import User
from app.schemas.learning import (
    AssessmentResponse, AssessmentResult, AssessmentSubmission, LanguageResponse,
    LevelResponse, LessonResponse, ModuleResponse, ProfileResponse, ProfileUpdate,
    ProgressResponse,
)

router = APIRouter()
BENCHMARKS = ((0, "Beginner"), (40, "Elementary"), (60, "Intermediate"), (75, "Upper Intermediate"), (90, "Advanced"))


def require_active_language(db: Session, code: str):
    language = db.query(Language).filter(Language.code == code, Language.is_active.is_(True)).first()
    if not language:
        raise HTTPException(status_code=400, detail="Preferred language is not available")
    return language


def benchmark(score: float) -> str:
    return next(name for minimum, name in reversed(BENCHMARKS) if score >= minimum)


def full_module_query(db: Session):
    return db.query(Module).options(
        joinedload(Module.lessons).joinedload(Lesson.activities),
        joinedload(Module.lessons).joinedload(Lesson.contents),
    )


@router.get("/languages", response_model=list[LanguageResponse])
def list_languages(db: Session = Depends(get_db)):
    return db.query(Language).filter(Language.is_active.is_(True)).order_by(Language.name).all()


@router.get("/levels", response_model=list[LevelResponse])
def list_levels(db: Session = Depends(get_db)):
    return db.query(Level).order_by(Level.minimum_score).all()


@router.get("/curriculum", response_model=list[ModuleResponse])
def list_curriculum(language_id: int | None = None, level_id: int | None = None, db: Session = Depends(get_db)):
    query = full_module_query(db)
    if language_id:
        query = query.filter(Module.language_id == language_id)
    if level_id:
        query = query.filter(Module.level_id == level_id)
    return query.order_by(Module.order_number).all()


@router.get("/curriculum/{language_id}/{level_id}", response_model=list[ModuleResponse])
def curriculum_by_level(language_id: int, level_id: int, db: Session = Depends(get_db)):
    return full_module_query(db).filter(Module.language_id == language_id, Module.level_id == level_id).order_by(Module.order_number).all()


@router.get("/modules/{module_id}", response_model=ModuleResponse)
def get_module(module_id: int, db: Session = Depends(get_db)):
    module = full_module_query(db).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(404, "Module not found")
    return module


@router.get("/lessons/{lesson_id}", response_model=LessonResponse)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).options(joinedload(Lesson.activities), joinedload(Lesson.contents)).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(404, "Lesson not found")
    return lesson


@router.get("/content", response_model=list)
def list_content(lesson_id: int | None = None, language_id: int | None = None, db: Session = Depends(get_db)):
    from app.models.learning import Content
    query = db.query(Content).options(joinedload(Content.translations))
    if lesson_id:
        query = query.filter(Content.lesson_id == lesson_id)
    if language_id:
        query = query.filter(Content.language_id == language_id)
    return query.order_by(Content.id).all()


@router.get("/assessments", response_model=list[AssessmentResponse])
def list_assessments(assessment_type: str | None = None, language_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Assessment).options(joinedload(Assessment.questions).joinedload(Question.options))
    if assessment_type:
        query = query.filter(Assessment.assessment_type == assessment_type)
    if language_id:
        query = query.filter(Assessment.language_id == language_id)
    return query.order_by(Assessment.id).all()


@router.get("/assessments/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).options(joinedload(Assessment.questions).joinedload(Question.options)).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(404, "Assessment not found")
    return assessment


@router.post("/assessments/{assessment_id}/submit", response_model=AssessmentResult, status_code=status.HTTP_201_CREATED)
def submit_assessment(assessment_id: int, payload: AssessmentSubmission, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    assessment = get_assessment(assessment_id, db)
    score = 0
    attempt = AssessmentAttempt(user_id=current_user.id, assessment_id=assessment.id, started_at=payload.started_at or datetime.utcnow())
    db.add(attempt)
    db.flush()
    for question in assessment.questions:
        answer = str(payload.answers.get(question.id, "")).strip()
        marks = question.marks if answer.casefold() == question.correct_answer.strip().casefold() else 0
        score += marks
        attempt.answers.append(AssessmentAnswer(question_id=question.id, answer_text=answer, marks_obtained=marks))
    percentage = round(score / assessment.total_marks * 100, 2) if assessment.total_marks else 0
    attempt.score, attempt.percentage, attempt.completed_at = score, percentage, datetime.utcnow()
    db.add(LearnerProgress(user_id=current_user.id, skill=assessment.assessment_type, score=percentage, proficiency_level=benchmark(percentage), assessment_id=assessment.id))
    db.commit()
    db.refresh(attempt)
    return {"attempt_id": attempt.id, "score": score, "total_marks": assessment.total_marks, "percentage": percentage, "proficiency_level": benchmark(percentage)}


@router.get("/users/me", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    if profile is None:
        profile = LearnerProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "age": profile.age,
        "gender": profile.gender,
        "native_language": profile.native_language,
        "learning_language": profile.learning_language,
        "education_level": profile.education_level,
        "current_level_id": profile.current_level_id,
        "updated_at": profile.updated_at,
    }


@router.put("/users/me", response_model=ProfileResponse)
def update_profile(payload: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    require_active_language(db, payload.learning_language)
    profile = current_user.profile or LearnerProfile(user_id=current_user.id)
    current_user.first_name, current_user.last_name = payload.first_name.strip(), payload.last_name.strip()
    for field, value in payload.model_dump().items():
        if field not in {"first_name", "last_name"}:
            setattr(profile, field, value)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "age": profile.age,
        "gender": profile.gender,
        "native_language": profile.native_language,
        "learning_language": profile.learning_language,
        "education_level": profile.education_level,
        "current_level_id": profile.current_level_id,
        "updated_at": profile.updated_at,
    }


@router.get("/progress/me", response_model=ProgressResponse)
def get_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    values = {}
    for skill in ("reading", "writing", "comprehension"):
        latest = db.query(LearnerProgress).filter(LearnerProgress.user_id == current_user.id, LearnerProgress.skill == skill).order_by(LearnerProgress.updated_at.desc()).first()
        values[skill] = {"score": latest.score if latest else 0, "level": latest.proficiency_level if latest else "Beginner"}
    overall_score = round(sum(item["score"] for item in values.values()) / 3, 2)
    values["overall"] = {"score": overall_score, "level": benchmark(overall_score)}
    return values
