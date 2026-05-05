import { useQuery } from '@tanstack/react-query'
import { fetchCodeforcesStats } from '../api/codeforces'
import { StatNumber } from './StatNumber'
import { RatingChart } from './RatingChart'
import { LoadingCard } from './LoadingCard'
import { ErrorBadge } from './ErrorBadge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const RANK_COLORS: Record<string, string> = {
  'legendary grandmaster': '#ff0000',
  'international grandmaster': '#ff3300',
  'grandmaster': '#ff5500',
  'international master': '#ff8800',
  'master': '#ffaa00',
  'candidate master': '#cc00cc',
  'expert': '#5555ff',
  'specialist': '#03a89e',
  'pupil': '#77ff77',
  'newbie': '#808080',
}

function rankColor(rank: string | null | undefined) {
  if (!rank) return 'var(--color-muted)'
  return RANK_COLORS[rank.toLowerCase()] ?? 'var(--color-muted)'
}

interface Props {
  username: string
}

export function CodeforcesCard({ username }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['codeforces', username],
    queryFn: () => fetchCodeforcesStats(username),
    enabled: !!username,
  })

  if (isLoading) return <LoadingCard />
  if (error || !data) return <ErrorBadge message={(error as Error)?.message ?? 'Failed to load Codeforces stats'} />

  const ratingHistory = data.rating_history ?? []

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-start gap-4">
        {data.avatar && (
          <Avatar className="rounded-xl size-12">
            <AvatarImage src={data.avatar} alt={data.handle} />
            <AvatarFallback className="rounded-xl">{data.handle.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-mono font-medium text-foreground">{data.rating ?? '—'}</span>
            {data.rank && (
              <Badge variant="outline" style={{ color: rankColor(data.rank), borderColor: `color-mix(in srgb, ${rankColor(data.rank)} 30%, transparent)` }}>
                {data.rank}
              </Badge>
            )}
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Max: {data.maxRating ?? '—'}{data.maxRank ? ` · ${data.maxRank}` : ''}
          </span>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <StatNumber value={data.solved_problems_count} label="Solved" enabled={!!data} />
        <StatNumber value={data.contests_count} label="Contests" enabled={!!data} />
      </div>

      {ratingHistory.length > 1 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Rating History</span>
          <RatingChart history={ratingHistory} />
        </div>
      )}


    </div>
  )
}
