from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator


class ReadModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class LanguageResponse(ReadModel):
    id: int
    name: str
    code: str
    is_active: bool


class LevelResponse(ReadModel):
    id: int
    name: str
    description: str
    minimum_score: int
    maximum_score: int


class ActivityResponse(ReadModel):
    id: int
    title: str
    activity_type: str
    content: str
    order_number: int


class ContentTranslationResponse(ReadModel):
    id: int
    language_id: int
    translated_text: str


class ContentResponse(ReadModel):
    id: int
    title: str
    content_type: str
    content: str
    language_id: int
    translations: list[ContentTranslationResponse] = []


class LessonResponse(ReadModel):
    id: int
    title: str
    description: str
    order_number: int
    lesson_type: str
    activities: list[ActivityResponse] = []
    contents: list[ContentResponse] = []


class ModuleResponse(ReadModel):
    id: int
    title: str
    description: str
    order_number: int
    language_id: int
    level_id: int
    lessons: list[LessonResponse] = []


class QuestionOptionResponse(ReadModel):
    id: int
    option_text: str


class QuestionResponse(ReadModel):
    id: int
    question_text: str
    question_type: str
    marks: int
    options: list[QuestionOptionResponse] = []


class AssessmentResponse(ReadModel):
    id: int
    title: str
    description: str
    assessment_type: str
    language_id: int
    level_id: int
    total_marks: int
    passing_marks: int
    questions: list[QuestionResponse] = []


class AssessmentSubmission(BaseModel):
    answers: dict[str, str | int | float | bool | None] = Field(default_factory=dict)
    started_at: datetime | None = None

    @field_validator("answers", mode="before")
    @classmethod
    def normalize_answers(cls, value):
        if not isinstance(value, dict):
            return {}
        return {str(key): val for key, val in value.items()}


class AssessmentResult(BaseModel):
    attempt_id: int
    score: int
    total_marks: int
    percentage: float
    proficiency_level: str
    xp_earned: int = 0


class ProfileUpdate(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(default="", max_length=80)
    age: int | None = Field(default=None, ge=5, le=120)
    native_language: str = Field(default="", max_length=80)
    learning_language: str = Field(min_length=2, max_length=12)
    gender: str = Field(default="", max_length=40)
    current_level_id: int | None = None

    @field_validator("first_name", "last_name", "native_language", "learning_language", "gender", mode="before")
    @classmethod
    def strip_text(cls, value):
        return value.strip() if isinstance(value, str) else value


class LanguageUpdate(BaseModel):
    learning_language: str = Field(min_length=2, max_length=12)

    @field_validator("learning_language", mode="before")
    @classmethod
    def strip_language(cls, value):
        return value.strip() if isinstance(value, str) else value


class ProfileResponse(ProfileUpdate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    updated_at: datetime | None = None


class ProgressItem(BaseModel):
    score: float
    level: str


class ProgressResponse(BaseModel):
    reading: ProgressItem
    writing: ProgressItem
    comprehension: ProgressItem
    overall: ProgressItem


class LessonProgressRequest(BaseModel):
    language_code: str = Field(min_length=2, max_length=12)
    unit_number: int = Field(ge=1)
    lesson_step: int = Field(ge=0, le=2)
    score: int = Field(ge=0, le=3)


class AdminCourseRequest(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: str = Field(default="", max_length=2000)
    language_id: int = Field(gt=0)
    level_id: int = Field(gt=0)


class AdminLessonRequest(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: str = Field(default="", max_length=2000)
    lesson_type: str = Field(default="mixed", min_length=1, max_length=40)


class GameActivityRequest(BaseModel):
    game_id: str = Field(min_length=1, max_length=50)
    score: int = Field(default=0, ge=0)
    duration_seconds: int = Field(default=0, ge=0, le=86400)


class LessonCompletionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    language_code: str
    unit_number: int
    lesson_step: int
    score: int
    xp_earned: int
    completed_at: datetime


class LearningStateResponse(BaseModel):
    xp: int
    gems: int
    hearts: int
    streak_days: int
    daily_xp: int
    daily_lessons: int
    completions: list[LessonCompletionResponse] = []


class DashboardBootstrapResponse(BaseModel):
    languages: list[LanguageResponse]
    levels: list[LevelResponse]
    profile: ProfileResponse
    progress: ProgressResponse
    assessments: list[AssessmentResponse]
    learning_state: LearningStateResponse
