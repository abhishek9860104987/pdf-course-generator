import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const CourseUploadPage = lazy(() => import('./pages/CourseUploadPage'))
const CourseViewPage = lazy(() => import('./pages/CourseViewPage'))
const LessonViewPage = lazy(() => import('./pages/LessonViewPage'))
const QuizPage = lazy(() => import('./pages/QuizPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'))
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'))

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/upload" element={<CourseUploadPage />} />
          <Route path="/courses/:courseId" element={<CourseViewPage />} />
          <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonViewPage />} />
          <Route path="/courses/:courseId/quiz" element={<QuizPage />} />
          <Route path="/courses/:courseId/chat" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/profile/change-password" element={<ChangePasswordPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
