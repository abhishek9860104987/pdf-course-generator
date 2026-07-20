import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      await authService.forgotPassword(data.email)
      toast.success('Password reset email sent!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to send reset email')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a reset link</CardDescription>
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
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Send Reset Link
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPasswordPage
