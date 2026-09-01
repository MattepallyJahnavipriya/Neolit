# NeoLit Login and Authentication Explanation

This document explains the complete login and authentication implementation in NeoLit. It covers the React frontend, the FastAPI backend, JWT tokens, password hashing, protected routes, learner registration, and profile loading.

## 1. Authentication Flow Overview

The application uses this flow:

1. A learner opens the login page.
2. The learner enters an email address and password.
3. React sends those values to `POST /api/auth/login`.
4. FastAPI finds the user by email.
5. FastAPI verifies the submitted password against the stored bcrypt password hash.
6. FastAPI creates a signed JWT access token.
7. The frontend stores the token in browser `localStorage` under `neolit_token`.
8. The frontend stores the returned user object in `AuthContext`.
9. The frontend navigates to `/dashboard`.
10. Every later Axios request automatically sends the token in the `Authorization` header.
11. Protected backend endpoints decode the token and load the current user from the database.

The important header is:

```http
Authorization: Bearer <jwt-access-token>
```

## 2. Relevant Files

### Frontend

- `frontend/src/pages/LoginPage.jsx`: Displays the login form and submits it.
- `frontend/src/pages/RegisterPage.jsx`: Displays learner registration.
- `frontend/src/context/AuthContext.jsx`: Stores the logged-in user and token state.
- `frontend/src/services/authApi.js`: Defines registration, login, logout, and current-user API calls.
- `frontend/src/services/api.js`: Creates Axios and adds the JWT to requests.
- `frontend/src/App.jsx`: Defines public and protected routes.

### Backend

- `Backend/app/main.py`: Creates the FastAPI app and registers the auth router.
- `Backend/app/routers/auth.py`: Implements registration, login, logout, and `/me`.
- `Backend/app/schemas/user.py`: Validates request and response data with Pydantic.
- `Backend/app/models/user.py`: Defines the database user table.
- `Backend/app/models/learning.py`: Defines the learner profile table.
- `Backend/app/dependencies.py`: Validates bearer tokens and loads the current user.
- `Backend/app/utils/security.py`: Hashes passwords and creates/decodes JWTs.

## 3. Frontend Login Page

The login page is implemented in `frontend/src/pages/LoginPage.jsx`.

### Imports and component state

```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()
```

Explanation:

- `useState` stores values that change while the page is open.
- `form` contains the two login fields: `email` and `password`.
- `error` contains an error message displayed to the learner.
- `loading` prevents repeated submissions while the request is running.
- `useAuth()` provides the `login` function from the global authentication context.
- `useNavigate()` changes the current browser route after successful login.

### Updating the form

```jsx
    const handleChange = (event) => {
        setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
    }
```

When an input changes:

1. `event.target.name` identifies the field, such as `email` or `password`.
2. `event.target.value` is the new value.
3. The previous form object is copied with `...prev`.
4. Only the changed field is replaced.

For example, changing the email produces:

```js
{
    email: 'learner@example.com',
    password: ''
}
```

### Submitting the login form

```jsx
    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setLoading(true)

        try {
            await login(form)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed')
        } finally {
            setLoading(false)
        }
    }
```

Explanation:

- `event.preventDefault()` stops the browser from reloading the page.
- `setError('')` removes an old error before a new attempt.
- `setLoading(true)` marks the request as active.
- `login(form)` calls the authentication context.
- If the API succeeds, the learner goes to `/dashboard`.
- If FastAPI returns an error, Axios places the response in `err.response`.
- `err.response?.data?.detail` reads FastAPI's error message safely.
- `finally` runs for both success and failure, so the loading state always ends.

### Login fields and button

```jsx
<form onSubmit={handleSubmit} className="space-y-5">
    <div>
        <label>Email</label>
        <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
        />
    </div>

    <div>
        <label>Password</label>
        <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
        />
    </div>

    {error && <p>{error}</p>}

    <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Log in'}
    </button>
</form>
```

The `name` values are important because `handleChange` uses them as keys in `form`. The browser's `required` attributes provide basic client-side validation. The backend still validates every request and must be treated as the source of truth.

