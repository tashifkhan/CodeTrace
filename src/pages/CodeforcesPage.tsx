import { useEffect, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useCodeforcesDetail, useCodeforcesHeatmap, useUpcomingContests } from '../hooks/usePlatform'
import { StatNumber } from '../components/StatNumber'
import { RatingChart } from '../components/RatingChart'
import { UniversalHeatmap } from '../components/UniversalHeatmap'
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
import { formatDisplayDate, formatDurationShort } from '@/lib/utils'

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

const HEATMAP_MODES = [
  { value: '90', label: '90D' },
  { value: '365', label: '365D' },
  { value: 'year', label: 'Year' },
] as const

function rankColor(rank: string | null | undefined) {
  if (!rank) return 'var(--color-muted)'
  return RANK_COLORS[rank.toLowerCase()] ?? 'var(--color-muted)'
}

export function CodeforcesPage() {
  const { username } = useParams({ from: '/codeforces/$username' })
  const [heatmapMode, setHeatmapMode] = useState<'90' | '365' | 'year'>('365')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    document.title = `${username} | Codeforces Profile`
  }, [username])

  const { data, isLoading, error } = useCodeforcesDetail(username)

  const { data: heatmapData } = useCodeforcesHeatmap(
    username,
    heatmapMode === 'year' ? { year: selectedYear } : { days: Number(heatmapMode) },
  )

  const { data: upcomingContests } = useUpcomingContests()

  const availableHeatmapYears = heatmapData?.available_years ?? []

  function handleHeatmapModeChange(value: '90' | '365' | 'year') {
    setHeatmapMode(value)

    if (value === 'year' && availableHeatmapYears.length > 0 && !availableHeatmapYears.includes(selectedYear)) {
      setSelectedYear(availableHeatmapYears[0])
    }
  }

  if (isLoading) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BackLink />
      <div className="grid gap-4 mt-6">{[1,2,3].map(i => <Card key={i}><CardContent><LoadingCard /></CardContent></Card>)}</div>
    </div>
  )

  if (error || !data) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BackLink />
      <ErrorBadge message={(error as Error)?.message ?? 'Failed to load Codeforces stats'} />
    </div>
  )

  const ratingHistory = data.ratingHistory ?? data.rating_history ?? []
  const heatmapPeriodLabel = heatmapMode === 'year'
    ? String(heatmapData?.year ?? selectedYear)
    : heatmapMode === '90'
      ? 'the last 90 days'
      : 'the last 365 days'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <BackLink />

      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 pb-4">
        <div className="flex items-center gap-4 flex-1">
          {data.avatar && (
            <Avatar className="size-16 rounded-2xl">
              <AvatarImage src={data.avatar} alt={data.handle} className="rounded-2xl" />
              <AvatarFallback className="rounded-2xl">{data.handle.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="gap-1.5" style={{ color: 'var(--platform-codeforces)' }}>
                <PlatformIcon platform="codeforces" className="size-3" />
                Codeforces
              </Badge>
              {data.rank && (
                <Badge variant="outline" style={{ color: rankColor(data.rank), borderColor: `color-mix(in srgb, ${rankColor(data.rank)} 30%, transparent)` }}>
                  {data.rank}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">{data.handle}</h1>
            {data.organization && <p className="text-sm text-muted-foreground mt-1">{data.organization}</p>}
          </div>
        </div>
        <div className="flex gap-8">
          <StatNumber value={data.rating ?? 0} label="Current Rating" size="lg" enabled={!!data} />
          <StatNumber value={data.maxRating ?? 0} label="Max Rating" size="lg" enabled={!!data} />
        </div>
      </div>

      <Separator />

      <Section title="Overview">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <StatNumber value={data.rating ?? 0} label="Current Rating" enabled={!!data} />
          <StatNumber value={data.maxRating ?? 0} label="Peak Rating" enabled={!!data} />
          <StatNumber value={data.solvedCount ?? data.solved_problems_count} label="Problems Solved" enabled={!!data} />
          <StatNumber value={data.contests_count} label="Contests" enabled={!!data} />
        </div>
        <Separator />
        <div className="flex flex-wrap gap-6 text-xs font-mono text-muted-foreground">
          {data.country && <span>{data.country}{data.city ? `, ${data.city}` : ''}</span>}
          {data.organization && <span>{data.organization}</span>}
          {data.contribution != null && <span>Contribution: {data.contribution}</span>}
          {data.friendOfCount != null && <span>{data.friendOfCount.toLocaleString()} friends</span>}
          {data.registrationTimeSeconds != null && (
            <span>Joined {formatDisplayDate(data.registrationTimeSeconds, { month: 'short', year: 'numeric' })}</span>
          )}
          {data.maxRank && (
            <div className="ml-0">
              <span>Max rank: </span>
              <span style={{ color: rankColor(data.maxRank) }}>{data.maxRank}</span>
            </div>
          )}
        </div>
      </Section>

      {upcomingContests && upcomingContests.length > 0 && (
        <Section title="Upcoming Contests">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingContests.map(contest => {
              const content = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-mono text-foreground leading-snug">{contest.name}</div>
                      {contest.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{contest.description}</p>
                      )}
                    </div>
                    {contest.websiteUrl && <ExternalLink className="size-3 text-muted-foreground" />}
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">{contest.type ?? 'contest'}</Badge>
                    <Badge variant="outline" className="text-[10px]">{formatDurationShort(contest.durationSeconds)}</Badge>
                    {contest.preparedBy && <Badge variant="outline" className="text-[10px]">by {contest.preparedBy}</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(contest.startTimeSeconds * 1000).toLocaleString('en', {
                      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
                    })}
                  </div>
                </>
              )

              return contest.websiteUrl ? (
                <a
                  key={contest.id}
                  href={contest.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col gap-3 rounded-2xl border border-border bg-secondary/40 p-4 transition-colors hover:border-primary/30"
                >
                  {content}
                </a>
              ) : (
                <div key={contest.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-secondary/40 p-4">
                  {content}
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {ratingHistory.length > 1 && (
        <Section title={`Rating History (${ratingHistory.length} contests)`}>
          <RatingChart history={ratingHistory} height={140} color="var(--platform-codeforces)" />
        </Section>
      )}

      {ratingHistory.length > 0 && (
        <Section title="Recent Contest Performance">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contest</TableHead>
                <TableHead className="text-right">Rank</TableHead>
                <TableHead className="text-right">Old</TableHead>
                <TableHead className="text-right">New</TableHead>
                <TableHead className="text-right">Δ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...ratingHistory].reverse().slice(0, 20).map((point, i) => {
                const delta = point.newRating - point.oldRating
                const date = point.ratingUpdateTimeSeconds
                  ? new Date(point.ratingUpdateTimeSeconds * 1000).toLocaleDateString('en', { month: 'short', day: 'numeric', year: '2-digit' })
                  : null
                return (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="font-mono truncate max-w-[200px]">{point.contestName}</div>
                      {date && <div className="text-muted-foreground/60 text-[10px]">{date}</div>}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{point.rank.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{point.oldRating}</TableCell>
                    <TableCell className="text-right text-foreground">{point.newRating}</TableCell>
                    <TableCell className="text-right font-medium" style={{ color: delta >= 0 ? '#2db55d' : '#ef4444' }}>
                      {delta >= 0 ? '+' : ''}{delta}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Section>
      )}

      {heatmapData && heatmapData.heatmap && heatmapData.heatmap.length > 0 && (
        <div className="flex flex-col gap-3">
          <ActivityFilterBar
            title="Activity Lens"
            description="Switch between a short pulse check, the standard yearly runway, or a full calendar season. These controls are driven directly by the newer heatmap API ranges."
            options={[...HEATMAP_MODES]}
            value={heatmapMode}
            onValueChange={value => handleHeatmapModeChange(value as '90' | '365' | 'year')}
            years={heatmapMode === 'year' ? availableHeatmapYears : []}
            selectedYear={heatmapMode === 'year' ? selectedYear : null}
            onYearChange={setSelectedYear}
            meta={[
              `${heatmapData.total_accepted.toLocaleString()} accepted`,
              `${heatmapData.current_streak}d live streak`,
              `${formatDisplayDate(heatmapData.start_date, { month: 'short', day: 'numeric', year: 'numeric' })} - ${formatDisplayDate(heatmapData.end_date, { month: 'short', day: 'numeric', year: 'numeric' })}`,
            ]}
          />

          <UniversalHeatmap
            calendar={Object.fromEntries(
              heatmapData.heatmap.map(day => [day.date, day.submissions])
            )}
            totalSubmissions={heatmapData.total_submissions}
            activeDays={heatmapData.active_days}
            maxStreak={heatmapData.longest_streak}
            startDate={heatmapData.start_date}
            endDate={heatmapData.end_date}
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
