import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('neolit_token'))
    const [loading, setLoading] = useState(true)

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

    const login = async (payload) => {
        const data = await authApi.login(payload)
        localStorage.setItem('neolit_token', data.access_token)
        setToken(data.access_token)
        setUser(data.user)
        return data
    }

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
