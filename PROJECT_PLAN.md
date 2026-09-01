# NeoLit Intelligent Literacy Assistance Platform

## 1. Project Overview

NeoLit is a full-stack literacy learning platform for learners who want to improve reading, writing, vocabulary, grammar, and comprehension.

The Weeks 1-2 foundation provides:

- Learner registration and JWT login
- Learner profile management
- English, Hindi, and Telugu language support
- Structured curriculum: language -> level -> module -> lesson -> activity
- Multilingual lesson content and translations
- Reading, writing, and comprehension assessments
- Persisted assessment attempts and answers
- Backend proficiency benchmark calculation
- Dashboard progress reporting
- Architecture ready for AI recommendations in Weeks 3-4

## 2. Technology Stack

### Frontend

- React 18
- Vite
- JavaScript and JSX
- Tailwind CSS
- React Router
- Axios
- Context API

### Backend

- Python
- FastAPI
- Pydantic v2
- SQLAlchemy 2
- Alembic configuration
- JWT using python-jose
- Password hashing using Passlib and bcrypt

### Database

- SQLite is used for local development and is created automatically from `Backend/.env`.

## 3. Repository Structure

```text
Backend/
  .env
  .env.example
  alembic.ini
  alembic/
    env.py
  requirements.txt
  app/
    main.py
    config.py
    database.py
    dependencies.py
    seed.py
    models/
      user.py
      learning.py
    schemas/
      user.py
      learning.py
    routers/
      auth.py
      learning.py
    utils/
      security.py
  tests/
    test_auth.py

frontend/
  package.json
  vite.config.js
  tailwind.config.js
  src/
    App.jsx
    main.jsx
    index.css
    context/AuthContext.jsx
    pages/LoginPage.jsx
    pages/RegisterPage.jsx
    pages/DashboardPage.jsx
    services/api.js
    services/authApi.js
    services/learningApi.js
```

## 4. Running the Project

### Backend setup

From the `Backend` directory:

```powershell
..\.venv-1\Scripts\python.exe -m pip install -r requirements.txt
..\.venv-1\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend URL:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/health
```

### Frontend setup

From the `frontend` directory:

```powershell
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Production build:

```powershell
npm run build
```

## 5. Environment Configuration

Copy the example values and set real deployment values before production use.

```env
DATABASE_URL=mysql+pymysql://literacy_user:password@localhost/literacy_platform
SECRET_KEY=replace-with-a-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Never commit `.env`. The backend `.gitignore` excludes environment files and local databases.

## 6. Database Model

### User

Stores authentication and identity data:

- `id`
- `first_name`
- `last_name`
- `email`
- `password_hash`
- `created_at`
- `updated_at`

### LearnerProfile

Stores learner-specific learning preferences:

- `user_id`
- `age`
- `native_language`
- `learning_language`
- `education_level`
- `current_level_id`
- `updated_at`

### Language

Stores supported learning languages:

- `id`
- `name`
- `code`
- `is_active`

Seed languages:

- English (`en`)
- Hindi (`hi`)
- Telugu (`te`)

### Level

Stores proficiency benchmarks:

| Level | Minimum | Maximum |
| --- | ---: | ---: |
| Beginner | 0 | 39 |
| Elementary | 40 | 59 |
| Intermediate | 60 | 74 |
| Upper Intermediate | 75 | 89 |
| Advanced | 90 | 100 |

### Curriculum entities

- `Module`: belongs to a language and level
- `Lesson`: belongs to a module
- `Activity`: belongs to a lesson
- `Content`: lesson learning material in one language
- `ContentTranslation`: translated text for content in another language

### Assessment entities

- `Assessment`: reading, writing, or comprehension assessment
- `Question`: question text, type, marks, and correct answer
- `QuestionOption`: multiple-choice option and correctness flag
- `AssessmentAttempt`: one historical learner submission
- `AssessmentAnswer`: each answer submitted in an attempt