## 4. Frontend Authentication API

The API wrapper is in `frontend/src/services/authApi.js`.

```jsx
import api from './api'

export const authApi = {
    register: async (payload) => {
        const response = await api.post('/api/auth/register', payload)
        return response.data
    },

    login: async (payload) => {
        const response = await api.post('/api/auth/login', payload)
        return response.data
    },

    logout: async (token) => {
        const response = await api.post('/api/auth/logout', {}, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        return response.data
    },

    getCurrentUser: async (token) => {
        const response = await api.get('/api/auth/me', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        return response.data
    }
}
```

Function details:

- `register(payload)` sends learner registration data.
- `login(payload)` sends the email and password.
- `logout(token)` calls the logout endpoint and explicitly includes the token if available.
- `getCurrentUser(token)` checks whether the saved token is still valid.
- `response.data` removes the Axios response wrapper and returns the API body.

The login request is:

```http
POST http://localhost:8000/api/auth/login
Content-Type: application/json
```

Example body:

```json
{
    "email": "learner@example.com",
    "password": "StrongPass123!"
}
```

Successful response:

```json
{
    "message": "Login successful",
    "access_token": "eyJ...",
    "token_type": "bearer",
    "user": {
        "id": 1,
        "first_name": "Alice",
        "last_name": "Learner",
        "email": "learner@example.com",
        "created_at": "2026-08-24T12:00:00",
        "updated_at": "2026-08-24T12:00:00"
    }
}
```

## 5. Axios Token Handling

The shared Axios client is in `frontend/src/services/api.js`.

```jsx
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('neolit_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api
```

Explanation:

- `VITE_API_BASE_URL` allows production to use a deployed backend.
- Local development defaults to `http://localhost:8000`.
- `axios.create()` creates one configured HTTP client.
- The request interceptor runs before every request made through `api`.
- It reads the token from `localStorage`.
- If a token exists, it adds `Authorization: Bearer <token>`.
- This means protected API calls do not need to manually add the header each time.

## 6. Authentication Context

The global auth state is implemented in `frontend/src/context/AuthContext.jsx`.

### State and provider setup

```jsx
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('neolit_token'))
    const [loading, setLoading] = useState(true)
```

- `user` is the currently authenticated account.
- `token` is initialized from browser storage so a page refresh can preserve login.
- `loading` prevents protected routes from redirecting before the initial token check finishes.
- `AuthProvider` makes these values available to all child components.

### Restoring a session after refresh

```jsx
    useEffect(() => {
        const bootstrapAuth = async () => {
            if (!token) {
                setLoading(false)
                return
            }

            try {
                const response = await authApi.getCurrentUser(token)
                setUser(response)
            } catch (error) {
                localStorage.removeItem('neolit_token')
                setToken(null)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        bootstrapAuth()
    }, [token])
```

This runs when the provider loads and whenever `token` changes:

1. If no token exists, the app is treated as logged out.
2. If a token exists, the frontend calls `/api/auth/me`.
3. If the backend accepts the token, the returned user is restored.
4. If the token is expired or invalid, it is removed from storage.
5. `loading` becomes false in every case.

### Logging in through the context

```jsx
    const login = async (payload) => {
        const data = await authApi.login(payload)
        localStorage.setItem('neolit_token', data.access_token)
        setToken(data.access_token)
        setUser(data.user)
        return data
    }
```

After the API returns:

- The JWT is saved in `localStorage`.
- React state receives the token.
- React state receives the user identity.
- Components using `useAuth()` update immediately.

### Registration and logout

```jsx
    const register = async (payload) => {
        return authApi.register(payload)
    }

    const logout = async () => {
        try {
            await authApi.logout(token)
        } finally {
            localStorage.removeItem('neolit_token')
            setToken(null)
            setUser(null)
        }
    }
```

Registration does not automatically log the learner in. The registration page sends the learner to the login page after account creation.

Logout always clears local authentication state in `finally`, even if the network request fails. The current backend logout endpoint is stateless; clearing the browser token is what logs the learner out of this client.

### Context value and hook

