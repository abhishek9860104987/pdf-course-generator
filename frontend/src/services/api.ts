import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function snakeToCamel(str: string): string {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  )
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

export function keysToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamel(v))
  } else if (obj !== null && obj !== undefined && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [snakeToCamel(key)]: keysToCamel(obj[key]),
      }),
      {}
    )
  }
  return obj
}

export function keysToSnake(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToSnake(v))
  } else if (obj !== null && obj !== undefined && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [camelToSnake(key)]: keysToSnake(obj[key]),
      }),
      {}
    )
  }
  return obj
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.data && !(config.data instanceof FormData)) {
    config.data = keysToSnake(config.data)
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = keysToCamel(response.data)
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/google') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        })

        const { accessToken } = response.data
        localStorage.setItem('accessToken', accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default api
