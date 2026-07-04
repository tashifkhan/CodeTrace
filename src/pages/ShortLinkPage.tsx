import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AppFooter } from '@/components/AppFooter'
import { resolveShortLink } from '@/api/shortLinks'
import { isSupabaseConfigured } from '@/lib/supabase'
import { configToUsernames } from '@/lib/profileConfig'
import { ProfilePage } from '@/pages/ProfilePage'

/** Public short-URL resolver: /s/<code> → the unified profile it encodes. */
export function ShortLinkPage() {
  const { code } = useParams({ from: '/s/$code' })
  const { data, isLoading, error } = useQuery({
    queryKey: ['short-link', code],
    queryFn: () => resolveShortLink(code),
    enabled: isSupabaseConfigured,
    staleTime: Infinity, // one resolve per visit — each RPC call counts a click
  })

  if (!isSupabaseConfigured) {
    return (
      <LinkState title="short urls offline">
        Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable /s/ links.
      </LinkState>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-3">
          <p className="font-mono text-xs text-muted-foreground">
            <span className="text-[var(--term-green)]">$</span> resolve /s/{code}<span className="caret" />
          </p>
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return <LinkState title="resolve failed">{(error as Error).message}</LinkState>
  }

  if (!data) {
    return (
      <LinkState title="dead link">
        <span className="text-primary">/s/{code}</span> doesn't point anywhere — it may have been
        deleted by its owner.
      </LinkState>
    )
  }

  return <ProfilePage usernames={configToUsernames(data.config)} />
}

function LinkState({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col px-4 py-10">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="term-window scanlines">
          <div className="term-bar">
            <span className="term-dot" style={{ background: 'var(--term-red)' }} />
            <span className="term-dot" style={{ background: 'var(--term-amber)' }} />
            <span className="term-dot" style={{ background: 'var(--term-green)' }} />
            <span className="ml-2 font-mono text-[11px] text-muted-foreground/80">~/s — {title}</span>
          </div>
          <div className="crt-grid px-7 py-9 text-center">
            <p className="glow-text font-pixel text-4xl text-primary">404</p>
            <p className="mt-4 font-mono text-sm leading-relaxed text-muted-foreground">{children}</p>
            <div className="mt-6 flex justify-center gap-2">
              <Button asChild variant="outline" className="rounded-md font-mono text-xs">
                <Link to="/app">cd ~/dashboard</Link>
              </Button>
              <Button asChild className="rounded-md font-mono text-xs">
                <Link to="/links">mint your own</Link>
              </Button>
            </div>
          </div>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}
