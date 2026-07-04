import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppFooter } from '@/components/AppFooter'
import { getPublicProfileByUsername } from '@/api/savedProfiles'
import { isSupabaseConfigured } from '@/lib/supabase'
import { configToUsernames, hasConfigAccounts } from '@/lib/profileConfig'
import { useAuth } from '@/hooks/useAuth'
import { ProfilePage } from '@/pages/ProfilePage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function PublicProfilePage() {
  const { profileUsername } = useParams({ from: '/$profileUsername' })
  const { user } = useAuth()
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-profile', profileUsername],
    queryFn: () => getPublicProfileByUsername(profileUsername),
    enabled: isSupabaseConfigured,
  })

  if (!isSupabaseConfigured) {
    return <ProfileState title="Saved profiles are not configured" description="Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable public profile URLs." />
  }

  if (isLoading) return <ProfileState title={`Loading @${profileUsername}`} description="Fetching saved account configuration." />
  if (error) return <ProfileState title="Profile failed to load" description={(error as Error).message} />
  // No such handle — this route catches every unknown single-segment path,
  // so this *is* the app's 404 for stray URLs.
  if (!data) return <NotFoundPage />

  // Handle claimed, but no accounts saved yet: guide the owner to finish
  // setup instead of showing a dead 404 on their own URL.
  if (!hasConfigAccounts(data.config)) {
    const isOwner = user?.id === data.id
    return <EmptyProfileState username={data.username} isOwner={isOwner} />
  }

  return <ProfilePage usernames={configToUsernames(data.config)} owner={data} />
}

function EmptyProfileState({ username, isOwner }: { username: string; isOwner: boolean }) {
  return (
    <div className="flex min-h-screen flex-col px-4 py-10">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="term-window scanlines">
          <div className="term-bar">
            <span className="term-dot" style={{ background: 'var(--term-red)' }} />
            <span className="term-dot" style={{ background: 'var(--term-amber)' }} />
            <span className="term-dot" style={{ background: 'var(--term-green)' }} />
            <span className="ml-2 font-mono text-[11px] text-muted-foreground/80">~/{username} — empty</span>
          </div>
          <div className="crt-grid px-7 py-9">
            <p className="font-mono text-sm text-muted-foreground">
              <span className="text-[var(--term-green)]">$</span> mount @{username}
            </p>
            <p className="mt-1.5 font-mono text-sm text-[var(--term-amber)]">
              warn: 0 accounts mounted
            </p>
            {isOwner ? (
              <>
                <p className="mt-5 font-mono text-xs leading-relaxed text-muted-foreground">
                  Your userid is claimed — now attach your platform ids to it.
                  Save them on the account page and this URL goes live.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button asChild className="rounded-md font-mono text-xs">
                    <Link to="/account">configure platform ids</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-md font-mono text-xs">
                    <Link to="/app">cd ~/dashboard</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-5 font-mono text-xs leading-relaxed text-muted-foreground">
                  @{username} has claimed this URL but hasn't published any
                  platform accounts yet. Check back soon.
                </p>
                <Button asChild variant="outline" className="mt-6 rounded-md font-mono text-xs">
                  <Link to="/app">build your own trace</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

function ProfileState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border/70 bg-card/60">
        <CardHeader>
          <CardTitle className="font-display text-3xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild><a href="/app">Open CodeTrace</a></Button>
        </CardContent>
      </Card>
    </div>
  )
}