```jsx
    const value = useMemo(
        () => ({ user, token, loading, login, register, logout, setUser }),
        [user, token, loading]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }

    return context
}
```

`useAuth()` ensures components use the provider correctly. If a component calls it outside `AuthProvider`, it throws a clear development error.

## 7. Frontend Protected Routes

Protected routing is in `frontend/src/App.jsx`.

```jsx
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}
```

Behavior:

- While the saved token is being checked, the app shows a loading state.
- If there is no valid user, the learner is redirected to `/login`.
- If a valid user exists, the requested protected page is rendered.

Current route configuration:

```jsx
<Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route
        path="/dashboard"
        element={
            <ProtectedRoute>
                <DashboardPage />
            </ProtectedRoute>
        }
    />
    <Route
        path="/profile"
        element={
            <ProtectedRoute>
                <ProfilePage />
            </ProtectedRoute>
        }
    />
</Routes>
```

Frontend protection improves user experience, but it is not security by itself. The backend must still require a valid bearer token for protected data.

## 8. Backend Router Registration

The backend registers the auth router in `Backend/app/main.py`:

```python
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(learning.router, prefix="/api", tags=["learning"])
app.include_router(auth.router, prefix="/auth", tags=["legacy-auth"])
```

The normal current endpoints are:

| Method | URL | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Create an account and learner profile |
| `POST` | `/api/auth/login` | Verify credentials and issue a JWT |
| `POST` | `/api/auth/logout` | Return a logout message |
| `GET` | `/api/auth/me` | Return authenticated account information |
| `GET` | `/api/users/me` | Return authenticated learner profile |
| `PUT` | `/api/users/me` | Update authenticated learner profile |

The `/auth/...` routes are legacy aliases kept for compatibility with the existing backend test.

## 9. Backend Pydantic Schemas

The request and response schemas are in `Backend/app/schemas/user.py`.

### Registration schema

```python
class UserCreate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=80)
    last_name: str = Field(default="", max_length=80)
    name: str | None = Field(default=None, max_length=160)
    email: EmailStr
    password: str = Field(min_length=8)
    age: int | None = Field(default=None, ge=5, le=120)
    native_language: str = Field(default="", max_length=80)
    learning_language: str = Field(default="en", min_length=2, max_length=12)
    education_level: str = Field(default="", max_length=80)
    current_level_id: int | None = None
```

Field meanings:

- `first_name`: Required when the separate first/last name format is used.
- `last_name`: Optional learner surname.
- `name`: Compatibility field that allows a full name such as `Alice Learner`.
- `email`: Validated as an email address by `EmailStr`.
- `password`: Must contain at least eight characters.
- `age`: Optional, but if supplied must be from 5 through 120.
- `native_language`: The learner's first or strongest language.
- `learning_language`: The language the learner wants to study.
- `education_level`: Basic learner background information.
- `current_level_id`: The selected starting proficiency level.

### Login schema

```python
class UserLogin(BaseModel):
    email: EmailStr
    password: str
```

The backend validates the email format before trying to authenticate. The password is required but is never returned in an API response.

### Account response schema

```python
class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    created_at: datetime
    updated_at: datetime | None = None
```

`UserResponse` deliberately contains no password or password hash. `from_attributes=True` allows Pydantic to create the response from a SQLAlchemy `User` object.

## 10. Backend Database Models

The account table is in `Backend/app/models/user.py`:

```python
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(80), nullable=False)
    last_name = Column(String(80), default="", nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("LearnerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
```

Important details:

- `email` is unique, so two accounts cannot use the same email.
- Only `password_hash` is stored, never the plain password.
- A user has one learner profile through a one-to-one relationship.
- Deleting a user also deletes the associated profile because of the cascade setting.

The learner profile is in `Backend/app/models/learning.py`:

