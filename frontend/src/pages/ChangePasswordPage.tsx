import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../services/authService'
import Navigation from '../components/Navigation'

interface ChangePasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

function ChangePasswordPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormData>()

  const newPassword = watch('newPassword')

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsLoading(true)
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success('Password changed successfully! 🔐')
      navigate('/profile')
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  const PasswordInput = ({
    id,
    label,
    placeholder,
    show,
    onToggle,
    registration,
    error,
  }: {
    id: string
    label: string
    placeholder: string
    show: boolean
    onToggle: () => void
    registration: any
    error?: string
  }) => (
    <div>
      <label
        htmlFor={id}
        style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 500 }}
      >
        {label}
      </label>
      <div style={{ position: 'relative', marginTop: '0.5rem' }}>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          {...registration}
          style={{
            width: '100%',
            padding: '0.75rem 3rem 0.75rem 1rem',
            background: 'rgba(255,255,255,0.07)',
            border: error ? '1px solid #f87171' : '1px solid rgba(167,139,250,0.2)',
            borderRadius: '0.75rem',
            color: 'white',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border 0.2s',
          }}
          onFocus={(e) => (e.target.style.border = '1px solid #a78bfa')}
          onBlur={(e) =>
            (e.target.style.border = error ? '1px solid #f87171' : '1px solid rgba(167,139,250,0.2)')
          }
        />
        <button
          type="button"
          onClick={onToggle}
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)',
            padding: 0,
          }}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem' }}>{error}</p>
      )}
    </div>
  )

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}
    >
      <Navigation />

      <main className="container mx-auto px-4 py-10 max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back */}
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
            style={{ color: '#a78bfa' }}
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          {/* Card */}
          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(167,139,250,0.2)',
              borderRadius: '1.5rem',
              padding: '2.5rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                  borderRadius: '0.75rem',
                  padding: '0.65rem',
                }}
              >
                <Lock size={22} color="white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Change Password</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                  Keep your account secure
                </p>
              </div>
            </div>

            {/* Security tip */}
            <div
              style={{
                background: 'rgba(124,58,237,0.15)',
                border: '1px solid rgba(167,139,250,0.25)',
                borderRadius: '0.75rem',
                padding: '0.875rem 1rem',
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <ShieldCheck size={18} color="#a78bfa" />
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.825rem' }}>
                Use a strong password with at least 8 characters including numbers and symbols.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <PasswordInput
                id="currentPassword"
                label="Current Password"
                placeholder="Enter your current password"
                show={showCurrent}
                onToggle={() => setShowCurrent((v) => !v)}
                registration={register('currentPassword', {
                  required: 'Current password is required',
                })}
                error={errors.currentPassword?.message}
              />

              <PasswordInput
                id="newPassword"
                label="New Password"
                placeholder="Enter a new password"
                show={showNew}
                onToggle={() => setShowNew((v) => !v)}
                registration={register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                })}
                error={errors.newPassword?.message}
              />

              <PasswordInput
                id="confirmPassword"
                label="Confirm New Password"
                placeholder="Re-enter your new password"
                show={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
                registration={register('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: (value) => value === newPassword || 'Passwords do not match',
                })}
                error={errors.confirmPassword?.message}
              />

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  background: isLoading
                    ? 'rgba(167,139,250,0.3)'
                    : 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '1.5rem',
                  transition: 'opacity 0.2s',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Change Password
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default ChangePasswordPage
