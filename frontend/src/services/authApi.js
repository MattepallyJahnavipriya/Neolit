import api from './api'

export const authApi = {
    register: async (payload) => {
        const response = await api.post('/api/auth/register', payload)
        return response.data
    },

    createAdminUser: async (payload) => {
        const response = await api.post('/api/auth/admin/users', payload)
        return response.data
    },

    login: async (payload) => {
        const response = await api.post('/api/auth/login', payload)
        return response.data
    },

    adminLogin: async (payload) => {
        const response = await api.post('/api/auth/login/admin', payload)
        return response.data
    },

    bootstrapAdmin: async (payload, setupKey) => {
        const response = await api.post('/api/auth/admin/register', payload, {
            headers: { 'X-Admin-Setup-Key': setupKey },
        })
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
