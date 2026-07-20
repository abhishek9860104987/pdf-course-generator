import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '../types'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  googleLogin: (token: string) => Promise<void>
  githubLogin: (token: string) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        const userData = await authService.getCurrentUser()
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      toast.error('Auth check failed')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    console.log('AuthContext login called with:', email, password)
    try {
      console.log('Calling authService.login')
      const response = await authService.login({ email, password })
      console.log('Login response received:', response)
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      setUser(response.user)
      console.log('User state updated, showing success toast')
      toast.success('Login successful!')
    } catch (error: any) {
      console.error('AuthContext login error:', error)
      toast.error(error.response?.data?.detail || 'Login failed')
      throw error
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authService.register({ email, password, name })
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      setUser(response.user)
      toast.success('Registration successful!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed')
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
      toast.success('Logged out successfully')
    }
  }

  const googleLogin = async (token: string) => {
    try {
      const response = await authService.googleLogin(token)
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      setUser(response.user)
      toast.success('Google login successful!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Google login failed')
      throw error
    }
  }

  const githubLogin = async (token: string) => {
    try {
      const response = await authService.githubLogin(token)
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      setUser(response.user)
      toast.success('GitHub login successful!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'GitHub login failed')
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Refresh user failed:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin, githubLogin, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
