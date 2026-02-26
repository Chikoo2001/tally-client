import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('tallyUser') || 'null')
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.startsWith('/auth/')
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('tallyUser')
      window.location.href = '/login'
    } else if (!err.response) {
      toast.error('Network error — check your connection')
    }
    return Promise.reject(err)
  }
)

export default api
