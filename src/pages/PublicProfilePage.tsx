import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { SeoHead } from '@/components/SeoHead'
import { Button } from '@/components/ui/button'
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
    return <ProfileState
      title="Saved profiles are not configured"
      description="Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable public profile URLs."
      variant="info"
    />
  }

  if (isLoading) return (
    <>
      <SeoHead title={`@${profileUsername} — CodeTrace`} url={`https://codetrace.xyz/${profileUsername}`} />
      <ProfileState
        title={`Loading @${profileUsername}`}
        description="Fetching saved account configuration."
        variant="loading"
      />
    </>
  )
  if (error) return (
    <>
      <SeoHead title={`@${profileUsername} — CodeTrace`} url={`https://codetrace.xyz/${profileUsername}`} />
      <ProfileState
        title="Profile failed to load"
        description={(error as Error).message}
        variant="error"
      />
    </>
  )
  if (!data) return <NotFoundPage />

  // Handle claimed, but no accounts saved yet: guide the owner to finish
  // setup instead of showing a dead 404 on their own URL.
  if (!hasConfigAccounts(data.config)) {
    const isOwner = user?.id === data.id
    return <EmptyProfileState username={data.username} isOwner={isOwner} />
  }

  return (
    <>
      <SeoHead title={`${data.username} — CodeTrace`} description={`Unified developer profile for ${data.username} — coding stats across all platforms.`} url={`https://codetrace.xyz/${data.username}`} type="profile" />
      <ProfilePage usernames={configToUsernames(data.config)} owner={data} />
    </>
  )
}

function EmptyProfileState({ username, isOwner }: { username: string; isOwner: boolean }) {
  return (
    <>
      <SeoHead title={`${username} — CodeTrace`} url={`https://codetrace.xyz/${username}`} />
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
    </>
  )
}

function ProfileState({
  title,
  description,
  variant = 'info',
}: {
  title: string
  description: string
  variant?: 'info' | 'loading' | 'error'
}) {
  const isLoading = variant === 'loading'
  const isError = variant === 'error'
  const statusColor = isError ? 'text-[var(--term-red)]' : 'text-[var(--term-amber)]'
  const statusPrefix = isError ? 'error:' : 'status:'
  const command = isLoading ? 'fetch_profile' : isError ? 'cat profile.log' : 'status'
  const windowLabel = isLoading ? '~/profile — loading' : isError ? '~/profile — error' : '~/profile'

  return (
    <div className="flex min-h-screen flex-col px-4 py-10">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="term-window scanlines rise-in">
          <div className="term-bar">
            <span className="term-dot" style={{ background: 'var(--term-red)' }} />
            <span className="term-dot" style={{ background: 'var(--term-amber)' }} />
            <span className="term-dot" style={{ background: 'var(--term-green)' }} />
            <span className="ml-2 truncate font-mono text-[11px] text-muted-foreground/80">{windowLabel}</span>
          </div>

          <div className="crt-grid px-7 py-9">
            <h1 className={`glow-text font-pixel text-2xl leading-tight ${isError ? 'text-[var(--term-red)]' : 'text-foreground'}`}>
              {title}
            </h1>

            <p className="mt-4 font-mono text-sm text-muted-foreground">
              <span className="text-[var(--term-green)]">$</span> {command}
              {isLoading && <span className="caret" />}
            </p>
            <p className={`break-words font-mono text-sm ${statusColor}`}>
              {statusPrefix} {description}
            </p>

            {isLoading && (
              <div className="mt-5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                  <div
                    className="h-full w-2/5 animate-[shimmer_1.5s_infinite] rounded-full bg-[var(--term-green)]"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                    }}
                  />
                </div>
                <p className="mt-2 font-mono text-[11px] text-muted-foreground/60">
                  waiting for supabase response...
                </p>
              </div>
            )}

            {isError && (
              <p className="mt-5 font-mono text-xs leading-relaxed text-muted-foreground">
                The profile server returned an error. You can return to the dashboard or try refreshing this page.
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild variant="outline" className="rounded-md font-mono text-xs">
                <Link to="/app">cd ~/dashboard</Link>
              </Button>
              {isError && (
                <Button className="rounded-md font-mono text-xs" onClick={() => window.location.reload()}>
                  retry
                </Button>
              )}
            </div>
          </div>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}
