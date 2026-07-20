import api from './api'
import { AuthResponse, User } from '../types'

export const authService = {
  async register(data: { email: string; password: string; name: string }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    console.log('authService.login called with:', data)
    console.log('API base URL:', import.meta.env.VITE_API_URL)
    const response = await api.post<AuthResponse>('/auth/login', data)
    console.log('authService.login response:', response.data)
    return response.data
  },

  async googleLogin(token: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/google', { token })
    return response.data
  },

  async githubLogin(token: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/github', { token })
    return response.data
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password })
  },

  // Existing methods remain unchanged above

  // Update Profile (name & avatar)
  async updateProfile(data: { name?: string; avatar?: string }): Promise<User> {
    const response = await api.patch<User>('/auth/me', data)
    return response.data
  },

  // Change Password
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/change-password', data)
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  },
}
