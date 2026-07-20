import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from 'lucide-react'
import { courseService } from '../services/courseService'
import { Course } from '../types'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Navigation from '../components/Navigation'
import toast from 'react-hot-toast'

function LessonViewPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const [timeSpent, setTimeSpent] = useState(0)
  const [completed, setCompleted] = useState(false)

  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ['course', courseId],
    queryFn: () => courseService.getCourse(courseId!),
    enabled: !!courseId,
  })

  const progressMutation = useMutation({
    mutationFn: courseService.updateProgress,
    onSuccess: () => {
      toast.success('Progress saved!')
    },
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    return () => {
      if (courseId && lessonId) {
        progressMutation.mutate({
          courseId,
          lessonId,
          completed,
          timeSpent,
        })
      }
    }
  }, [courseId, lessonId, completed, timeSpent])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!course) {
    return <div>Course not found</div>
  }

  const allLessons = course.chapters.flatMap((chapter) => chapter.lessons)
  const currentIndex = allLessons.findIndex((lesson) => lesson.id === lessonId)
  const currentLesson = allLessons[currentIndex]
  const prevLesson = allLessons[currentIndex - 1]
  const nextLesson = allLessons[currentIndex + 1]

  const handleComplete = () => {
    setCompleted(true)
    if (courseId && lessonId) {
      progressMutation.mutate({
        courseId,
        lessonId,
        completed: true,
        timeSpent,
      })
    }
  }

  if (!currentLesson) {
    return <div>Lesson not found</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={`/courses/${courseId}`} className="flex items-center text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Course
          </Link>
          <Button
            variant={completed ? 'secondary' : 'outline'}
            onClick={handleComplete}
          >
            {completed ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 mr-2" />
                Mark Complete
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{currentLesson.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Lesson {currentIndex + 1} of {allLessons.length}</span>
              <span>•</span>
              <span>{Math.floor(timeSpent / 60)}m {timeSpent % 60}s spent</span>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {children}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
              }}
            >
              {currentLesson.content}
            </ReactMarkdown>
          </div>

          {currentLesson.keyTakeaways && currentLesson.keyTakeaways.length > 0 && (
            <div className="mt-8 p-6 bg-accent rounded-lg">
              <h3 className="font-semibold mb-3">Key Takeaways</h3>
              <ul className="list-disc list-inside space-y-2">
                {currentLesson.keyTakeaways.map((takeaway, index) => (
                  <li key={index}>{takeaway}</li>
                ))}
              </ul>
            </div>
          )}

          {currentLesson.importantNotes && currentLesson.importantNotes.length > 0 && (
            <div className="mt-6 p-6 border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h3 className="font-semibold mb-3 text-yellow-700 dark:text-yellow-300">Important Notes</h3>
              <ul className="list-disc list-inside space-y-2">
                {currentLesson.importantNotes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {prevLesson ? (
              <Link to={`/courses/${courseId}/lessons/${prevLesson.id}`}>
                <Button variant="outline">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous Lesson
                </Button>
              </Link>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <Link to={`/courses/${courseId}/lessons/${nextLesson.id}`}>
                <Button>
                  Next Lesson
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Link to={`/courses/${courseId}/quiz`}>
                <Button>Take Quiz</Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default LessonViewPage
