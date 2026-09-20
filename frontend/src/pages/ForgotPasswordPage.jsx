import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../services/authApi'

export default function ForgotPasswordPage() {
    const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (event) => {
        setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setSuccess('')

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)
        try {
            await authApi.resetPassword({ email: form.email, password: form.password })
            setSuccess('Your password has been changed. You can now log in with your new password.')
            setTimeout(() => navigate('/login'), 1800)
        } catch (err) {
            setError(err.response?.data?.detail || 'Could not reset password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page flex min-h-screen items-center justify-center bg-slate-100 px-4">
            <div className="auth-card w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">Reset password</h1>
                    <p className="mt-2 text-sm text-slate-600">Enter the email on your NeoLit account.</p>
                </div>

                {success ? (
                    <div className="space-y-5 text-center">
                        <p className="text-sm text-emerald-600">{success}</p>
                        <Link to="/login" className="block font-semibold text-primary-600">
                            Return to login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="reset-email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                            <input
                                id="reset-email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="reset-password" className="mb-2 block text-sm font-medium text-slate-700">New password</label>
                            <input
                                id="reset-password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                                required
                                minLength="8"
                            />
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">Confirm password</label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((visible) => !visible)}
                                    className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <input
                                id="confirm-password"
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                                required
                                minLength="8"
                            />
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-primary-600 px-4 py-3 font-medium text-white transition hover:bg-primary-700 disabled:opacity-60"
                        >
                            {loading ? 'Changing password...' : 'Change password'}
                        </button>

                        <p className="text-center text-sm text-slate-600">
                            <Link to="/login" className="font-semibold text-primary-600">Back to login</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}
