import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getMyPublicProfile, saveProfileUsername, signOut } from '@/api/savedProfiles'
import { normalizeProfileUsername, validateProfileUsername } from '@/lib/profileConfig'
import { useAuth } from '@/hooks/useAuth'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user, isLoading } = useAuth()
  const [username, setUsername] = useState('')
  const [existingUsername, setExistingUsername] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isLoading || !user) return
    getMyPublicProfile()
      .then((profile) => {
        if (profile) {
          setExistingUsername(profile.username)
          setUsername(profile.username)
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
  }, [isLoading, user])

  if (!isLoading && !user) {
    navigate({ to: '/login' })
    return null
  }

  const normalized = normalizeProfileUsername(username)
  const validation = validateProfileUsername(username)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (validation) {
      setError(validation)
      return
    }
    setIsSaving(true)
    try {
      await saveProfileUsername(username)
      navigate({ to: '/app' })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg border-border/70 bg-card/60">
        <CardHeader>
          <CardTitle className="font-display text-3xl">Claim your profile URL</CardTitle>
          <CardDescription>
            Choose the public username people will use to view your résumé-ready CodeTrace profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Username
              </label>
              <Input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="tashif"
                autoFocus
              />
              <p className="font-mono text-xs text-muted-foreground">
                {window.location.origin}/{normalized || 'username'}
              </p>
            </div>
            {validation && username && <p className="text-sm text-muted-foreground">{validation}</p>}
            {existingUsername && (
              <p className="text-sm text-muted-foreground">Current username: @{existingUsername}</p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={isSaving || Boolean(validation)} className="flex-1">
                {isSaving ? 'Saving...' : 'Save username'}
                <ArrowRight data-icon="inline-end" />
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/app">Skip for now</Link>
              </Button>
              <Button type="button" variant="ghost" onClick={() => void signOut()}>
                <LogOut data-icon="inline-start" />Sign out
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
