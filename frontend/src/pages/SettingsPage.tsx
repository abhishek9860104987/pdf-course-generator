import { useTheme } from '../context/ThemeContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Navigation from '../components/Navigation'

function SettingsPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
                <Button variant="outline" onClick={toggleTheme}>
                  {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your courses
                  </p>
                </div>
                <input type="checkbox" className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Push Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in browser
                  </p>
                </div>
                <input type="checkbox" className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Export My Data
              </Button>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default SettingsPage
