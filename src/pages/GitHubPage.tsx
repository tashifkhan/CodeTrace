import { useEffect } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, ExternalLink, Star, GitFork } from 'lucide-react'
import { useGitHubDetail } from '../hooks/usePlatform'
import { StatNumber } from '../components/StatNumber'
import { LanguageBar } from '../components/LanguageBar'
import { UniversalHeatmap } from '../components/UniversalHeatmap'
import { LoadingCard } from '../components/LoadingCard'
import { ErrorBadge } from '../components/ErrorBadge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { PlatformIcon } from '../components/PlatformIcon'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {children}
      </CardContent>
    </Card>
  )
}

export function GitHubPage() {
  const { username } = useParams({ from: '/github/$username' })

  useEffect(() => {
    document.title = `${username} | GitHub Profile`
  }, [username])

  const { data, isLoading, error } = useGitHubDetail(username)

  if (isLoading) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BackLink />
      <div className="grid grid-cols-1 gap-4 mt-6">
        {[1,2,3].map(i => <Card key={i}><CardContent><LoadingCard /></CardContent></Card>)}
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BackLink />
      <ErrorBadge message={(error as Error)?.message ?? 'Failed to load GitHub stats'} />
    </div>
  )

  const { stats, pinned, stars, contributions, prs, orgContributions, profileViews } = data

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <BackLink />

      {/* Hero */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 pb-4">
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="size-16 rounded-2xl">
            <AvatarImage src={`https://github.com/${username}.png`} alt={username} className="rounded-2xl" />
            <AvatarFallback className="rounded-2xl">{username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="gap-1.5" style={{ color: 'var(--platform-github)' }}>
                <PlatformIcon platform="github" className="size-3" />
                GitHub
              </Badge>
              {profileViews > 0 && (
                <span className="text-[10px] font-mono text-muted-foreground">{profileViews} profile views</span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">{username}</h1>
          </div>
        </div>
        <div className="flex gap-8">
          <StatNumber value={stats.totalCommits} label="Total Commits" size="lg" enabled={!!data} />
          <StatNumber value={stars.total_stars} label="Total Stars" size="lg" enabled={!!data} />
        </div>
      </div>

      <Separator />

      {/* Streak & overview */}
      <Section title="Overview">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <StatNumber value={stats.currentStreak} label="Current Streak" suffix="d" enabled={!!data} />
          <StatNumber value={stats.longestStreak} label="Longest Streak" suffix="d" enabled={!!data} />
          <StatNumber value={stats.totalCommits} label="Total Commits" enabled={!!data} />
          <StatNumber value={stars.total_stars} label="Stars Earned" enabled={!!data} />
        </div>
      </Section>

      {/* Languages */}
      <Section title="Language Breakdown">
        <LanguageBar languages={stats.topLanguages} />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
          {stats.topLanguages.map(lang => (
            <div key={lang.name} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
              <span className="text-sm font-mono text-foreground">{lang.name}</span>
              <span className="text-sm font-mono text-primary">{lang.percentage}%</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Contribution Heatmap */}
      {contributions && (
        <UniversalHeatmap githubContributions={contributions} label="contributions" />
      )}

      {/* Pinned Repos */}
      {pinned.length > 0 && (
        <Section title={`Pinned Repositories (${pinned.length})`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pinned.map(repo => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col gap-2 p-4 rounded-xl border border-border bg-secondary/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-foreground group-hover:text-primary transition-colors">{repo.name}</span>
                  <ExternalLink className="size-3 text-muted-foreground" />
                </div>
                {repo.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{repo.description}</p>
                )}
                <div className="flex items-center gap-4 mt-auto pt-1 text-[11px] font-mono">
                  <span className="text-muted-foreground/60">{repo.primary_language}</span>
                  <span className="text-muted-foreground/60 ml-auto flex items-center gap-0.5">
                    <Star className="size-3" /> {repo.stars}
                  </span>
                  <span className="text-muted-foreground/60 flex items-center gap-0.5">
                    <GitFork className="size-3" /> {repo.forks}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* Top Starred Repos */}
      {stars.repositories?.length > 0 && (
        <Section title="Top Starred Repositories">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repository</TableHead>
                <TableHead>Language</TableHead>
                <TableHead className="text-right">Stars</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stars.repositories.slice(0, 10).map(repo => (
                <TableRow key={repo.name}>
                  <TableCell className="font-mono">{repo.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{repo.language}</TableCell>
                  <TableCell className="text-right font-mono text-primary flex items-center justify-end gap-1">
                    <Star className="size-3" /> {repo.stars}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      )}

      {/* Pull Requests */}
      {prs.length > 0 && (
        <Section title={`Pull Requests (${prs.length})`}>
          <div className="flex flex-col gap-2">
            {prs.slice(0, 10).map(pr => (
              <a
                key={`${pr.repo}-${pr.number}`}
                href={pr.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-3 p-3 rounded-xl border border-border bg-secondary/50 hover:border-primary/30 transition-colors"
              >
                <Badge
                  variant={pr.merged_at ? 'default' : pr.state === 'open' ? 'outline' : 'destructive'}
                  className={`text-[10px] flex-shrink-0 mt-0.5 ${
                    pr.merged_at ? 'bg-purple-900/40 text-purple-300 border-purple-500/30' :
                    pr.state === 'open' ? 'bg-green-900/40 text-green-400 border-green-500/30' :
                    ''
                  }`}
                >
                  {pr.merged_at ? 'merged' : pr.state}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">{pr.title}</div>
                  <div className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
                    {pr.repo} #{pr.number} · {new Date(pr.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* Org Contributions */}
      {orgContributions.length > 0 && (
        <Section title={`Organization Contributions (${orgContributions.length})`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {orgContributions.slice(0, 8).map(org => (
              <a
                key={org.org}
                href={org.org_url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col gap-2 p-3 rounded-xl border border-border bg-secondary/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Avatar size="sm">
                    <AvatarImage src={org.org_avatar_url} alt={org.org} />
                    <AvatarFallback>{org.org.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-mono text-foreground group-hover:text-primary transition-colors">@{org.org}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {org.repos.slice(0, 5).map(r => (
                    <Badge key={r} variant="outline" className="text-[10px] font-mono">{r}</Badge>
                  ))}
                  {org.repos.length > 5 && (
                    <span className="text-[10px] text-muted-foreground">+{org.repos.length - 5} more</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

function BackLink() {
  return (
    <Button variant="ghost" size="sm" asChild className="w-fit font-mono text-xs text-muted-foreground hover:text-primary">
      <Link to="/">
        <ArrowLeft data-icon="inline-start" />
        Back to dashboard
      </Link>
    </Button>
  )
}
