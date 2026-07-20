import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BookOpen, Clock, Trophy, TrendingUp, Upload, User, Settings, Sparkles, Search, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { courseService } from '../services/courseService'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Navigation from '../components/Navigation'
import { formatTime } from '../lib/utils'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <Navigation />
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="h-8 w-64 bg-accent rounded-md mb-2" />
          <div className="h-4 w-48 bg-accent rounded-md" />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 w-24 bg-accent rounded" />
                <div className="h-4 w-4 bg-accent rounded-full" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-accent rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-accent rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-24 bg-accent rounded" />
                    <div className="h-3 w-32 bg-accent rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-5 w-32 bg-accent rounded" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="p-4 border border-border/50 rounded-lg flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-1/2 bg-accent rounded" />
                      <div className="h-3 w-1/3 bg-accent rounded" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

function DashboardPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: courseService.getDashboardStats,
  })

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const results = await courseService.globalSearch(query)
      setSearchResults(results)
    } catch (err) {
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              Dashboard Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {(error as any).response?.data?.detail || (error as any).message || 'An unexpected error occurred.'}
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statCards = [
    {
      icon: BookOpen,
      title: 'Total Courses',
      value: stats?.totalCourses || 0,
      color: 'text-blue-500',
    },
    {
      icon: Clock,
      title: 'Learning Time',
      value: formatTime(stats?.learningTime || 0),
      color: 'text-green-500',
    },
    {
      icon: Trophy,
      title: 'Avg Quiz Score',
      value: `${stats?.averageQuizScore || 0}%`,
      color: 'text-yellow-500',
    },
    {
      icon: TrendingUp,
      title: 'Learning Streak',
      value: `${stats?.learningStreak || 0} days`,
      color: 'text-purple-500',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Global Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses, chapters, lessons, keywords..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm"
            />
          </div>
          {searching && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl p-4 shadow-xl z-50 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}
          {!searching && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <Link
                  key={idx}
                  to={result.path}
                  className="block p-4 hover:bg-accent border-b border-border last:border-0 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-full capitalize">
                      {result.type}
                    </span>
                    <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                  </div>
                  <h4 className="font-semibold text-sm mt-1">{result.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.snippet}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Continue Learning Banner */}
        {stats?.recentCourses && stats.recentCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-primary/10 via-background to-background border-primary/20 overflow-hidden relative">
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Resume Learning
                  </span>
                  <h2 className="text-xl font-bold">
                    {stats.recentCourses[0].title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-1 max-w-xl">
                    {stats.recentCourses[0].description}
                  </p>
                </div>
                <Link to={`/courses/${stats.recentCourses[0].id}`}>
                  <Button size="lg" className="flex items-center gap-2 group">
                    <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                    Continue Learning
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Interactive Progress Graph (Recharts) */}
        {(stats?.totalCourses ?? 0) > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Weekly Study Progress</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { day: 'Mon', hours: 1.2 },
                      { day: 'Tue', hours: 2.0 },
                      { day: 'Wed', hours: 0.8 },
                      { day: 'Thu', hours: stats?.learningTime ? Math.min(stats.learningTime / 60, 4) : 1.5 },
                      { day: 'Fri', hours: 2.1 },
                      { day: 'Sat', hours: 3.0 },
                      { day: 'Sun', hours: 1.1 },
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="hours" stroke="hsl(var(--primary))" fillOpacity={0.2} fill="hsl(var(--primary))" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Quiz Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-5xl font-extrabold text-primary mb-2">
                  {stats?.averageQuizScore || 0}%
                </div>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  Your average quiz score across all completed modules.
                </p>
                <div className="w-full bg-secondary rounded-full h-2.5 mt-6 max-w-[200px]">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.averageQuizScore || 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link to="/upload">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Upload PDF</h3>
                    <p className="text-sm text-muted-foreground">Create a new course</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">My Profile</h3>
                    <p className="text-sm text-muted-foreground">Manage your account</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/settings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Settings</h3>
                    <p className="text-sm text-muted-foreground">App preferences</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {stats?.totalCourses === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <Card className="border-dashed border-2 border-border p-12 text-center flex flex-col items-center justify-center max-w-3xl mx-auto">
              <div className="p-4 bg-primary/10 rounded-full mb-6 text-primary">
                <Sparkles className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Create Your First Course</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl">
                Upload any PDF textbook, lecture slides, research paper, or guide. Our advanced AI will instantly generate chapters, lessons, key takeaways, and interactive quizzes tailored to your content.
              </p>
              <Link to="/upload">
                <Button size="lg" className="px-8 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload PDF & Get Started
                </Button>
              </Link>
            </Card>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.recentCourses && stats.recentCourses.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentCourses.map((course: any) => (
                        <Link
                          key={course.id}
                          to={`/courses/${course.id}`}
                          className="block p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        >
                          <h3 className="font-semibold">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">{course.description}</p>
                          <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-primary">{course.difficulty}</span>
                            <span>{formatTime(course.estimatedTime)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No courses yet. Upload a PDF to get started!</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentActivity.map((activity: any) => (
                        <div key={activity.id} className="p-4 border rounded-lg">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No recent activity</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}

export default DashboardPage
