"""add durable learner state and lesson completions

Revision ID: 20260907_add_learning_state
Revises: 5d8841ac0fc2
Create Date: 2026-09-07
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260907_add_learning_state"
down_revision: Union[str, None] = "5d8841ac0fc2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    existing_tables = set(sa.inspect(op.get_bind()).get_table_names())
    if {"learner_stats", "lesson_completions"}.issubset(existing_tables):
        return

    op.create_table(
        "learner_stats",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("xp", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("gems", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("hearts", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("streak_days", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_activity_date", sa.Date(), nullable=True),
        sa.Column("daily_date", sa.Date(), nullable=True),
        sa.Column("daily_xp", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("daily_lessons", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index("ix_learner_stats_user_id", "learner_stats", ["user_id"], unique=False)
    op.create_table(
        "lesson_completions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("language_code", sa.String(length=12), nullable=False),
        sa.Column("unit_number", sa.Integer(), nullable=False),
        sa.Column("lesson_step", sa.Integer(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("xp_earned", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("completed_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "language_code", "unit_number", "lesson_step", name="uq_lesson_completion"),
    )
    op.create_index("ix_lesson_completions_user_id", "lesson_completions", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_lesson_completions_user_id", table_name="lesson_completions")
    op.drop_table("lesson_completions")
    op.drop_index("ix_learner_stats_user_id", table_name="learner_stats")
    op.drop_table("learner_stats")
