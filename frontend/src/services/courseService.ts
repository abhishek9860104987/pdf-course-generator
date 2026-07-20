import api from './api'
import { Course, PDF, DashboardStats, Quiz, QuizAttempt, ChatHistory, ChatMessage, Progress } from '../types'

export const courseService = {
  async uploadPDF(file: File): Promise<PDF> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<PDF>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async generateCourse(pdfId: string): Promise<Course> {
    const response = await api.post<Course>('/course/generate', { pdf_id: pdfId })
    return response.data
  },

  async getCourses(): Promise<Course[]> {
    const response = await api.get<Course[]>('/courses')
    return response.data
  },

  async getCourse(courseId: string): Promise<Course> {
    const response = await api.get<Course>(`/course/${courseId}`)
    return response.data
  },

  async updateProgress(data: {
    courseId: string
    lessonId?: string
    chapterId?: string
    completed: boolean
    timeSpent: number
  }): Promise<Progress> {
    const response = await api.post<Progress>('/progress', data)
    return response.data
  },

  async getProgress(courseId: string): Promise<Progress[]> {
    const response = await api.get<Progress[]>(`/progress/${courseId}`)
    return response.data
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/dashboard')
    return response.data
  },

  async searchCourses(query: string): Promise<Course[]> {
    const response = await api.get<Course[]>(`/courses/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  async globalSearch(query: string): Promise<any[]> {
    const response = await api.get<any[]>(`/course/search/global?q=${encodeURIComponent(query)}`)
    return response.data
  },
}

export const quizService = {
  async getQuiz(courseId: string): Promise<Quiz> {
    const response = await api.get<Quiz>(`/quiz/${courseId}`)
    return response.data
  },

  async submitQuiz(courseId: string, answers: Record<string, string>): Promise<QuizAttempt> {
    const response = await api.post<QuizAttempt>(`/quiz/${courseId}/submit`, { answers })
    return response.data
  },

  async getQuizAttempts(courseId: string): Promise<QuizAttempt[]> {
    const response = await api.get<QuizAttempt[]>(`/quiz/${courseId}/attempts`)
    return response.data
  },
}

export const chatService = {
  async sendMessage(courseId: string, message: string): Promise<ChatMessage> {
    const response = await api.post<ChatMessage>('/chat', { course_id: courseId, message })
    return response.data
  },

  async streamMessage(
    courseId: string,
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const token = localStorage.getItem('accessToken')
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    const response = await fetch(`${baseUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ course_id: courseId, message }),
    })
    if (!response.ok) throw new Error('Stream request failed')
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      onChunk(decoder.decode(value, { stream: true }))
    }
  },

  async getChatHistory(courseId: string): Promise<ChatHistory> {
    const response = await api.get<ChatHistory>(`/chat/${courseId}`)
    return response.data
  },

  async getSuggestedQuestions(courseId: string): Promise<string[]> {
    const response = await api.get<{ questions: string[] }>(`/chat/${courseId}/suggestions`)
    return response.data.questions
  },

  async clearHistory(courseId: string): Promise<void> {
    await api.delete(`/chat/${courseId}`)
  },
}

export const leaderboardService = {
  async getLeaderboard(): Promise<any[]> {
    const response = await api.get<any[]>('/leaderboard')
    return response.data
  },
}

