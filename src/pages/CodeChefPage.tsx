import { useEffect, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { fetchCodeChefStats, fetchCodeChefHeatmap, fetchCodeChefRating } from '../api/codechef'
import { StatNumber } from '../components/StatNumber'
import { UniversalHeatmap } from '../components/UniversalHeatmap'
import { RatingChart } from '../components/RatingChart'
import { LoadingCard } from '../components/LoadingCard'
import { ErrorBadge } from '../components/ErrorBadge'
import { ActivityFilterBar } from '../components/ActivityFilterBar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { PlatformIcon } from '../components/PlatformIcon'
import { formatDisplayDate } from '@/lib/utils'

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

const HEATMAP_VIEWS = [
  { value: 'all', label: 'Archive' },
  { value: 'last_365', label: '365D' },
  { value: 'year', label: 'Year' },
] as const

export function CodeChefPage() {
  const { username } = useParams({ from: '/codechef/$username' })
  const [heatmapView, setHeatmapView] = useState<'all' | 'last_365' | 'year'>('last_365')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    document.title = `${username} | CodeChef Profile`
  }, [username])

  const { data: profileData, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['codechef-profile', username],
    queryFn: () => fetchCodeChefStats(username!),
    enabled: !!username,
  })

  const { data: ratingData, isLoading: ratingLoading, error: ratingError } = useQuery({
    queryKey: ['codechef-rating', username],
    queryFn: () => fetchCodeChefRating(username!),
    enabled: !!username,
  })

  const { data: heatmapData, isLoading: heatmapLoading, error: heatmapError } = useQuery({
    queryKey: ['codechef-heatmap', username, heatmapView, selectedYear],
    queryFn: () => fetchCodeChefHeatmap(username!, {
      view: heatmapView,
      year: heatmapView === 'year' ? selectedYear : null,
    }),
    enabled: !!username,
    placeholderData: previousData => previousData,
  })

  const availableHeatmapYears = heatmapData?.availableYears ?? []

  function handleHeatmapViewChange(value: 'all' | 'last_365' | 'year') {
    setHeatmapView(value)

    if (value === 'year' && availableHeatmapYears.length > 0 && !availableHeatmapYears.includes(selectedYear)) {
      setSelectedYear(availableHeatmapYears[0])
    }
  }

  const isLoading = profileLoading || ratingLoading || heatmapLoading

  if (isLoading) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BackLink />
      <div className="grid gap-4 mt-6">{[1,2,3].map(i => <Card key={i}><CardContent><LoadingCard /></CardContent></Card>)}</div>
    </div>
  )

  if (profileError || ratingError || heatmapError || !profileData || !ratingData || !heatmapData) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BackLink />
      <ErrorBadge message={(profileError as Error)?.message ?? (ratingError as Error)?.message ?? (heatmapError as Error)?.message ?? 'Failed to load CodeChef stats'} />
    </div>
  )

  const profile = profileData.profile
  const ratingHistory = ratingData.ratingData ?? []
  const ratingChartHistory = ratingHistory.map((point, index) => ({
    contestId: index,
    contestName: point.name,
    rank: Number(point.rank) || 0,
    oldRating: index === 0 ? Number(point.rating) || 0 : Number(ratingHistory[index - 1]?.rating) || 0,
    newRating: Number(point.rating) || 0,
  }))

  const calendar = (() => {
    const nextCalendar: Record<string, number> = {}
    for (const entry of heatmapData.heatMap ?? []) {
      const parts = entry.date.split('-')
      if (parts.length !== 3) continue
      const yyyy = parts[0]
      const mm = parts[1].padStart(2, '0')
      const dd = parts[2].padStart(2, '0')
      nextCalendar[`${yyyy}-${mm}-${dd}`] = entry.value
    }
    return nextCalendar
  })()

  const heatmapPeriodLabel = heatmapView === 'year'
    ? String(selectedYear)
    : heatmapView === 'all'
      ? 'all recorded activity'
      : 'the last 365 days'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <BackLink />

      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 pb-4">
        <div className="flex items-center gap-4 flex-1">
          {profile.profile && (
            <Avatar className="size-16 rounded-2xl">
              <AvatarImage src={profile.profile} alt={profileData.handle} className="rounded-2xl border border-border" />
              <AvatarFallback className="rounded-2xl">{profileData.handle.charAt(0).toUpperCase()}</AvatarFallback>
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
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">{profile.name || profileData.handle}</h1>
            {profile.countryName && <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              {profile.countryFlag && <img src={profile.countryFlag} alt="flag" className="h-3 rounded-[2px]" />}
              {profile.countryName}
            </p>}
          </div>
        </div>
        <div className="flex gap-8">
          <StatNumber value={profile.currentRating ?? 0} label="Current Rating" size="lg" enabled={!!profileData} />
          <StatNumber value={profile.highestRating ?? 0} label="Max Rating" size="lg" enabled={!!profileData} />
        </div>
      </div>

      <Separator />

      <Section title="Overview">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <StatNumber value={profile.currentRating ?? 0} label="Current Rating" enabled={!!profileData} />
          <StatNumber value={profile.highestRating ?? 0} label="Peak Rating" enabled={!!profileData} />
          <StatNumber value={profile.globalRank ?? 0} label="Global Rank" enabled={!!profileData} />
          <StatNumber value={profile.countryRank ?? 0} label="Country Rank" enabled={!!profileData} />
        </div>
      </Section>

      {ratingChartHistory.length > 1 && (
        <Section title="Rating Curve">
          <RatingChart history={ratingChartHistory} height={132} color="var(--platform-codechef)" />
        </Section>
      )}

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

      {heatmapData.heatMap.length > 0 && (
        <div className="flex flex-col gap-3">
          <ActivityFilterBar
            title="Activity Lens"
            description="CodeChef now exposes distinct archive, trailing-year, and explicit-year heatmap windows. This page uses them directly so the grid and totals stay in sync with the selected slice."
            options={[...HEATMAP_VIEWS]}
            value={heatmapView}
            onValueChange={value => handleHeatmapViewChange(value as 'all' | 'last_365' | 'year')}
            years={heatmapView === 'year' ? availableHeatmapYears : []}
            selectedYear={heatmapView === 'year' ? selectedYear : null}
            onYearChange={setSelectedYear}
            meta={[
              `${heatmapData.heatMap.length.toLocaleString()} active cells`,
              heatmapData.firstActiveDate ? `Started ${formatDisplayDate(heatmapData.firstActiveDate)}` : 'No first active date yet',
              heatmapData.lastActiveDate ? `Last active ${formatDisplayDate(heatmapData.lastActiveDate)}` : 'No recent activity yet',
            ]}
          />

          <UniversalHeatmap
            calendar={calendar}
            startDate={heatmapData.firstActiveDate ?? undefined}
            endDate={heatmapData.lastActiveDate ?? undefined}
            periodLabel={heatmapPeriodLabel}
          />
        </div>
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
