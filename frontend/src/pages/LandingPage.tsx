import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpen, Brain, Zap, Shield } from 'lucide-react'
import Button from '../components/ui/Button'
import { useTheme } from '../context/ThemeContext'

function LandingPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">CourseAI</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-accent"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Transform PDFs into Interactive Courses
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload any PDF and let AI create a structured, interactive learning experience with quizzes, chatbot, and progress tracking.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: 'AI-Powered',
              description: 'Advanced LLM automatically structures your content into lessons, chapters, and quizzes.',
            },
            {
              icon: Zap,
              title: 'Instant Generation',
              description: 'Upload a PDF and get a complete course in minutes, not hours.',
            },
            {
              icon: Shield,
              title: 'Secure & Private',
              description: 'Your data is encrypted and never shared. Enterprise-grade security.',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="p-6 rounded-lg border bg-card">
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default LandingPage
