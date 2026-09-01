import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { learningApi } from '../services/learningApi'
import { LANGUAGES } from '../data/languages'

export default function RegisterPage() {
    const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', age: '', gender: '', native_language: '', learning_language: LANGUAGES[0]?.code || 'en', current_level_id: '' })
    const [levels, setLevels] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        learningApi.getLevels()
            .then((levelData) => {
                setLevels(levelData)
                setForm((current) => ({ ...current, current_level_id: current.current_level_id || levelData[0]?.id || '' }))
                if (!levelData.length) {
                    setError('No learning levels are available right now')
                }
            })
            .catch(() => setError('Unable to load learning levels'))
    }, [])

    const handleChange = (event) => {
        setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setLoading(true)

        try {
            const payload = {
                ...form,
                age: form.age === '' ? null : Number(form.age),
                current_level_id: form.current_level_id === '' ? null : Number(form.current_level_id),
            }
            await register(payload)
            navigate('/login')
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">Join NeoLit</h1>
                    <p className="mt-2 text-sm text-slate-600">Build your language streak one lesson at a time</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">First name</label>
                        <input
                            name="first_name"
                            type="text"
                            value={form.first_name}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                            placeholder="Alex"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Last name</label>
                        <input name="last_name" value={form.last_name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Johnson" />
                    </div>

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
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                        <input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                            placeholder="Create a strong password"
                            required
                        />
                        <button type="button" onClick={() => setShowPassword((current) => !current)} className="mt-2 text-sm font-semibold text-primary-600">
                            {showPassword ? 'Hide password' : 'Show password'}
                        </button>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <label className="text-sm font-medium text-slate-700">Age<input name="age" type="number" min="5" max="120" value={form.age} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="25" /></label>
                        <label className="text-sm font-medium text-slate-700">Gender<select name="gender" value={form.gender} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"><option value="">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="non-binary">Non-binary</option><option value="other">Other</option></select></label>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <label className="text-sm font-medium text-slate-700">Native language<input name="native_language" value={form.native_language} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="English" /></label>
                        <label className="text-sm font-medium text-slate-700">Choose language<select name="learning_language" value={form.learning_language} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" required>{LANGUAGES.map((language) => <option key={language.id} value={language.code}>{language.name}</option>)}</select></label>
                    </div>

                    <label className="block text-sm font-medium text-slate-700">Current proficiency level<select name="current_level_id" value={form.current_level_id} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" required>{levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}</select></label>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-primary-600 px-4 py-3 font-medium text-white transition hover:bg-primary-700 disabled:opacity-60"
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-primary-600">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    )
}
