import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { learningApi } from '../services/learningApi'
import { LANGUAGES } from '../data/languages'

export default function ProfilePage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [levels, setLevels] = useState([])
    const [profile, setProfile] = useState(null)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const [profileData, levelData] = await Promise.all([
                    learningApi.getProfile(),
                    learningApi.getLevels(),
                ])
                setProfile(profileData)
                setLevels(levelData)
            } catch (requestError) {
                setError(requestError.response?.data?.detail || 'Unable to load your profile')
            }
        }
        loadProfile()
    }, [])

    const updateField = (field, value) => {
        setProfile((current) => ({ ...current, [field]: value }))
    }

    const saveProfile = async (event) => {
        event.preventDefault()
        setError('')
        try {
            setProfile(await learningApi.updateProfile(profile))
            setMessage('Profile updated successfully.')
        } catch (requestError) {
            setError(requestError.response?.data?.detail || 'Unable to update your profile')
        }
    }

    return <div className="min-h-screen bg-[#f5f7f5] px-4 py-6 text-slate-900 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-4xl">
            <header className="flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-3 text-slate-900"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-black text-white">N</span><span><span className="block text-sm font-bold">NeoLit</span><span className="block text-xs text-slate-500">Literacy lab</span></span></Link>
                <span className="text-sm text-slate-500">{user?.email}</span>
            </header>
            <main className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Learner profile</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Your learning settings</h1><p className="mt-2 text-sm text-slate-600">Keep your language and level up to date so your learning path stays relevant.</p></div><button type="button" onClick={() => navigate('/dashboard')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700">Back to dashboard</button></div>
                {message && <p className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}
                {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
                {profile && <form onSubmit={saveProfile} className="mt-8 grid gap-6 sm:grid-cols-2">{[['first_name', 'First name'], ['last_name', 'Last name'], ['native_language', 'Native language'], ['education_level', 'Education level']].map(([field, label]) => <label key={field} className="text-sm font-bold text-slate-700">{label}<input value={profile[field] || ''} onChange={(event) => updateField(field, event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal focus:border-emerald-500 focus:outline-none" /></label>)}<label className="text-sm font-bold text-slate-700">Age<input type="number" min="5" max="120" value={profile.age || ''} onChange={(event) => updateField('age', event.target.value ? Number(event.target.value) : null)} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal focus:border-emerald-500 focus:outline-none" /></label><label className="text-sm font-bold text-slate-700">Choose language<select value={profile.learning_language} onChange={(event) => updateField('learning_language', event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal">{LANGUAGES.map((language) => <option key={language.id} value={language.code}>{language.name}</option>)}</select></label><label className="text-sm font-bold text-slate-700">Current proficiency level<select value={profile.current_level_id || levels[0]?.id} onChange={(event) => updateField('current_level_id', Number(event.target.value))} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal">{levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}</select></label><div className="flex gap-3 sm:col-span-2"><button type="button" onClick={() => navigate('/dashboard')} className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700">Cancel</button><button className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700">Save profile</button></div></form>}
            </main>
        </div>
    </div>
}
