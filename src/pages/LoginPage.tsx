import { useEffect, useState } from 'react'
import { Link, useNavigate, useRouter, useSearch } from '@tanstack/react-router'
import { SeoHead } from '@/components/SeoHead'
import { ArrowLeft, LogIn, Link2, UserCircle2, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppFooter } from '@/components/AppFooter'
import { PlatformIcon } from '@/components/PlatformIcon'
import { useAuth } from '@/hooks/useAuth'
import { signInWithGoogle } from '@/api/savedProfiles'
import { ALL_PLATFORMS } from '@/api/unifiedClient'

const PLATFORM_NAMES: Record<string, string> = {
  github: 'GitHub',
  leetcode: 'LeetCode',
  codeforces: 'Codeforces',
  gfg: 'GeeksForGeeks',
  codechef: 'CodeChef',
  hackerrank: 'HackerRank',
  tuf: 'takeUforward',
}

const PERKS = [
  { icon: UserCircle2, title: 'claim a userid', text: 'One clean public URL — codetrace/you — for your résumé and bio.' },
  { icon: Link2, title: 'configure your ids', text: 'Attach any mix of platform accounts to your userid, several per platform.' },
  { icon: Share2, title: 'share anywhere', text: 'Your saved profile stays live and recompiles stats on every visit.' },
]

export function LoginPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const { user, isConfigured, isLoading } = useAuth()
  const { next } = useSearch({ from: '/login' })
  const [error, setError] = useState<string | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(false)

  // Already signed in — continue to where the visitor was headed. `next` may
  // carry its own query string, so push the raw href.
  useEffect(() => {
    if (isLoading || !user) return
    if (next) router.history.push(next)
    else navigate({ to: '/account' })
  }, [isLoading, user, next, navigate, router])

  const handleLogin = async () => {
    setError(null)
    setIsSigningIn(true)
    try {
      await signInWithGoogle(`${window.location.origin}${next ?? '/account'}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setIsSigningIn(false)
    }
  }

  return (
    <>
      <SeoHead title="Login — CodeTrace" description="Sign in to claim your userid and save your unified developer footprint." url="https://codetrace.xyz/login" />
      <div className="flex min-h-screen flex-col px-4 py-10 md:px-8">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center">
        <nav className="mb-6 font-mono text-[11px]">
          <Link
            to="/app"
            className="prompt inline-flex items-center uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="mr-1.5 size-3" />
            cd ../dashboard
          </Link>
        </nav>

        <div className="term-window scanlines rise-in">
          <div className="term-bar">
            <span className="term-dot" style={{ background: 'var(--term-red)' }} />
            <span className="term-dot" style={{ background: 'var(--term-amber)' }} />
            <span className="term-dot" style={{ background: 'var(--term-green)' }} />
            <span className="ml-2 font-mono text-[11px] text-muted-foreground/80">~/codetrace — auth</span>
          </div>

          <div className="crt-grid px-6 py-9 md:px-10 md:py-11">
            <p className="font-mono text-[11px] text-muted-foreground">
              <span className="text-[var(--term-green)]">$</span> codetrace login --provider google
            </p>
            <h1 className="glow-text mt-4 font-pixel text-4xl leading-tight text-foreground md:text-5xl">
              Save your trace
            </h1>
            <p className="mt-4 max-w-md font-mono text-sm leading-relaxed text-muted-foreground">
              Sign in to claim a userid and attach your platform ids to it — one
              short URL for your whole coding footprint.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {PERKS.map((perk) => (
                <div key={perk.title}>
                  <perk.icon className="size-4 text-primary" />
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground">
                    {perk.title}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{perk.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-9">
              <Button
                onClick={handleLogin}
                disabled={!isConfigured || isSigningIn}
                size="lg"
                className="w-full gap-2 font-mono text-sm shadow-lg shadow-primary/25 sm:w-auto sm:px-8"
              >
                <LogIn data-icon="inline-start" />
                {isSigningIn ? 'Opening Google…' : 'Continue with Google'}
              </Button>
              {!isConfigured && (
                <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
                  Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
                </p>
              )}
              {error && <p className="mt-4 font-mono text-xs text-destructive">{error}</p>}
            </div>

            {/* Everything the saved profile can aggregate — including TUF */}
            <div className="mt-10 border-t border-border/50 pt-6">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                <span className="text-[var(--term-green)]">&gt; </span>tracks all seven platforms
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {ALL_PLATFORMS.map((platform) => (
                  <span
                    key={platform}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"
                  >
                    <PlatformIcon platform={platform} className="size-3.5" />
                    {PLATFORM_NAMES[platform]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <AppFooter />
      </div>
    </div>
    </>
  )
}