Previous attempts are never deleted. This supports future learner history and AI recommendations.

### LearnerProgress

Stores the latest calculated progress records:

- `user_id`
- `skill`
- `score`
- `proficiency_level`
- `assessment_id`
- `updated_at`

Supported skills:

- reading
- writing
- comprehension
- vocabulary
- grammar

## 7. API Reference

All current frontend APIs use the `/api` prefix.

### Health

#### `GET /health`

Returns server status.

Response:

```json
{"status": "ok"}
```

### Authentication

#### `POST /api/auth/register`

Creates a learner account and an empty learner profile.

Request:

```json
{
  "first_name": "Asha",
  "last_name": "Rao",
  "email": "asha@example.com",
  "password": "StrongPass123!"
}
```

The legacy `name` field is also accepted for older clients.

Response status: `201 Created`

#### `POST /api/auth/login`

Authenticates a learner and returns a JWT.

Request:

```json
{
  "email": "asha@example.com",
  "password": "StrongPass123!"
}
```

Response:

```json
{
  "message": "Login successful",
  "access_token": "JWT_TOKEN",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "first_name": "Asha",
    "last_name": "Rao",
    "email": "asha@example.com",
    "created_at": "2026-08-22T12:00:00"
  }
}
```

#### `GET /api/auth/me`

Returns the authenticated user. Requires:

```text
Authorization: Bearer JWT_TOKEN
```

#### `POST /api/auth/logout`

Returns a logout confirmation. JWT removal is handled by the frontend because JWTs are stateless.

### Languages and levels

#### `GET /api/languages`

Returns active languages.

#### `GET /api/levels`

Returns levels ordered by minimum score.

### Curriculum

#### `GET /api/curriculum`

Returns modules with lessons, activities, and lesson content.

Optional query parameters:

```text
/api/curriculum?language_id=1&level_id=1
```

#### `GET /api/curriculum/{language_id}/{level_id}`

Returns the curriculum for one language and level.

Example:

```text
GET /api/curriculum/1/1
```

#### `GET /api/modules/{module_id}`

Returns one module with its lesson hierarchy.

#### `GET /api/lessons/{lesson_id}`

Returns one lesson with its activities and content.

### Multilingual content

#### `GET /api/content`

Returns lesson content and translations.

Optional filters:

```text
/api/content?lesson_id=1
/api/content?language_id=2
/api/content?lesson_id=1&language_id=2
```

### Assessments

#### `GET /api/assessments`

Returns assessments with questions and public answer options. Correct answers are not returned.

Optional filters:

```text
/api/assessments?assessment_type=reading
/api/assessments?language_id=1
```

Assessment types:

- reading
- writing
- comprehension

#### `GET /api/assessments/{assessment_id}`

Returns one assessment with questions and options.

#### `POST /api/assessments/{assessment_id}/submit`

Submits answers for an authenticated learner. The backend:

1. Loads the assessment questions.
2. Compares submitted answers with correct answers.
3. Calculates marks and percentage.
4. Creates an `AssessmentAttempt`.
5. Creates one `AssessmentAnswer` per question.
6. Creates a `LearnerProgress` record.
7. Returns the benchmark level.

Request:

```json
{
  "answers": {
    "1": "School",
    "2": "Reading books"
  }
}
```

Response:

```json
{
  "attempt_id": 7,
  "score": 2,
  "total_marks": 2,
  "percentage": 100.0,
  "proficiency_level": "Advanced"
}
```

Writing responses are stored in `AssessmentAnswer.answer_text`. Complex AI evaluation is intentionally not included in Weeks 1-2.

### Learner profile

#### `GET /api/users/me`

Returns the authenticated user and learner profile fields.

#### `PUT /api/users/me`

Updates identity and learning profile information.

Request:

```json
{
  "first_name": "Asha",
  "last_name": "Rao",
  "age": 22,
  "native_language": "Telugu",
  "learning_language": "en",
  "education_level": "University",
  "current_level_id": 1
}
```

