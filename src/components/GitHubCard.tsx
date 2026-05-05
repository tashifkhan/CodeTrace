import { useQuery } from '@tanstack/react-query'
import { fetchGitHubStats } from '../api/github'
import { StatNumber } from './StatNumber'
import { LanguageBar } from './LanguageBar'
import { PinnedRepos } from './PinnedRepos'
import { LoadingCard } from './LoadingCard'
import { ErrorBadge } from './ErrorBadge'
import { Separator } from '@/components/ui/separator'

interface Props {
  username: string
}

export function GitHubCard({ username }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['github', username],
    queryFn: () => fetchGitHubStats(username),
    enabled: !!username,
  })

  if (isLoading) return <LoadingCard />
  if (error || !data) return <ErrorBadge message={(error as Error)?.message ?? 'Failed to load GitHub stats'} />

  const { stats, pinned, stars } = data

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="grid grid-cols-3 gap-4">
        <StatNumber value={stats.totalCommits} label="Commits" enabled={!!data} />
        <StatNumber value={stats.currentStreak} label="Streak" suffix="d" enabled={!!data} />
        <StatNumber value={stars.total_stars} label="Stars" enabled={!!data} />
      </div>

      <Separator />

      <div className="flex gap-6 text-xs font-mono text-muted-foreground">
        <span>Longest streak: <span className="text-foreground">{stats.longestStreak}d</span></span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Languages</span>
        <LanguageBar languages={stats.topLanguages} />
      </div>

      {pinned.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Pinned</span>
          <PinnedRepos repos={pinned} />
        </div>
      )}
    </div>
  )
}
