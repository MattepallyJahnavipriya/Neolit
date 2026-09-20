import { useState } from 'react'
import { authApi } from '../services/authApi'

const initialForm = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'user',
}

export default function AdminCreateAccount({ onClose, onCreated }) {
    const [form, setForm] = useState(initialForm)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await authApi.createAdminUser({
                ...form,
                native_language: '',
                learning_language: 'en',
            })
            onCreated(response.user)
            onClose()
        } catch (requestError) {
            setError(requestError.response?.data?.detail || 'Could not create this account.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="admin-create-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <section className="admin-create-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-create-title">
                <div className="admin-create-header">
                    <div>
                        <p className="admin-kicker">Admin tools</p>
                        <h2 id="admin-create-title">Create account</h2>
                        <p>Add a User or Admin account directly from the dashboard.</p>
                    </div>
                    <button type="button" className="admin-create-close" onClick={onClose} aria-label="Close create account form">×</button>
                </div>

                <form className="admin-create-form" onSubmit={handleSubmit}>
                    <div className="admin-create-two-col">
                        <label>
                            <span>First name</span>
                            <input name="first_name" value={form.first_name} onChange={handleChange} required />
                        </label>
                        <label>
                            <span>Last name</span>
                            <input name="last_name" value={form.last_name} onChange={handleChange} />
                        </label>
                    </div>
                    <label>
                        <span>Email</span>
                        <input name="email" type="email" value={form.email} onChange={handleChange} required />
                    </label>
                    <label>
                        <span>Password</span>
                        <input name="password" type="password" minLength="8" value={form.password} onChange={handleChange} required />
                    </label>
                    <label>
                        <span>Account type</span>
                        <select name="role" value={form.role} onChange={handleChange}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </label>

                    {error && <p className="admin-create-error">{error}</p>}

                    <div className="admin-create-actions">
                        <button type="button" className="admin-create-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="admin-create-submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create account'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    )
}
