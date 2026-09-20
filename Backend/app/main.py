import logging
import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import ensure_schema
from app.routers import auth
from app.routers import learning

logger = logging.getLogger(__name__)

app = FastAPI(title="NeoLit API", version="1.0.0")


@app.on_event("startup")
def prepare_database():
    ensure_schema()

configured_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
required_frontend_origins = [
    "https://neolit-literacy-platform.vercel.app",
    "https://neolit-literacy-platform-niylk93x0.vercel.app",
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
]
cors_origins = list(dict.fromkeys(configured_origins + required_frontend_origins))


@app.exception_handler(Exception)
async def handle_unexpected_error(request, exc):
    logger.exception(
        "Unhandled error while processing %s %s",
        request.method,
        request.url.path,
    )
    response = JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
    origin = request.headers.get("origin")
    if origin in cors_origins or (
        origin and settings.CORS_ORIGIN_REGEX and re.fullmatch(settings.CORS_ORIGIN_REGEX, origin)
    ):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["auth"],
)

app.include_router(
    learning.router,
    prefix="/api",
    tags=["learning"],
)

app.include_router(
    auth.router,
    prefix="/auth",
    tags=["legacy-auth"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}
