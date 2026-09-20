from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings


DATABASE_URL = settings.DATABASE_URL.split("?")[0]

engine_options = {
    "pool_pre_ping": True,
}

if DATABASE_URL.startswith(("mysql://", "mysql+pymysql://")):
    engine_options.update({
        "pool_size": 5,
        "max_overflow": 5,
        "pool_recycle": 1800,
        "pool_timeout": 10,
        "pool_use_lifo": True,
        "connect_args": {
            "connect_timeout": 10,
            "ssl": {},
        },
    })

engine = create_engine(DATABASE_URL, **engine_options)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def ensure_schema():
    inspector = inspect(engine)
    table_names = set(inspector.get_table_names())

    if "users" in table_names:
        user_columns = {column["name"] for column in inspector.get_columns("users")}
        if "role" not in user_columns:
            with engine.begin() as connection:
                connection.execute(
                    text("""
                        ALTER TABLE users
                        ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'
                    """)
                )
        if "is_active" not in user_columns:
            with engine.begin() as connection:
                connection.execute(
                    text("""
                        ALTER TABLE users
                        ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1
                    """)
                )

    if "learner_profiles" in table_names:
        columns = {
            column["name"]
            for column in inspector.get_columns("learner_profiles")
        }

        if "gender" not in columns:
            with engine.begin() as connection:
                connection.execute(
                    text("""
                        ALTER TABLE learner_profiles
                        ADD COLUMN gender VARCHAR(40) NOT NULL DEFAULT ''
                    """)
                )

    # Recover gracefully when a deployment starts before all Alembic
    # migrations have been applied.
    Base.metadata.create_all(bind=engine)
