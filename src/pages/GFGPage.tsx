import { useEffect, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { fetchGFGStats, fetchGFGProfile, fetchGFGHeatmap } from '../api/gfg'
import { StatNumber } from '../components/StatNumber'
import { UniversalHeatmap } from '../components/UniversalHeatmap'
import { LoadingCard } from '../components/LoadingCard'
import { ActivityFilterBar } from '../components/ActivityFilterBar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
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

const DIFFICULTIES = [
  { key: 'School' as const, color: '#94a3b8', label: 'School' },
  { key: 'Basic' as const, color: '#64ffda', label: 'Basic' },
  { key: 'Easy' as const, color: '#2db55d', label: 'Easy' },
  { key: 'Medium' as const, color: '#ffa116', label: 'Medium' },
  { key: 'Hard' as const, color: '#ef4444', label: 'Hard' },
]

const HEATMAP_RANGES = [
  { value: 'all', label: 'Archive' },
  { value: 'last365days', label: '365D' },
  { value: 'year', label: 'Year' },
] as const

export function GFGPage() {
  const { username } = useParams({ from: '/gfg/$username' })
  const [heatmapRange, setHeatmapRange] = useState<'all' | 'last365days' | 'year'>('last365days')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    document.title = `${username} | GeeksForGeeks Profile`
  }, [username])

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['gfg', username],
    queryFn: () => fetchGFGStats(username!),
    enabled: !!username,
    retry: false,
  })

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['gfg-profile', username],
    queryFn: () => fetchGFGProfile(username!),
    enabled: !!username,
    retry: false,
  })

  const { data: heatmapData } = useQuery({
    queryKey: ['gfg-heatmap', username, heatmapRange, selectedYear],
    queryFn: () => fetchGFGHeatmap(username!, {
      range: heatmapRange,
      year: heatmapRange === 'year' ? selectedYear : null,
    }),
    enabled: !!username,
    retry: false,
    placeholderData: previousData => previousData,
  })

  const availableHeatmapYears = heatmapData?.availableYears ?? []

  function handleHeatmapRangeChange(value: 'all' | 'last365days' | 'year') {
    setHeatmapRange(value)

    if (value === 'year' && availableHeatmapYears.length > 0 && !availableHeatmapYears.includes(selectedYear)) {
      setSelectedYear(availableHeatmapYears[0])
    }
  }

  const isLoading = statsLoading || profileLoading

  if (isLoading) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BackLink />
      <div className="grid gap-4 mt-6">{[1,2].map(i => <Card key={i}><CardContent><LoadingCard /></CardContent></Card>)}</div>
    </div>
  )

  if (statsError || !stats) return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <BackLink />
      <Card>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <PlatformIcon platform="gfg" className="size-12 text-[var(--platform-gfg)] opacity-20" />
            <h2 className="text-xl font-display font-bold text-foreground">GeeksForGeeks Stats Unavailable</h2>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              {(statsError as Error)?.message ?? 'GFG API is currently unable to fetch stats — GeeksForGeeks recently changed their page structure.'}
            </p>
            <Button variant="link" size="sm" asChild className="text-primary mt-2">
              <a
                href={`https://auth.geeksforgeeks.org/user/${username}`}
                target="_blank"
                rel="noreferrer"
              >
                View profile on GeeksForGeeks
                <ExternalLink data-icon="inline-end" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const heatmapCalendar: Record<string, number> = {}
  if (heatmapData?.heatmap) {
    for (const entry of heatmapData.heatmap) {
      heatmapCalendar[entry.date] = entry.count
    }
  }

  const heatmapPeriodLabel = heatmapRange === 'year'
    ? String(selectedYear)
    : heatmapRange === 'all'
      ? 'all recorded activity'
      : 'the last 365 days'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <BackLink />

      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 pb-4">
        <div className="flex items-center gap-4 flex-1">
          {profile?.profilePicture && (
            <Avatar className="size-16 rounded-2xl">
              <AvatarImage src={profile.profilePicture} alt={username} className="rounded-2xl" />
              <AvatarFallback className="rounded-2xl">{username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="gap-1.5" style={{ color: 'var(--platform-gfg)' }}>
                <PlatformIcon platform="gfg" className="size-3" />
                GeeksForGeeks
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">{username}</h1>
            {profile?.institute && <p className="text-sm text-muted-foreground mt-1">{profile.institute}</p>}
          </div>
        </div>
        <StatNumber value={stats.totalProblemsSolved} label="Total Solved" size="lg" enabled={!!stats} />
      </div>

      <Separator />

      {profile && (
        <Section title="Profile">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {Number(profile.codingScore) > 0 && <StatNumber value={Number(profile.codingScore)} label="Coding Score" enabled={!!profile} />}
            {Number(profile.monthlyScore) > 0 && <StatNumber value={Number(profile.monthlyScore)} label="Monthly Score" enabled={!!profile} />}
            {Number(profile.currentStreak) > 0 && <StatNumber value={Number(profile.currentStreak)} label="Current Streak" suffix="d" enabled={!!profile} />}
            {Number(profile.maxStreak) > 0 && <StatNumber value={Number(profile.maxStreak)} label="Max Streak" suffix="d" enabled={!!profile} />}
          </div>
          {Number(profile.instituteRank) > 0 && (
            <>
              <Separator />
              <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
                <span>Institute Rank:</span>
                <Badge variant="outline" className="text-primary">#{Number(profile.instituteRank)}</Badge>
              </div>
            </>
          )}
        </Section>
      )}

      {heatmapData && Object.keys(heatmapCalendar).length > 0 && (
        <div className="flex flex-col gap-3">
          <ActivityFilterBar
            title="Activity Lens"
            description="The heatmap endpoint now supports archive, rolling-year, and exact-year slices. This lets the page replay how your GFG practice changed over time instead of showing a single default window."
            options={[...HEATMAP_RANGES]}
            value={heatmapRange}
            onValueChange={value => handleHeatmapRangeChange(value as 'all' | 'last365days' | 'year')}
            years={heatmapRange === 'year' ? availableHeatmapYears : []}
            selectedYear={heatmapRange === 'year' ? selectedYear : null}
            onYearChange={setSelectedYear}
            meta={[
              `${heatmapData.totalSubmissions.toLocaleString()} submissions`,
              `${heatmapData.totalActiveDays} active days`,
              `${formatDisplayDate(heatmapData.fromDate)} - ${formatDisplayDate(heatmapData.toDate)}`,
            ]}
          />

          <UniversalHeatmap
            calendar={heatmapCalendar}
            totalSubmissions={heatmapData.totalSubmissions}
            activeDays={heatmapData.totalActiveDays}
            maxStreak={Number(profile?.maxStreak ?? 0)}
            startDate={heatmapData.fromDate}
            endDate={heatmapData.toDate}
            periodLabel={heatmapPeriodLabel}
          />
        </div>
      )}

      <Section title="Problem Difficulty Breakdown">
        <div className="grid grid-cols-5 gap-3">
          {DIFFICULTIES.map(({ key, color, label }) => (
            <div key={key} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/50 border border-border">
              <span className="text-3xl font-mono font-bold" style={{ color }}>{stats[key]}</span>
              <Badge variant="outline" className="text-[10px]" style={{ color, borderColor: `color-mix(in srgb, ${color} 30%, transparent)` }}>
                {label}
              </Badge>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 mt-2">
          {DIFFICULTIES.filter(d => stats[d.key] > 0).map(({ key, color, label }) => {
            const pct = stats.totalProblemsSolved > 0 ? (stats[key] / stats.totalProblemsSolved) * 100 : 0
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs w-14 flex-shrink-0" style={{ color }}>{label}</span>
                <div className="flex-1 h-2 rounded-full bg-border">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-8 text-right">{stats[key]}</span>
              </div>
            )
          })}
        </div>
      </Section>
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
