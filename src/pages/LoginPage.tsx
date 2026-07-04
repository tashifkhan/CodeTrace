import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { signInWithGoogle } from '@/api/savedProfiles'

export function LoginPage() {
  const navigate = useNavigate()
  const { user, isConfigured } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleLogin = async () => {
    setError(null)
    setIsSigningIn(true)
    try {
      await signInWithGoogle(`${window.location.origin}/onboarding`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setIsSigningIn(false)
    }
  }

  if (user) {
    navigate({ to: '/onboarding' })
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border/70 bg-card/60">
        <CardHeader>
          <Button variant="ghost" size="sm" asChild className="mb-4 w-fit px-0 text-muted-foreground">
            <Link to="/app"><ArrowLeft data-icon="inline-start" />Back to app</Link>
          </Button>
          <CardTitle className="font-display text-3xl">Save your CodeTrace</CardTitle>
          <CardDescription>
            Sign in to claim a username and turn your stacked accounts into a clean public profile URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleLogin} disabled={!isConfigured || isSigningIn} className="w-full">
            <LogIn data-icon="inline-start" />
            {isSigningIn ? 'Opening Google...' : 'Continue with Google'}
          </Button>
          {!isConfigured && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
            </p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
