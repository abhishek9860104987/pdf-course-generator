import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Clock, BookOpen, PlayCircle } from 'lucide-react'
import { courseService } from '../services/courseService'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Navigation from '../components/Navigation'
import { formatTime, formatDate } from '../lib/utils'

function CourseViewPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseService.getCourse(courseId!),
    enabled: !!courseId,
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!course) {
    return <div>Course not found</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <p className="text-muted-foreground">{course.description}</p>
            </div>
            <Link to={`/courses/${courseId}/chat`}>
              <Button>Ask AI</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Objectives</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {course.objectives.map((objective, index) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Prerequisites</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {course.prerequisites.map((prereq, index) => (
                        <li key={index}>{prereq}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Course Content</h2>
              {course.chapters.map((chapter) => (
                <Card key={chapter.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Chapter {chapter.order}: {chapter.title}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {chapter.lessons.length} lessons
                      </span>
                    </CardTitle>
                    {chapter.description && (
                      <p className="text-muted-foreground">{chapter.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {chapter.lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          to={`/courses/${courseId}/lessons/${lesson.id}`}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <PlayCircle className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium">{lesson.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatTime(lesson.estimatedTime)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">{formatTime(course.estimatedTime)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Difficulty</p>
                    <p className="font-semibold capitalize">{course.difficulty}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-semibold">{formatDate(course.createdAt)}</p>
                </div>
              </CardContent>
            </Card>

            <Link to={`/courses/${courseId}/quiz`}>
              <Button className="w-full" size="lg">
                Take Quiz
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CourseViewPage
