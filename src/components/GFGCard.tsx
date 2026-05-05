import { useQuery } from '@tanstack/react-query'
import { fetchGFGStats } from '../api/gfg'
import { StatNumber } from './StatNumber'
import { LoadingCard } from './LoadingCard'
import { ErrorBadge } from './ErrorBadge'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface Props {
  username: string
}

const DIFFICULTIES = [
  { key: 'School' as const,  color: '#94a3b8' },
  { key: 'Basic' as const,   color: '#64ffda' },
  { key: 'Easy' as const,    color: '#2db55d' },
  { key: 'Medium' as const,  color: '#ffa116' },
  { key: 'Hard' as const,    color: '#ef4444' },
]

export function GFGCard({ username }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['gfg', username],
    queryFn: () => fetchGFGStats(username),
    enabled: !!username,
    retry: false,
  })

  if (isLoading) return <LoadingCard />
  if (error || !data) {
    return <ErrorBadge message={(error as Error)?.message ?? 'GFG stats currently unavailable'} />
  }

  return (
    <div className="flex flex-col gap-5 p-5">
      <StatNumber value={data.totalProblemsSolved} label="Total Solved" size="lg" enabled={!!data} />

      <Separator />

      <div className="grid grid-cols-5 gap-2">
        {DIFFICULTIES.map(({ key, color }) => (
          <div key={key} className="flex flex-col items-center gap-1.5">
            <span className="text-lg font-mono font-medium" style={{ color }}>{data[key]}</span>
            <Badge variant="outline" className="text-[9px]" style={{ color, borderColor: `color-mix(in srgb, ${color} 30%, transparent)` }}>
              {key}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
