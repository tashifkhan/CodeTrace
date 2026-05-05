import { useQuery } from '@tanstack/react-query'
import { fetchCodeChefStats } from '../api/codechef'
import { StatNumber } from './StatNumber'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  username: string
}

export function CodeChefCard({ username }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['codechef', username],
    queryFn: () => fetchCodeChefStats(username),
  })

  if (isLoading) return <div className="p-6 space-y-4"><Skeleton className="h-10 w-24" /><Skeleton className="h-4 w-32" /></div>
  if (error || !data) return <div className="p-6 text-sm text-destructive">Failed to load CodeChef data</div>

  const profile = data.profile

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {profile.profile && (
          <img src={profile.profile} alt="Avatar" className="size-10 rounded-full border border-border" />
        )}
        <div className="flex flex-col">
          <span className="font-semibold text-foreground truncate max-w-[200px]">{profile.name || username}</span>
          <span className="text-xs text-muted-foreground">{profile.stars || 'Unrated'}</span>
        </div>
      </div>
      
      <div className="flex gap-8 mt-2">
        <StatNumber value={profile.currentRating ?? 0} label="Current Rating" />
        <StatNumber value={profile.highestRating ?? 0} label="Highest Rating" />
      </div>
    </div>
  )
}
