import { useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/authApi'
import { learningApi } from '../services/learningApi'
import { AuthContext } from './authContextValue'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('neolit_token'))
    const [loading, setLoading] = useState(true)

    const mergeProfileIntoUser = (profile, currentUser = user) => {
        if (!profile && !currentUser) return null

        const merged = { ...(currentUser || {}), ...(profile || {}) }

        if (profile?.learning_language && !localStorage.getItem('neolit_selected_language')) {
            merged.learning_language = profile.learning_language
            localStorage.setItem('neolit_selected_language', profile.learning_language)
        }

        if (profile?.learning_language) merged.learning_language = profile.learning_language
        if (profile?.native_language && !localStorage.getItem('neolit_native_language')) {
            localStorage.setItem('neolit_native_language', profile.native_language)
        }

        return merged
    }

    const refreshProfile = async (currentToken = token, currentUser = user) => {
        if (!currentToken) return null

        try {
            const profile = await learningApi.getProfile()
            const nextUser = mergeProfileIntoUser(profile, currentUser)
            setUser(nextUser)
            return profile
        } catch (error) {
            return null
        }
    }

    useEffect(() => {
        const bootstrapAuth = async () => {
            if (!token) {
                setLoading(false)
                return
            }

            try {
                const response = await authApi.getCurrentUser(token)
                const mergedUser = mergeProfileIntoUser(response, response)
                setUser(mergedUser)

                try {
                    const profile = await learningApi.getProfile()
                    setUser(mergeProfileIntoUser(profile, mergedUser))
                } catch {
                    // Keep the authenticated session when profile loading is temporarily unavailable.
                    setUser(mergedUser)
                }
            } catch (error) {
                localStorage.removeItem('neolit_token')
                setToken(null)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        bootstrapAuth()
    }, [])

    const login = async (payload) => {
        const data = payload.login_mode === 'admin'
            ? await authApi.adminLogin(payload)
            : await authApi.login(payload)
        localStorage.setItem('neolit_token', data.access_token)
        setToken(data.access_token)
        setUser(mergeProfileIntoUser(data.user, data.user))
        await refreshProfile(data.access_token, data.user)
        return data
    }

    const register = async (payload) => {
        return authApi.register(payload)
    }

    const logout = async () => {
        const logoutToken = token

        document.cookie = 'neolit_access_token=; Max-Age=0; path=/; SameSite=None; Secure'
        localStorage.removeItem('neolit_token')
        localStorage.removeItem('neolit_selected_language')
        localStorage.removeItem('neolit_native_language')
        setToken(null)
        setUser(null)

        try {
            await authApi.logout(logoutToken)
        } catch {
            // Local logout is complete even if the server is temporarily unavailable.
        }
    }

    const value = useMemo(
        () => ({ user, token, loading, login, register, logout, setUser, refreshProfile }),
        [user, token, loading]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
