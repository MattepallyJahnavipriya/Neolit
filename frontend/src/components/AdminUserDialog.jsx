import { useEffect, useState } from 'react'
import { learningApi } from '../services/learningApi'

export default function AdminUserDialog({ user, mode, onClose, onSaved }) {
    const [details, setDetails] = useState(null)
    const [form, setForm] = useState(null)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const loadDetails = async () => {
            try {
                const data = await learningApi.getAdminUser(user.id)
                setDetails(data)
                setForm({
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email,
                    role: data.role,
                })
            } catch (requestError) {
                setError(requestError.response?.data?.detail || 'Could not load user details.')
            }
        }

        loadDetails()
    }, [user.id])

    const handleChange = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    }

    const handleSave = async (event) => {
        event.preventDefault()
        setError('')
        setSaving(true)
        try {
            const updated = await learningApi.updateAdminUser(user.id, form)
            onSaved(updated)
            onClose()
        } catch (requestError) {
            setError(requestError.response?.data?.detail || 'Could not update this user.')
        } finally {
            setSaving(false)
        }
    }

    const displayUser = details || user

    return (
        <div className="admin-create-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <section className="admin-create-dialog admin-user-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-user-dialog-title">
                <div className="admin-create-header">
                    <div>
                        <p className="admin-kicker">User management</p>
                        <h2 id="admin-user-dialog-title">{mode === 'edit' ? 'Edit user' : mode === 'progress' ? 'Learning progress' : mode === 'history' ? 'Study history' : mode === 'games' ? 'Game history' : 'User details'}</h2>
                    </div>
                    <button type="button" className="admin-create-close" onClick={onClose} aria-label="Close">×</button>
                </div>

                {error && <p className="admin-create-error">{error}</p>}
                {mode === 'edit' ? (
                    <form className="admin-create-form" onSubmit={handleSave}>
                        <label><span>First name</span><input name="first_name" value={form?.first_name || ''} onChange={handleChange} required /></label>
                        <label><span>Last name</span><input name="last_name" value={form?.last_name || ''} onChange={handleChange} /></label>
                        <label><span>Email</span><input name="email" type="email" value={form?.email || ''} onChange={handleChange} required /></label>
                        <label><span>Role</span><select name="role" value={form?.role || 'user'} onChange={handleChange}><option value="user">User</option><option value="admin">Admin</option></select></label>
                        <div className="admin-create-actions">
                            <button type="button" className="admin-create-cancel" onClick={onClose}>Cancel</button>
                            <button type="submit" className="admin-create-submit" disabled={saving || !form}>{saving ? 'Saving...' : 'Save changes'}</button>
                        </div>
                    </form>
                ) : mode === 'progress' ? (
                    <div className="admin-user-detail-list">
                        {(displayUser.progress || []).map((item) => <p key={item.skill}><strong>{item.skill}</strong><span>{item.score}% · {item.level}</span></p>)}
                        {!displayUser.progress?.length && <p><span>No learning progress recorded.</span></p>}
                        <button type="button" className="admin-create-submit" onClick={onClose}>Close</button>
                    </div>
                ) : mode === 'history' ? (
                    <div className="admin-user-detail-list">
                        {(displayUser.study_history || []).map((item) => <p key={item.id}><strong>Assessment #{item.assessment_id}</strong><span>{item.percentage}% · {item.completed_at ? new Date(item.completed_at).toLocaleDateString() : 'Unknown date'}</span></p>)}
                        {!displayUser.study_history?.length && <p><span>No study history recorded.</span></p>}
                        <button type="button" className="admin-create-submit" onClick={onClose}>Close</button>
                    </div>
                ) : mode === 'games' ? (
                    <div className="admin-user-detail-list">
                        {(displayUser.game_history || []).map((item) => <p key={item.id}><strong>{item.game_id}</strong><span>{item.score} XP · {item.played_at ? new Date(item.played_at).toLocaleDateString() : 'Unknown date'}</span></p>)}
                        {!displayUser.game_history?.length && <p><span>No game history recorded.</span></p>}
                        <button type="button" className="admin-create-submit" onClick={onClose}>Close</button>
                    </div>
                ) : (
                    <div className="admin-user-detail-list">
                        <p><strong>Name</strong><span>{displayUser.name}</span></p>
                        <p><strong>Email</strong><span>{displayUser.email}</span></p>
                        <p><strong>Role</strong><span>{displayUser.role}</span></p>
                        <p><strong>XP</strong><span>{displayUser.xp || 0}</span></p>
                        <p><strong>Streak</strong><span>{displayUser.streak_days || 0} days</span></p>
                        <p><strong>Study time</strong><span>{Math.round((displayUser.study_time_seconds || 0) / 60)} min</span></p>
                        <p><strong>Last activity</strong><span>{displayUser.last_activity_date || 'No activity recorded'}</span></p>
                        <button type="button" className="admin-create-submit" onClick={onClose}>Close</button>
                    </div>
                )}
            </section>
        </div>
    )
}
