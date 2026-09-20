"""add indexes for common curriculum and learner queries

Revision ID: 20260907_add_query_indexes
Revises: 20260907_add_learning_state
Create Date: 2026-09-07
"""
from typing import Sequence, Union

from alembic import op


revision: str = "20260907_add_query_indexes"
down_revision: Union[str, None] = "20260907_add_learning_state"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index("ix_modules_language_level_order", "modules", ["language_id", "level_id", "order_number"])
    op.create_index("ix_lessons_module_order", "lessons", ["module_id", "order_number"])
    op.create_index("ix_activities_lesson", "activities", ["lesson_id"])
    op.create_index("ix_contents_lesson_language", "contents", ["lesson_id", "language_id"])
    op.create_index("ix_assessments_type_language", "assessments", ["assessment_type", "language_id"])
    op.create_index("ix_questions_assessment", "questions", ["assessment_id"])
    op.create_index("ix_question_options_question", "question_options", ["question_id"])
    op.create_index("ix_learner_progress_user_skill_updated", "learner_progress", ["user_id", "skill", "updated_at"])
    op.create_index("ix_lesson_completions_user_date", "lesson_completions", ["user_id", "completed_at"])


def downgrade() -> None:
    op.drop_index("ix_lesson_completions_user_date", table_name="lesson_completions")
    op.drop_index("ix_learner_progress_user_skill_updated", table_name="learner_progress")
    op.drop_index("ix_question_options_question", table_name="question_options")
    op.drop_index("ix_questions_assessment", table_name="questions")
    op.drop_index("ix_assessments_type_language", table_name="assessments")
    op.drop_index("ix_contents_lesson_language", table_name="contents")
    op.drop_index("ix_activities_lesson", table_name="activities")
    op.drop_index("ix_lessons_module_order", table_name="lessons")
    op.drop_index("ix_modules_language_level_order", table_name="modules")
