import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error('Invalid reset token')
      return
    }
    try {
      await authService.resetPassword(token, data.password)
      toast.success('Password reset successful!')
      navigate('/login')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to reset password')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Invalid reset token</p>
            <Link to="/login" className="block text-center mt-4 text-primary hover:underline">
              Go to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('password')}
              label="New Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
            />
            <Input
              {...register('confirmPassword')}
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
            />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetPasswordPage
