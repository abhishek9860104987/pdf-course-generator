import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { BookOpen, Home, Upload, User, Settings, LogOut, Moon, Sun, Trophy } from 'lucide-react'
import Button from './ui/Button'

function Navigation() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
  }

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/upload', icon: Upload, label: 'Upload' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold">CourseAI</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActive ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-accent"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <span className="text-sm text-muted-foreground hidden md:inline">
              {user?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
