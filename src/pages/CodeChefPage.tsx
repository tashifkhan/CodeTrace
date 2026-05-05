import { useEffect } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { fetchCodeChefDetail } from '../api/codechef'
import { StatNumber } from '../components/StatNumber'
import { CodeChefHeatmap } from '../components/CodeChefHeatmap'
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

export function CodeChefPage() {
  const { username } = useParams({ from: '/codechef/$username' })

  useEffect(() => {
    document.title = `${username} | CodeChef Profile`
  }, [username])

  const { data, isLoading, error } = useQuery({
    queryKey: ['codechef-detail', username],
    queryFn: () => fetchCodeChefDetail(username!),
    enabled: !!username,
  })

  if (isLoading) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BackLink />
      <div className="grid gap-4 mt-6">{[1,2,3].map(i => <Card key={i}><CardContent><LoadingCard /></CardContent></Card>)}</div>
    </div>
  )

  if (error || !data) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BackLink />
      <ErrorBadge message={(error as Error)?.message ?? 'Failed to load CodeChef stats'} />
    </div>
  )

  const profile = data.profile
  const ratingHistory = data.ratingHistory?.ratingData ?? []
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <BackLink />

      {/* Hero */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 pb-4">
        <div className="flex items-center gap-4 flex-1">
          {profile.profile && (
            <Avatar className="size-16 rounded-2xl">
              <AvatarImage src={profile.profile} alt={data.handle} className="rounded-2xl border border-border" />
              <AvatarFallback className="rounded-2xl">{data.handle.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="gap-1.5" style={{ color: 'var(--platform-codechef)', borderColor: 'color-mix(in srgb, var(--platform-codechef) 30%, transparent)' }}>
                <PlatformIcon platform="codechef" className="size-3" />
                CodeChef
              </Badge>
              {profile.stars && (
                <Badge variant="outline" style={{ color: 'var(--platform-codechef)', borderColor: 'color-mix(in srgb, var(--platform-codechef) 30%, transparent)' }}>
                  {profile.stars}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">{profile.name || data.handle}</h1>
            {profile.countryName && <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              {profile.countryFlag && <img src={profile.countryFlag} alt="flag" className="h-3 rounded-[2px]" />}
              {profile.countryName}
            </p>}
          </div>
        </div>
        <div className="flex gap-8">
          <StatNumber value={profile.currentRating ?? 0} label="Current Rating" size="lg" enabled={!!data} />
          <StatNumber value={profile.highestRating ?? 0} label="Max Rating" size="lg" enabled={!!data} />
        </div>
      </div>

      <Separator />

      <Section title="Overview">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <StatNumber value={profile.currentRating ?? 0} label="Current Rating" enabled={!!data} />
          <StatNumber value={profile.highestRating ?? 0} label="Peak Rating" enabled={!!data} />
          <StatNumber value={profile.globalRank ?? 0} label="Global Rank" enabled={!!data} />
          <StatNumber value={profile.countryRank ?? 0} label="Country Rank" enabled={!!data} />
        </div>
      </Section>

      {/* Contest history table */}
      {ratingHistory.length > 0 && (
        <Section title="Recent Contest Performance">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contest</TableHead>
                <TableHead className="text-right">Rank</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...ratingHistory].reverse().slice(0, 20).map((point, i) => {
                const date = point.end_date
                  ? new Date(point.end_date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: '2-digit' })
                  : null
                return (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="font-mono truncate max-w-[300px] text-foreground">{point.name}</div>
                      <div className="text-muted-foreground/60 text-[10px]">{point.code}</div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{point.rank}</TableCell>
                    <TableCell className="text-right text-foreground font-medium" style={{ color: point.color || 'var(--foreground)' }}>
                      {point.rating}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">{date}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Section>
      )}

      {/* Heatmap Section */}
      {data.heatmap && data.heatmap.heatMap && data.heatmap.heatMap.length > 0 && (
        <CodeChefHeatmap heatmap={data.heatmap.heatMap} />
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
