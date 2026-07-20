export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface PDF {
  id: string
  userId: string
  filename: string
  originalName: string
  fileSize: number
  uploadDate: string
  status: 'processing' | 'completed' | 'failed'
}

export interface Course {
  id: string
  pdfId: string
  userId: string
  title: string
  description: string
  objectives: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  prerequisites: string[]
  createdAt: string
  updatedAt: string
  chapters: Chapter[]
}

export interface Chapter {
  id: string
  courseId: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  chapterId: string
  title: string
  content: string
  explanation: string
  example: string
  keyTakeaways: string[]
  importantNotes: string[]
  summary: string
  order: number
  estimatedTime: number
}

export interface Progress {
  id: string
  userId: string
  courseId: string
  lessonId?: string
  chapterId?: string
  completed: boolean
  completedAt?: string
  timeSpent: number
}

export interface Quiz {
  id: string
  courseId: string
  title: string
  questions: QuizQuestion[]
}

export interface QuizQuestion {
  id: string
  question: string
  type: 'mcq' | 'true_false' | 'short_answer'
  options?: string[]
  correctAnswer: string
  explanation: string
}

export interface QuizAttempt {
  id: string
  userId: string
  quizId: string
  score: number
  answers: Record<string, string>
  completedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatHistory {
  id: string
  userId: string
  courseId: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalCourses: number
  totalLessons: number
  completedLessons: number
  averageQuizScore: number
  learningTime: number
  learningStreak: number
  recentCourses: Course[]
  recentActivity: Activity[]
}

export interface Activity {
  id: string
  type: 'lesson_completed' | 'quiz_completed' | 'course_started'
  description: string
  timestamp: string
}
