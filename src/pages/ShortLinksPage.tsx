import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, Dices, ExternalLink, Link2, Loader2, LogOut, Plus, Trash2, Import } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { AppHeader } from '@/components/AppHeader'
import { AppFooter } from '@/components/AppFooter'
import { PlatformIcon } from '@/components/PlatformIcon'
import { PlatformHandleInputs } from '@/components/PlatformHandleInputs'
import { useAuth } from '@/hooks/useAuth'
import { getMyPrimaryProfileConfig, signOut } from '@/api/savedProfiles'
import {
  createShortLink,
  deleteShortLink,
  generateShortCode,
  listMyShortLinks,
  shortLinkUrl,
  validateShortCode,
  type ShortLink,
} from '@/api/shortLinks'
import {
  EMPTY_USERNAMES,
  configToUsernames,
  hasConfigAccounts,
  usernamesToConfig,
} from '@/lib/profileConfig'
import type { Platform, Usernames } from '@/types/api'

export function ShortLinksPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isConfigured, isLoading } = useAuth()

  // Auth-only page — bounce anonymous visitors through login and back here.
  useEffect(() => {
    if (!isLoading && !user) navigate({ to: '/login', search: { next: '/links' } })
  }, [isLoading, user, navigate])

  const [handles, setHandles] = useState<Usernames>({ ...EMPTY_USERNAMES })
  const [customCode, setCustomCode] = useState('')
  const [label, setLabel] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const { data: links, isLoading: linksLoading, error: linksError } = useQuery({
    queryKey: ['short-links', user?.id],
    queryFn: listMyShortLinks,
    enabled: Boolean(user) && isConfigured,
  })

  const config = useMemo(() => usernamesToConfig(handles), [handles])
  const codeValidation = customCode ? validateShortCode(customCode) : null

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['short-links'] })

  const handleImportSaved = async () => {
    setFormError(null)
    setIsImporting(true)
    try {
      const saved = await getMyPrimaryProfileConfig()
      if (!saved || !hasConfigAccounts(saved)) {
        setFormError('No saved profile yet — save one from the dashboard first, or type handles below.')
        return
      }
      setHandles(configToUsernames(saved))
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsImporting(false)
    }
  }

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (customCode && codeValidation) {
      setFormError(codeValidation)
      return
    }
    setIsCreating(true)
    try {
      const created = await createShortLink({
        config,
        code: customCode || undefined,
        label: label || undefined,
      })
      setCustomCode('')
      setLabel('')
      await refresh()
      await navigator.clipboard?.writeText(shortLinkUrl(created.code)).catch(() => undefined)
      setCopiedCode(created.code)
      setTimeout(() => setCopiedCode((prev) => (prev === created.code ? null : prev)), 2400)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopy = async (link: ShortLink) => {
    try {
      await navigator.clipboard.writeText(shortLinkUrl(link.code))
      setCopiedCode(link.code)
      setTimeout(() => setCopiedCode((prev) => (prev === link.code ? null : prev)), 2000)
    } catch {
      /* clipboard blocked — the url is still visible to select manually */
    }
  }

  const handleDelete = async (link: ShortLink) => {
    try {
      await deleteShortLink(link.id)
      await refresh()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err))
    }
  }

  if (isLoading || (!user && isConfigured)) {
    return (
      <div className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-3xl">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-12 md:px-8">
      <div className="mx-auto max-w-3xl">
        <AppHeader backTo="/app" backLabel="dashboard" shareTitle="CodeTrace short links" />

        {/* ── Mint a new short URL ─────────────────────────────── */}
        <section className="term-window scanlines rise-in">
          <div className="term-bar">
            <span className="term-dot" style={{ background: 'var(--term-red)' }} />
            <span className="term-dot" style={{ background: 'var(--term-amber)' }} />
            <span className="term-dot" style={{ background: 'var(--term-green)' }} />
            <span className="ml-2 font-mono text-[11px] text-muted-foreground/80">~/links — mint</span>
          </div>

          <form onSubmit={handleCreate} className="crt-grid px-6 py-8 md:px-9">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="glow-text font-pixel text-3xl text-foreground">Short URLs</h1>
                <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                  <span className="text-[var(--term-green)]">$</span> stack handles → get{' '}
                  <span className="text-primary">{window.location.host}/s/&lt;id&gt;</span>
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleImportSaved}
                disabled={isImporting}
                className="font-mono text-xs"
              >
                {isImporting ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Import data-icon="inline-start" />}
                load saved profile
              </Button>
            </div>

            <div className="mt-7">
              <PlatformHandleInputs value={handles} onChange={setHandles} />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <div>
                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  custom id <span className="opacity-50">(optional)</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground/60">/s/</span>
                  <Input
                    value={customCode}
                    onChange={(event) => setCustomCode(event.target.value)}
                    placeholder="auto"
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Random id"
                    onClick={() => setCustomCode(generateShortCode())}
                  >
                    <Dices className="size-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  label <span className="opacity-50">(optional)</span>
                </label>
                <Input
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="résumé link"
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={isCreating || !hasConfigAccounts(config) || Boolean(customCode && codeValidation)}
                  className="w-full gap-2 font-mono text-xs sm:w-auto"
                >
                  {isCreating ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Plus data-icon="inline-start" />}
                  mint url
                </Button>
              </div>
            </div>

            {customCode && codeValidation && (
              <p className="mt-3 font-mono text-xs text-muted-foreground">{codeValidation}</p>
            )}
            {formError && <p className="mt-3 font-mono text-xs text-destructive">{formError}</p>}
          </form>
        </section>

        {/* ── Existing links ───────────────────────────────────── */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground">
              <span className="text-muted-foreground/40">## </span>your_links
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void signOut().then(() => navigate({ to: '/app' }))}
              className="font-mono text-xs text-muted-foreground hover:text-destructive"
            >
              <LogOut data-icon="inline-start" />sign out
            </Button>
          </div>

          {linksLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : linksError ? (
            <p className="font-mono text-xs text-destructive">{(linksError as Error).message}</p>
          ) : !links?.length ? (
            <p className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-center font-mono text-xs text-muted-foreground">
              <Link2 className="mx-auto mb-2 size-4 opacity-50" />
              no short urls yet — mint your first one above
            </p>
          ) : (
            <div className="divide-y divide-border/40 border-y border-border/40">
              {links.map((link) => {
                const accounts = Object.entries(link.config) as [Platform, string[]][]
                return (
                  <div key={link.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <a
                          href={`/s/${link.code}`}
                          className="font-mono text-sm text-primary underline-offset-4 hover:underline"
                        >
                          /s/{link.code}
                        </a>
                        {link.label && (
                          <span className="text-xs text-muted-foreground">{link.label}</span>
                        )}
                        <span className="font-mono text-[10px] text-muted-foreground/50">
                          {link.clicks} visit{link.clicks === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                        {accounts.map(([platform, users]) => (
                          <span key={platform} className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                            <PlatformIcon platform={platform} className="size-3 opacity-70" />
                            {users.join(', ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" title="Copy link" onClick={() => void handleCopy(link)}>
                        {copiedCode === link.code ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" title="Open" asChild>
                        <a href={`/s/${link.code}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="size-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        onClick={() => void handleDelete(link)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <p className="mt-4 font-mono text-[10px] text-muted-foreground/60">
            {'// '}prefer a named URL? configure your userid &amp; platform ids at{' '}
            <Link to="/account" className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline">
              /account
            </Link>{' '}
            for {window.location.host}/&lt;userid&gt;
          </p>
        </section>

        <AppFooter />
      </div>
    </div>
  )
}
