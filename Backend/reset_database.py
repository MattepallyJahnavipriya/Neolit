import os

from sqlalchemy import text

from app.database import Base, engine
import app.models  # noqa: F401 - register every model with Base.metadata


if os.getenv("RESET_DATABASE") != "YES":
    raise SystemExit("Refusing to reset database. Set RESET_DATABASE=YES to continue.")

print("Dropping all application tables...")
Base.metadata.drop_all(bind=engine)

with engine.begin() as connection:
    connection.execute(text("DROP TABLE IF EXISTS alembic_version"))

print("Database cleared. Run 'alembic upgrade head' and the seed command next.")
