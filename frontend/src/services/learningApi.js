import api from './api'

export const learningApi = {
    getLanguages: async () => (await api.get('/api/languages')).data,
    getLevels: async () => (await api.get('/api/levels')).data,
    getCurriculum: async (params) => (await api.get('/api/curriculum', { params })).data,
    getProfile: async () => (await api.get('/api/users/me')).data,
    updateProfile: async (profile) => (await api.put('/api/users/me', profile)).data,
    getAssessments: async (params) => (await api.get('/api/assessments', { params })).data,
    submitAssessment: async (assessmentId, answers) => (await api.post(`/api/assessments/${assessmentId}/submit`, { answers })).data,
    getProgress: async () => (await api.get('/api/progress/me')).data,
}
