# Public Deployment

Use Render for the backend and Vercel for the frontend.

## 1. Deploy the Backend to Render

1. Push the project to GitHub.
2. Create a new Render Web Service and connect the repository.
3. Set the root directory to `Backend`.
4. Use `render.yaml`, or configure these commands manually:
   - Build command: `python -m pip install --upgrade pip && pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add the environment variables from `Backend/.env.production.example`.
6. Use a hosted MySQL or PostgreSQL database.

Example production variables:

```env
DATABASE_URL=mysql+pymysql://username:password@host:3306/database_name
SECRET_KEY=replace-with-a-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=https://neolit-literacy-platform.vercel.app,https://neolit-literacy-platform-niylk93x0.vercel.app
CORS_ORIGIN_REGEX=^https://neolit-literacy-platform(?:-[a-z0-9-]+)*\.vercel\.app$
ADMIN_SETUP_KEY=replace-with-a-long-random-one-time-key
```

## 2. Deploy the Frontend to Vercel

1. Import the repository into Vercel.
2. Set the project root to `frontend`.
3. Add this environment variable:

```env
VITE_API_BASE_URL=https://your-backend-domain.onrender.com
```

4. Deploy the frontend.

## 3. Verify the Deployment

1. Open the backend health URL:

   `https://your-backend-domain.onrender.com/health`

2. Confirm it returns:

```json
{"status": "ok"}
```

3. Open the public Vercel URL and test registration and login.

To create the first admin from the register-style page, open `/register/admin` and enter the same value configured as `ADMIN_SETUP_KEY` on Render. This setup route closes automatically after the first admin account is created. Additional admins can be created from the admin dashboard.

To replace the entire production database with fresh five-language data, open the Render shell and run these commands from the `Backend` directory. This deletes all users, profiles, progress, courses, and lessons:

```bash
export RESET_DATABASE=YES
python reset_database.py
alembic upgrade head
python -c "from app.database import SessionLocal; from app.seed import seed_learning_content; db = SessionLocal(); seed_learning_content(db); db.close()"
```

For local development, use SQLite. For production, use a hosted database.

If Render Shell is unavailable, add this temporary Render environment variable instead:

```text
RESET_DATABASE_ON_DEPLOY=YES
```

Deploy once, then remove `RESET_DATABASE_ON_DEPLOY` immediately and deploy again. This reset deletes all existing users, admins, progress, courses, and lessons. The normal seed then creates fresh data for English, Hindi, Kannada, Tamil, and Telugu.
