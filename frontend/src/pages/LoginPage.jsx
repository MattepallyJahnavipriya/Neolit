
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (event) => {
        setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
    }

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

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">NeoLit</h1>
                    <p className="mt-2 text-sm text-slate-600">Welcome back to your learning journey</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                            placeholder="you@example.com"
                            required
                        />
                        <Link to="/forgot-password" className="mt-2 block text-right text-sm font-semibold text-primary-600">
                            Forgot password?
                        </Link>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                        <input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                            placeholder="••••••••"
                            required
                        />
                        <button type="button" onClick={() => setShowPassword((current) => !current)} className="mt-2 text-sm font-semibold text-primary-600">
                            {showPassword ? 'Hide password' : 'Show password'}
                        </button>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-primary-600 px-4 py-3 font-medium text-white transition hover:bg-primary-700 disabled:opacity-60"
                    >
                        {loading ? 'Signing in...' : 'Log in'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Don’t have an account?{' '}
                    <Link to="/register" className="font-semibold text-primary-600">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    )
}
