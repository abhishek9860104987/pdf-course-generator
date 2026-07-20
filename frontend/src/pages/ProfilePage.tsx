import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Navigation from '../components/Navigation'

function ProfilePage() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{user?.name}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(user?.createdAt || '').toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/profile/edit" className="w-full"><Button variant="outline" className="w-full">Edit Profile</Button></Link>
              <Link to="/profile/change-password" className="w-full"><Button variant="outline" className="w-full">Change Password</Button></Link>
              <Button variant="destructive" onClick={handleLogout} className="w-full">
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage
