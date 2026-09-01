from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, SessionLocal, engine, ensure_schema_compatibility
from app.routers import auth
from app.routers import learning
from app.seed import seed_learning_content

app = FastAPI(title="NeoLit API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(learning.router, prefix="/api", tags=["learning"])
app.include_router(auth.router, prefix="/auth", tags=["legacy-auth"])

Base.metadata.create_all(bind=engine)
ensure_schema_compatibility()
with SessionLocal() as db:
    seed_learning_content(db)


@app.get("/health")
def health_check():
    return {"status": "ok"}
