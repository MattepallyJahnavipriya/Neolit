import api from './api'

export const learningApi = {
    getDashboardBootstrap: async () => (await api.get('/api/dashboard/bootstrap')).data,
    getLanguages: async () => (await api.get('/api/languages')).data,
    getLevels: async () => (await api.get('/api/levels')).data,
    getCurriculum: async () => (await api.get('/api/curriculum')).data,
    createAdminCourse: async (payload) => (await api.post('/api/admin/courses', payload)).data,
    updateAdminCourse: async (courseId, payload) => (await api.patch(`/api/admin/courses/${courseId}`, payload)).data,
    deleteAdminCourse: async (courseId) => (await api.delete(`/api/admin/courses/${courseId}`)).data,
    createAdminLesson: async (courseId, payload) => (await api.post(`/api/admin/courses/${courseId}/lessons`, payload)).data,
    updateAdminLesson: async (lessonId, payload) => (await api.patch(`/api/admin/lessons/${lessonId}`, payload)).data,
    deleteAdminLesson: async (lessonId) => (await api.delete(`/api/admin/lessons/${lessonId}`)).data,
    getProfile: async () => (await api.get('/api/users/me')).data,
    updateProfile: async (profile) => (await api.put('/api/users/me', profile)).data,
    updateLearningLanguage: async (learning_language) => (await api.patch('/api/users/me/language', { learning_language })).data,
    getAssessments: async (params) => (await api.get('/api/assessments', { params })).data,
    submitAssessment: async (assessmentId, answers) => {
        const payload = { answers: Object.fromEntries(Object.entries(answers || {}).map(([key, value]) => [String(key), value ?? ''])) }
        return (await api.post(`/api/assessments/${assessmentId}/submit`, payload)).data
    },
    getProgress: async () => (await api.get('/api/progress/me')).data,
    getLearningState: async () => (await api.get('/api/learning-state/me')).data,
    getLeaderboard: async () => (await api.get('/api/leaderboard')).data,
    getAdminUsers: async () => (await api.get('/api/admin/users')).data,
    getAdminUser: async (userId) => (await api.get(`/api/admin/users/${userId}`)).data,
    updateAdminUser: async (userId, payload) => (await api.patch(`/api/admin/users/${userId}`, payload)).data,
    updateAdminUserStatus: async (userId) => (await api.patch(`/api/admin/users/${userId}/status`)).data,
    resetAdminUserPassword: async (userId, password) => (await api.post(`/api/admin/users/${userId}/reset-password`, { password })).data,
    deleteAdminUser: async (userId) => (await api.delete(`/api/admin/users/${userId}`)).data,
    getAdminOverview: async () => (await api.get('/api/admin/overview')).data,
    recordGameActivity: async (payload) => (await api.post('/api/game-activity', payload)).data,
    getSpeech: async (text, language) => (await api.get('/api/speech', { params: { text, language }, responseType: 'blob' })).data,
    completeLesson: async (payload) => (await api.post('/api/lesson-progress', payload)).data,
}
