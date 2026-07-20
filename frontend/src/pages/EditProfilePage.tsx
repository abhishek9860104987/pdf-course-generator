import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Camera, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import Navigation from '../components/Navigation'

interface EditProfileFormData {
  name: string
  avatar: string
}

function EditProfilePage() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      avatar: user?.avatar || '',
    },
  })

  const avatarValue = watch('avatar')

  const onSubmit = async (data: EditProfileFormData) => {
    try {
      setIsLoading(true)
      await authService.updateProfile({
        name: data.name,
        avatar: data.avatar || undefined,
      })
      if (refreshUser) await refreshUser()
      toast.success('Profile updated successfully! 🎉')
      navigate('/profile')
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>
      <Navigation />

      <main className="container mx-auto px-4 py-10 max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back button */}
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
                <User size={22} color="white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                  Update your display name and avatar
                </p>
              </div>
            </div>

            {/* Avatar Preview */}
            <motion.div className="flex justify-center mb-8" whileHover={{ scale: 1.05 }}>
              <div className="relative">
                <div
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                    overflow: 'hidden',
                    border: '3px solid rgba(167,139,250,0.5)',
                  }}
                >
                  {avatarValue ? (
                    <img
                      src={avatarValue}
                      alt="Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    user?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                    borderRadius: '50%',
                    padding: '0.35rem',
                    border: '2px solid #0f0c29',
                  }}
                >
                  <Camera size={14} color="white" />
                </div>
              </div>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 500 }}
                >
                  Display Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  })}
                  style={{
                    width: '100%',
                    marginTop: '0.5rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.07)',
                    border: errors.name ? '1px solid #f87171' : '1px solid rgba(167,139,250,0.2)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.border = '1px solid #a78bfa')}
                  onBlur={(e) =>
                    (e.target.style.border = errors.name
                      ? '1px solid #f87171'
                      : '1px solid rgba(167,139,250,0.2)')
                  }
                />
                {errors.name && (
                  <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Avatar URL Field */}
              <div>
                <label
                  htmlFor="avatar"
                  style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 500 }}
                >
                  Avatar URL <span style={{ color: 'rgba(255,255,255,0.4)' }}>(optional)</span>
                </label>
                <input
                  id="avatar"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  {...register('avatar')}
                  style={{
                    width: '100%',
                    marginTop: '0.5rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(167,139,250,0.2)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.border = '1px solid #a78bfa')}
                  onBlur={(e) => (e.target.style.border = '1px solid rgba(167,139,250,0.2)')}
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading || !isDirty}
                whileHover={{ scale: isLoading || !isDirty ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  background:
                    isLoading || !isDirty
                      ? 'rgba(167,139,250,0.3)'
                      : 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: isLoading || !isDirty ? 'not-allowed' : 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'opacity 0.2s',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
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

export default EditProfilePage
