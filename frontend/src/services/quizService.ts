import api from './api'
import { Quiz, QuizAttempt } from '../types'

export const quizService = {
  async getQuiz(courseId: string): Promise<Quiz> {
    const response = await api.get<Quiz>(`/courses/${courseId}/quiz`)
    return response.data
  },

  async submitQuiz(data: { courseId: string; answers: Record<string, string> }): Promise<{ score: number }> {
    const response = await api.post<{ score: number }>(`/courses/${data.courseId}/quiz/submit`, data)
    return response.data
  },

  async getAttempts(courseId: string): Promise<QuizAttempt[]> {
    const response = await api.get<QuizAttempt[]>(`/courses/${courseId}/quiz/attempts`)
    return response.data
  }
}
