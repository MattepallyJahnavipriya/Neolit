import api from './api'

export const authApi = {
    register: async (payload) => {
        const response = await api.post('/api/auth/register', payload)
        return response.data
    },

    login: async (payload) => {
        const response = await api.post('/api/auth/login', payload)
        return response.data
    },

    resetPassword: async (payload) => {
        const response = await api.post('/api/auth/forgot-password', payload)
        return response.data
    },

    logout: async (token) => {
        const response = await api.post('/api/auth/logout', {}, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        return response.data
    },

    getCurrentUser: async (token) => {
        const response = await api.get('/api/auth/me', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        return response.data
    }
}
