from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


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
    answers: dict[int, str] = Field(default_factory=dict)
    started_at: datetime | None = None


class AssessmentResult(BaseModel):
    attempt_id: int
    score: int
    total_marks: int
    percentage: float
    proficiency_level: str


class ProfileUpdate(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(default="", max_length=80)
    age: int | None = Field(default=None, ge=5, le=120)
    gender: str = Field(default="", max_length=40)
    native_language: str = Field(default="", max_length=80)
    learning_language: str = Field(min_length=2, max_length=12, pattern=r"^[a-z]{2,12}$")
    education_level: str = Field(default="", max_length=80)
    current_level_id: int | None = None


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