```python
class LearnerProfile(Base):
    __tablename__ = "learner_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    age = Column(Integer, nullable=True)
    native_language = Column(String(80), default="", nullable=False)
    learning_language = Column(String(20), default="en", nullable=False)
    education_level = Column(String(80), default="", nullable=False)
    current_level_id = Column(Integer, ForeignKey("levels.id"), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

The profile stores learner-specific information separately from login credentials. This keeps authentication data and learning preferences organized.

## 11. Backend Registration Endpoint

The registration endpoint is in `Backend/app/routers/auth.py`.

```python
@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

    first_name, last_name = payload.names()
    user = User(
        first_name=first_name,
        last_name=last_name,
        email=payload.email.lower(),
        password_hash=get_password_hash(payload.password),
    )
    profile = LearnerProfile(
        age=payload.age,
        native_language=payload.native_language.strip(),
        learning_language=payload.learning_language,
        education_level=payload.education_level.strip(),
        current_level_id=payload.current_level_id,
    )

    db.add(user)
    try:
        db.commit()
        db.refresh(user)
        profile.user_id = user.id
        db.add(profile)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Could not create user")

    return {
        "message": "User registered successfully",
        "user": UserResponse.model_validate(user),
    }
```

Step-by-step:

1. FastAPI validates the JSON body as `UserCreate`.
2. The database is searched using a lower-case email.
3. A duplicate email returns HTTP `400`.
4. `payload.names()` supports either separate names or the compatibility `name` field.
5. The password is hashed by `get_password_hash()`.
6. A `User` object is created with account information.
7. A `LearnerProfile` object is created with age, languages, education, and starting level.
8. The user is committed first so SQLAlchemy can generate `user.id`.
9. That generated ID is assigned to `profile.user_id`.
10. The profile is committed.
11. The response returns safe user information without the password.

Example registration request:

```http
POST http://localhost:8000/api/auth/register
Content-Type: application/json
```

```json
{
    "first_name": "Alice",
    "last_name": "Learner",
    "email": "alice@example.com",
    "password": "StrongPass123!",
    "age": 25,
    "native_language": "Hindi",
    "learning_language": "en",
    "education_level": "College",
    "current_level_id": 1
}
```

## 12. Backend Login Endpoint

```python
@router.post("/login", response_model=dict)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id)
    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user),
    }
```

Step-by-step:

1. FastAPI validates the body as `UserLogin`.
2. The email is normalized to lower case for lookup.
3. The database searches for the account.
4. `verify_password()` compares the plain submitted password with the stored bcrypt hash.
5. Missing users and wrong passwords use the same error message so the API does not reveal which emails are registered.
6. `create_access_token(user.id)` creates a signed token whose subject is the user ID.
7. The response includes the token and safe account information.

A successful login returns HTTP `200`. Invalid credentials return HTTP `401`.

## 13. Password Hashing and JWT Security

Security helpers are in `Backend/app/utils/security.py`.

### Password hashing

```python
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
```

- `bcrypt` transforms a password into a one-way hash.
- `get_password_hash()` is used during registration.
- `verify_password()` checks a login attempt.
- The original password cannot be recovered from the hash.

### Creating a token

```python
def create_access_token(subject: str | Any, expires_delta: timedelta | None = None) -> str:
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {"sub": str(subject), "exp": datetime.utcnow() + expires_delta}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
```

The JWT contains:

- `sub`: The user ID, stored as a string.
- `exp`: The expiration time.

The token is signed with the configured secret key and algorithm. The frontend can store the token, but it cannot safely modify the contents because the backend verifies the signature.

### Decoding a token

```python
def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
```

If the token is expired, malformed, or signed with the wrong secret, `jwt.decode()` raises a `JWTError` and the helper returns `None`.

## 14. Protected Backend Dependency

Protected endpoints use `get_current_user` from `Backend/app/dependencies.py`.

```python
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
```

How it works:

1. `HTTPBearer()` requires an `Authorization: Bearer ...` header.
2. FastAPI injects the parsed credentials into `credentials`.
3. The token string is passed to `decode_access_token()`.
4. An invalid token returns HTTP `401`.
5. The user ID from the token is converted to an integer.
6. The database loads that user.
7. If the user no longer exists, the request returns HTTP `401`.
8. A valid `User` object is returned to the endpoint.

This dependency is the backend security boundary. A frontend redirect alone cannot protect API data.

## 15. Current User Endpoints

### Account identity endpoint

```python
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
```

Because the router is mounted with `/api/auth`, this endpoint is:

```http
GET /api/auth/me
Authorization: Bearer <token>
```

It returns account information such as name and email. The frontend uses it during `bootstrapAuth()` after a refresh.

### Learner profile endpoint

The learner profile endpoint is in `Backend/app/routers/learning.py`:

```python
@router.get("/users/me", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    if profile is None:
        profile = LearnerProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "age": profile.age,
        "native_language": profile.native_language,
        "learning_language": profile.learning_language,
        "education_level": profile.education_level,
        "current_level_id": profile.current_level_id,
        "updated_at": profile.updated_at,
    }
