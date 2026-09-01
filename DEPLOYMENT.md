# Public hosting setup

This project is ready for a simple public deployment using:

- Frontend: Vercel
- Backend: Render
- Database: SQLite database file

## 1. Backend on Render

1. Push the project to GitHub.
2. Create a new Render Web Service.
3. Connect the repository.
4. Set the root directory to `Backend`.
5. Use the `render.yaml` file in the project root as the service configuration, or configure manually with:
   - Build command: `python -m pip install --upgrade pip && pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add `DATABASE_URL=sqlite:///./neolit.db` from `Backend/.env.example`.

Example production variables:

```env
DATABASE_URL=sqlite:///./neolit.db
SECRET_KEY=replace-with-a-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

## 2. Frontend on Vercel

1. Import the repository into Vercel.
2. Set the project root to `frontend`.
3. Add the environment variable:

```env
VITE_API_BASE_URL=https://your-backend-domain.onrender.com
```

4. Deploy.

The file [frontend/vercel.json](frontend/vercel.json) helps Vercel serve the React app correctly.

## 3. Runtime notes

- SQLite is used for local development and creates all SQLAlchemy tables on first startup.
- The frontend is configured to use `VITE_API_BASE_URL`, so it can point to your hosted backend URL.
- The backend already allows CORS in [Backend/app/main.py](Backend/app/main.py), which is required for browser-based API access.

## 4. Admin user list

Register the administrator account normally, set `is_admin = 1` in `neolit.db`, then sign in and call:

```http
GET /api/auth/users
Authorization: Bearer <admin-access-token>
```

The response contains only user ID, name, email, and creation date.

Never expose passwords in logs, API responses, frontend code, or source control.

## 5. Test after deployment

- Frontend: open the public Vercel URL
- Backend: open the Render URL plus `/health`
- Example: `https://your-backend-domain.onrender.com/health`

It should return:

```json
{"status": "ok"}
```
