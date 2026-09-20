import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { languages } from '../data/languages'
import { authApi } from '../services/authApi'

const levels = [
    { id: 1, name: 'Beginner' },
    { id: 2, name: 'Elementary' },
    { id: 3, name: 'Intermediate' },
    { id: 4, name: 'Upper Intermediate' },
    { id: 5, name: 'Advanced' },
]

export default function RegisterPage({ adminMode = false }) {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        setup_key: '',
        age: '',
        native_language: '',
        learning_language: 'en',
        gender: '',
        current_level_id: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()

    const handleChange = (event) => {
        setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')

        if (form.password.length < 8) {
            setError('Password must be at least 8 characters long.')
            return
        }

        setLoading(true)

        const payload = {
            ...form,
            age: form.age === '' ? null : Number(form.age),
            current_level_id: form.current_level_id === '' ? null : Number(form.current_level_id),
        }

        try {
            if (adminMode) {
                await authApi.bootstrapAdmin(payload, form.setup_key)
            } else {
                await register(payload)
            }
            navigate('/login')
        } catch (err) {
            const detail = err.response?.data?.detail
            const message = Array.isArray(detail)
                ? detail.map((item) => {
                    const text = typeof item === 'string' ? item : item?.msg || item?.error || JSON.stringify(item)
                    return text.toLowerCase().includes('at least 8') || text.toLowerCase().includes('8 characters')
                        ? 'Password must be at least 8 characters long.'
                        : text
                }).join(', ')
                : typeof detail === 'object' && detail
                    ? detail.msg || detail.error || JSON.stringify(detail)
                    : detail ||
                    (err.request
                        ? 'Unable to reach the server. Please try again or contact support.'
                        : 'Registration failed')
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    const passwordChecks = [
        form.password.length >= 8,
        /[A-Z]/.test(form.password),
        /[a-z]/.test(form.password),
        /\d/.test(form.password),
        /[^A-Za-z0-9]/.test(form.password),
    ].filter(Boolean).length
    const passwordStrength = !form.password
        ? { label: 'Enter a password', width: '0%', color: '#cbd5e1' }
        : passwordChecks >= 4
            ? { label: 'Strong', width: '100%', color: '#22c55e' }
            : passwordChecks >= 2
                ? { label: 'Medium', width: '65%', color: '#f59e0b' }
                : { label: 'Weak', width: '30%', color: '#ef4444' }

    return (
        <div className="neo-auth-page single-form-page">
            <div className="neo-auth-shell register-shell">
                <div className="neo-auth-card neo-register-card single-register-card">
                    <div className="neo-card-icon orange">📖</div>
                    <h2>{adminMode ? 'Create admin account' : 'Create your account'}</h2>
                    <p>{adminMode ? 'Set up the first NeoLit administrator.' : 'Join NeoLit and start your English journey.'}</p>

                    <form onSubmit={handleSubmit} className="neo-auth-form">
                        <div className="neo-two-col">
                            <label>
                                <span>First name</span>
                                <input
                                    name="first_name"
                                    value={form.first_name}
                                    onChange={handleChange}
                                    placeholder="Alex"
                                    required
                                />
                            </label>
                            <label>
                                <span>Last name</span>
                                <input
                                    name="last_name"
                                    value={form.last_name}
                                    onChange={handleChange}
                                    placeholder="Johnson"
                                />
                            </label>
                        </div>

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
                                    placeholder="Create a strong password"
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

                        <div className="neo-strength">
                            <div className="neo-strength-bar"><span style={{ width: passwordStrength.width, background: passwordStrength.color }} /></div>
                            <small>Password strength: {passwordStrength.label}</small>
                        </div>

                        {adminMode && (
                            <label>
                                <span>Admin setup key</span>
                                <input
                                    name="setup_key"
                                    type="password"
                                    value={form.setup_key}
                                    onChange={handleChange}
                                    placeholder="Enter the Render setup key"
                                    required
                                />
                            </label>
                        )}

                        <div className="neo-two-col">
                            <label>
                                <span>Age</span>
                                <input
                                    name="age"
                                    type="number"
                                    min="5"
                                    max="120"
                                    value={form.age}
                                    onChange={handleChange}
                                    placeholder="25"
                                />
                            </label>
                            <label>
                                <span>Gender</span>
                                <select name="gender" value={form.gender} onChange={handleChange}>
                                    <option value="">Prefer not to say</option>
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
                                    <option value="non-binary">Non-binary</option>
                                    <option value="other">Other</option>
                                </select>
                            </label>
                        </div>

                        {!adminMode && (
                            <>
                                <div className="neo-two-col">
                                    <label>
                                        <span>Native language</span>
                                        <select
                                            name="native_language"
                                            value={form.native_language}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select your mother tongue</option>
                                            {languages.map((language) => (
                                                <option key={language.code} value={language.name}>{language.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label>
                                        <span>Learning course language</span>
                                        <select
                                            name="learning_language"
                                            value={form.learning_language}
                                            onChange={handleChange}
                                            required
                                        >
                                            {languages.map((language) => (
                                                <option key={language.code} value={language.code}>
                                                    {language.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <div className="neo-two-col">
                                    <label>
                                        <span>Current proficiency level</span>
                                        <select
                                            name="current_level_id"
                                            value={form.current_level_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            {levels.map((level) => (
                                                <option key={level.id} value={level.id}>
                                                    {level.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <label className="neo-check-row">
                                    <input type="checkbox" required />
                                    <span>I agree to the Terms of Service and Privacy Policy</span>
                                </label>
                            </>
                        )}

                        {error && <p className="neo-error-msg">{error}</p>}

                        <button type="submit" className="neo-login-button" disabled={loading}>
                            {loading ? 'Creating account...' : adminMode ? 'Create Admin Account' : 'Create Account'}
                        </button>
                    </form>

                    <p className="neo-switch-text">
                        Already have an account? <Link to="/login">Log in</Link>
                    </p>
                    <p className="neo-switch-text neo-admin-access-link">
                        {adminMode
                            ? <>Already have an admin account? <Link to="/login/admin">Admin login</Link></>
                            : <>Admin account? <Link to="/register/admin">Create admin account</Link></>}
                    </p>
                </div>
            </div>
        </div>
    )
}
