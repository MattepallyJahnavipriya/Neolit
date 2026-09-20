"""add persisted game activity

Revision ID: 20260920_add_game_activity
Revises: 20260907_add_query_indexes
Create Date: 2026-09-20
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260920_add_game_activity"
down_revision: Union[str, None] = "20260907_add_query_indexes"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    existing_tables = set(sa.inspect(op.get_bind()).get_table_names())
    if "game_activity" in existing_tables:
        return

    op.create_table(
        "game_activity",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("game_id", sa.String(length=50), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("duration_seconds", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("played_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_game_activity_user_id", "game_activity", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_game_activity_user_id", table_name="game_activity")
    op.drop_table("game_activity")
