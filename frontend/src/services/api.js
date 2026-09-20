import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
    import.meta.env.PROD
        ? 'https://neolit-literacy-platform-1.onrender.com'
        : 'http://localhost:8000'
)

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('neolit_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if ([401, 403].includes(error.response?.status) && localStorage.getItem('neolit_token')) {
            localStorage.removeItem('neolit_token')
            window.location.assign('/login')
        }
        return Promise.reject(error)
    },
)

export default api