### Progress

#### `GET /api/progress/me`

Returns benchmark data for each main skill and the overall score.

Response:

```json
{
  "reading": {"score": 75, "level": "Upper Intermediate"},
  "writing": {"score": 60, "level": "Intermediate"},
  "comprehension": {"score": 80, "level": "Upper Intermediate"},
  "overall": {"score": 71.67, "level": "Intermediate"}
}
```

## 8. Frontend User Flow

```text
Register
  -> Login
  -> Dashboard
  -> Select language and level in profile
  -> Browse modules
  -> Expand lessons and activities
  -> Open an assessment
  -> Submit answers
  -> See score immediately
  -> Receive the next harder challenge
  -> Review updated progress
```

The frontend stores the JWT in local storage under `neolit_token`. Axios automatically attaches it to API requests.

## 9. Assessment Difficulty Flow

The seed data includes a beginner assessment and a harder challenge for each main skill:

- Reading: A Morning Routine -> City Garden
- Writing: My Family -> A Helpful Idea
- Comprehension: The Helpful Neighbor -> A New Library

After a successful submission, the dashboard finds the next assessment for the same skill with a higher level and opens it immediately. Historical submissions remain available in the database.

## 10. Security Notes

- Passwords are hashed and never returned in API responses.
- JWT authentication protects profile, submission, and progress endpoints.
- Passwords must be at least eight characters.
- Secrets come from environment configuration.
- CORS should be restricted to the deployed frontend origin before production.
- MySQL credentials must never be placed in React code.
- The bcrypt dependency is pinned to `4.0.1` for Passlib compatibility.

## 11. Testing Checklist

### Backend

```powershell
cd Backend
..\.venv-1\Scripts\python.exe -m pip install -r requirements.txt
..\.venv-1\Scripts\python.exe -m pytest -q
```

Test manually with PowerShell or an API client:

1. Register a new account.
2. Log in and copy the JWT.
3. Call `/api/auth/me` with the bearer token.
4. Call `/api/users/me`.
5. Call `/api/languages`, `/api/levels`, and `/api/curriculum`.
6. Get assessments.
7. Submit an assessment.
8. Confirm `/api/progress/me` changed.

### Frontend

```powershell
cd frontend
npm run build
```

Browser checklist:

1. Register.
2. Log in.
3. Confirm dashboard profile loads.
4. Change language or level and save.
5. Expand a curriculum module.
6. Complete a reading or comprehension assessment.
7. Complete a writing assessment.
8. Confirm the next harder assessment opens.
9. Confirm progress cards update.

## 12. Known Development Notes

- The local SQLite database must use the current normalized schema. Use the configured `neolit_v2.db` for local development.
- Run Alembic migrations for production database changes instead of relying only on `Base.metadata.create_all`.
- The current dashboard combines curriculum, assessment, and profile views for a compact Weeks 1-2 implementation. Separate lesson and assessment pages can be added without changing the API design.
- Assessment history API pagination and completed-lesson tracking are natural next improvements.

## 13. Weeks 3-4 AI Extension Plan

The current data model already provides the inputs needed by an AI personalization service:

- Learner profile and selected language
- Assessment attempt history
- Individual assessment answers
- Skill-level progress
- Assessment and curriculum relationships
- Lesson and activity structure

Recommended future additions:

1. Add `LearningPreference` for pace, goals, and preferred activity types.
2. Add `LessonCompletion` for completed lessons and timestamps.
3. Add `SkillGap` or calculate weak skills from `LearnerProgress`.
4. Add a recommendation service under `app/services/`.
5. Add a recommendation table with reason, lesson, score, and generated timestamp.
6. Keep AI evaluation asynchronous so assessment submission remains reliable.
7. Store model version and recommendation history for explainability.

The AI layer should consume backend records and should not move benchmark or security logic into React.
