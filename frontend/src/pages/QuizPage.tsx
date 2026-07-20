import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { CheckCircle, XCircle } from 'lucide-react'
import { Quiz } from '../types'
import { quizService } from '../services/courseService'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Navigation from '../components/Navigation'
import toast from 'react-hot-toast'

function QuizPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const { data: quiz, isLoading } = useQuery<Quiz>({
    queryKey: ['quiz', courseId],
    queryFn: () => quizService.getQuiz(courseId!),
    enabled: !!courseId,
  })

  const submitMutation = useMutation({
    mutationFn: ({ courseId, answers }: { courseId: string; answers: Record<string, string> }) =>
      quizService.submitQuiz(courseId, answers),
    onSuccess: (result: { score: number }) => {
      setScore(result.score)
      setSubmitted(true)
      toast.success(`Quiz completed! Score: ${result.score}%`)
    },
  })

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = () => {
    if (courseId) {
      submitMutation.mutate({ courseId, answers })
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!quiz) {
    return <div>Quiz not found</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link to={`/courses/${courseId}`} className="text-muted-foreground hover:text-foreground">
            ← Back to Course
          </Link>
          <h1 className="text-2xl font-bold mt-2">{quiz.title}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {submitted ? (
            <Card>
              <CardHeader>
                <CardTitle>Quiz Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-primary mb-2">{score}%</div>
                  <p className="text-muted-foreground">
                    {score >= 70 ? 'Great job!' : score >= 50 ? 'Good effort!' : 'Keep practicing!'}
                  </p>
                </div>
                <div className="space-y-4">
                  {quiz.questions.map((question) => {
                    const isCorrect = answers[question.id] === question.correctAnswer
                    return (
                      <div key={question.id} className="p-4 border rounded-lg">
                        <div className="flex items-start space-x-3 mb-3">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                          )}
                          <p className="font-medium">{question.question}</p>
                        </div>
                        <p className="text-sm text-muted-foreground ml-8">
                          Your answer: {answers[question.id] || 'Not answered'}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600 ml-8">
                            Correct answer: {question.correctAnswer}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground ml-8 mt-2">
                          {question.explanation}
                        </p>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-6 flex justify-between">
                  <Link to={`/courses/${courseId}`}>
                    <Button variant="outline">Back to Course</Button>
                  </Link>
                  <Button onClick={() => {
                    setAnswers({})
                    setSubmitted(false)
                    setScore(0)
                  }}>
                    Retake Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {quiz.questions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle>Question {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg mb-4">{question.question}</p>
                    {question.type === 'mcq' && question.options ? (
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <label
                            key={option}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                              answers[question.id] === option
                                ? 'border-primary bg-primary/10'
                                : 'hover:bg-accent'
                            }`}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={(e) => handleAnswer(question.id, e.target.value)}
                              className="mr-3"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    ) : question.type === 'true_false' ? (
                      <div className="space-y-2">
                        {['True', 'False'].map((option) => (
                          <label
                            key={option}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                              answers[question.id] === option
                                ? 'border-primary bg-primary/10'
                                : 'hover:bg-accent'
                            }`}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={(e) => handleAnswer(question.id, e.target.value)}
                              className="mr-3"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter your answer"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        className="w-full p-3 border rounded-lg"
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < quiz.questions.length}
                loading={submitMutation.isPending}
                className="w-full"
              >
                Submit Quiz
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default QuizPage
