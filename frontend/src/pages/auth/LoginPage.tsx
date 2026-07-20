import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginPage() {
  const navigate = useNavigate()
  const { login, googleLogin, githubLogin } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await googleLogin(credentialResponse.credential)
      navigate('/dashboard')
    } catch (error) {
      console.error('Google login failed:', error)
      toast.error('Google login failed')
    }
  }

  const handleGithubLogin = async () => {
    try {
      await githubLogin("demo-github-token-12345")
      navigate('/dashboard')
    } catch (error) {
      console.error('GitHub login failed:', error)
      toast.error('GitHub login failed')
    }
  }

  const onSubmit = async (data: LoginForm) => {
    console.log('Login form submitted with data:', data)
    try {
      console.log('Calling login function with:', data.email, data.password)
      await login(data.email, data.password)
      console.log('Login successful, navigating to dashboard')
      navigate('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('email')}
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
            />
            <Input
              {...register('password')}
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
            />
            <div className="flex justify-between items-center text-sm">
              <Link to="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Login
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 justify-center items-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login failed')}
              useOneTap
            />
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 w-full max-w-[250px]"
              onClick={handleGithubLogin}
            >
              <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Github
            </Button>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
