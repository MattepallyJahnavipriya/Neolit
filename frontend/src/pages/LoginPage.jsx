import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function LoginPage() {
    const location = useLocation()
    const [form, setForm] = useState({ email: '', password: '' })
    const [loginMode, setLoginMode] = useState(location.pathname === '/login/admin' ? 'admin' : 'user')
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { login, logout } = useAuth()
    const navigate = useNavigate()

    const handleChange = (event) => {
        setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
    }

    const selectLoginMode = (mode) => {
        setLoginMode(mode)
        navigate(mode === 'admin' ? '/login/admin' : '/login')
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setLoading(true)

        try {
            const data = await login({ ...form, login_mode: loginMode })
            const nextRole = data?.user?.role || 'user'

            if (nextRole !== loginMode) {
                await logout()
                throw new Error(`This account is not an ${loginMode} account.`)
            }

            navigate(nextRole === 'admin' ? '/admin' : '/learning-path')
        } catch (err) {
            setError(
                err.response?.data?.detail
                || (err.response
                    ? 'Login failed. Please check your email and password.'
                    : 'Unable to reach the login server. Please try again or contact support.')
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="neo-auth-page login-page-only">
            <div className="neo-auth-shell login-shell">
                <div className="neo-auth-card neo-login-card">
                    <div className="neo-card-icon orange">📖</div>
                    <h2>Welcome back!</h2>
                    <p className="neo-subtitle">Log in to continue your learning journey.</p>

                    <div className="neo-login-mode" role="group" aria-label="Choose login type">
                        <span className={`neo-login-mode-indicator ${loginMode === 'admin' ? 'admin' : ''}`} aria-hidden="true" />
                        <button
                            type="button"
                            className={loginMode === 'user' ? 'active' : ''}
                            onClick={() => selectLoginMode('user')}
                        >
                            User login
                        </button>
                        <button
                            type="button"
                            className={loginMode === 'admin' ? 'active' : ''}
                            onClick={() => selectLoginMode('admin')}
                        >
                            Admin login
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="neo-auth-form">
                        <label>
                            <span>Email</span>
                            <div className="neo-input-wrap">
                                <span className="neo-input-icon">✉</span>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </label>

                        <label>
                            <span>Password</span>
                            <div className="neo-input-wrap">
                                <span className="neo-input-icon">🔒</span>
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="neo-eye-btn"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    onClick={() => setShowPassword((visible) => !visible)}
                                >
                                    {showPassword ? '◉' : '◌'}
                                </button>
                            </div>
                        </label>

                        <div className="neo-row-between">
                            <label className="neo-remember">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password">Forgot password?</Link>
                        </div>

                        {error && <p className="neo-error-msg">{error}</p>}

                        <button type="submit" className="neo-login-button-primary" disabled={loading}>
                            {loading ? 'Logging in...' : 'Log In'} <span className="neo-arrow">→</span>
                        </button>
                    </form>

                    <p className="neo-switch-text">
                        Don't have an account? <Link to="/register">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