```

Because the learning router is mounted with `/api`, the full endpoint is:

```http
GET /api/users/me
Authorization: Bearer <token>
```

This endpoint returns the editable learner information used by the profile page.

## 16. Registration Versus Login Data

Registration accepts more fields than login because it creates both account data and learner settings.

| Data | Registration | Login | Stored in |
|---|---:|---:|---|
| First name | Yes | No | `users.first_name` |
| Last name | Yes | No | `users.last_name` |
| Email | Yes | Yes | `users.email` |
| Password | Yes | Yes | `users.password_hash` after hashing |
| Age | Yes | No | `learner_profiles.age` |
| Native language | Yes | No | `learner_profiles.native_language` |
| Preferred language | Yes | No | `learner_profiles.learning_language` |
| Education level | Yes | No | `learner_profiles.education_level` |
| Current proficiency level | Yes | No | `learner_profiles.current_level_id` |

## 17. Logout Behavior

The backend endpoint is:

```python
@router.post("/logout")
def logout_user():
    return {"message": "Logged out successfully"}
```

JWTs are stateless, so this endpoint does not currently revoke a token in the database. The frontend performs the important client-side cleanup:

```jsx
finally {
    localStorage.removeItem('neolit_token')
    setToken(null)
    setUser(null)
}
```

After cleanup:

- The token is no longer available to the Axios interceptor.
- The auth context has no user.
- Protected routes redirect to login.
- Existing tokens remain valid on the server until they expire because there is no token blacklist.

## 18. Error Responses

Common authentication errors:

### Duplicate email

```json
{
    "detail": "Email already registered"
}
```

HTTP status: `400`

### Invalid login

```json
{
    "detail": "Invalid email or password"
}
```

HTTP status: `401`

### Invalid or expired token

```json
{
    "detail": "Invalid authentication credentials"
}
```

HTTP status: `401`

### Validation error

FastAPI returns HTTP `422` when request data does not satisfy the Pydantic schema, for example an invalid email, a password shorter than eight characters, or an age outside the accepted range.

## 19. Running and Testing

### Start the backend

From the project root with the repository virtual environment:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv-1\Scripts\Activate.ps1
cd Backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Start the frontend

In another terminal:

```powershell
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173/login
```

### Run the authentication test

```powershell
cd Backend
python -m pytest tests/test_auth.py
```

The test verifies:

1. Registration succeeds.
2. The returned response does not expose a password.
3. Login succeeds.
4. A JWT is returned.
5. `/auth/me` accepts the bearer token.
6. `/api/users/me` returns the persisted learner profile fields.

## 20. Complete User Journey

1. The learner opens `/register`.
2. React collects account and learner profile fields.
3. React calls `authApi.register()`.
4. FastAPI validates `UserCreate`.
5. FastAPI hashes the password and creates `User` plus `LearnerProfile`.
6. React navigates to `/login`.
7. The learner submits email and password.
8. FastAPI verifies the bcrypt hash.
9. FastAPI creates a JWT containing the user ID.
10. React stores the JWT in `localStorage`.
11. React stores the account in `AuthContext`.
12. React navigates to `/dashboard`.
13. Dashboard and profile requests receive the token from the Axios interceptor.
14. FastAPI's `get_current_user` validates the token for protected endpoints.
15. The learner's profile and learning progress are returned.
16. Logout clears the browser token and user state.
