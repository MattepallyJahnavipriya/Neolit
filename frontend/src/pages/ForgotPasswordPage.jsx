import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../services/authApi'

export default function ForgotPasswordPage() {
    const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setMessage('')
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match')
            return
        }
        setLoading(true)
        try {
            const response = await authApi.resetPassword({ email: form.email, password: form.password })
            setMessage(response.message)
            setForm({ email: '', password: '', confirmPassword: '' })
        } catch (requestError) {
            setError(requestError.response?.data?.detail || 'Unable to reset password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">Reset your password</h1>
                    <p className="mt-2 text-sm text-slate-600">Enter your email to request a password reset.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="you@example.com" required />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">New password</label>
                        <input name="password" type={showPassword ? 'text' : 'password'} minLength="8" value={form.password} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="At least 8 characters" required />
                        <button type="button" onClick={() => setShowPassword((current) => !current)} className="mt-2 text-sm font-semibold text-primary-600">{showPassword ? 'Hide password' : 'Show password'}</button>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Confirm new password</label>
                        <input name="confirmPassword" type={showPassword ? 'text' : 'password'} minLength="8" value={form.confirmPassword} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Repeat your new password" required />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}
                    <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary-600 px-4 py-3 font-medium text-white transition hover:bg-primary-700 disabled:opacity-60">{loading ? 'Updating password...' : 'Change password'}</button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600"><Link to="/login" className="font-semibold text-primary-600">Back to log in</Link></p>
            </div>
        </div>
    )
}