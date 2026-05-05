import { useQuery } from '@tanstack/react-query'
import { fetchHackerRankStats } from '../api/hackerrank'
import { StatNumber } from './StatNumber'
import { DifficultyMeter } from './DifficultyMeter'
import { LoadingCard } from './LoadingCard'
import { ErrorBadge } from './ErrorBadge'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface Props {
  username: string
}

export function HackerRankCard({ username }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hackerrank', username],
    queryFn: () => fetchHackerRankStats(username),
    enabled: !!username,
  })

  if (isLoading) return <LoadingCard />
  if (error || !data) return <ErrorBadge message={(error as Error)?.message ?? 'Failed to load HackerRank stats'} />

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-start gap-4">
        <div className="grid grid-cols-2 gap-4 flex-1">
          <StatNumber value={data.totalSolved} label="Solved" enabled={!!data} />
          <StatNumber value={data.ranking} label="Rank" enabled={!!data} />
        </div>
      </div>

      <Separator />

      <div className="flex gap-5 text-xs font-mono text-muted-foreground">
        <span>Acceptance: <span className="text-foreground">{data.acceptanceRate.toFixed(1)}%</span></span>
        <span>Reputation: <span className="text-foreground">{data.reputation}</span></span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Difficulty Breakdown</span>
        <DifficultyMeter
          easySolved={data.easySolved}
          mediumSolved={data.mediumSolved}
          hardSolved={data.hardSolved}
          totalEasy={data.totalEasy}
          totalMedium={data.totalMedium}
          totalHard={data.totalHard}
        />
      </div>

      <Separator />

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Easy', value: data.easySolved, color: '#2db55d' },
          { label: 'Medium', value: data.mediumSolved, color: '#ffa116' },
          { label: 'Hard', value: data.hardSolved, color: '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-xl font-mono font-medium" style={{ color }}>{value}</span>
            <Badge variant="outline" className="text-[10px]" style={{ color, borderColor: `color-mix(in srgb, ${color} 30%, transparent)` }}>
              {label}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
