import { useEffect, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useHackerRankDetail, useHackerRankHeatmap } from '../hooks/usePlatform'
import { StatNumber } from '../components/StatNumber'
import { DifficultyMeter } from '../components/DifficultyMeter'
import { UniversalHeatmap } from '../components/UniversalHeatmap'
import { ActivityFilterBar } from '../components/ActivityFilterBar'
import { RatingChart } from '../components/RatingChart'
import { LoadingCard } from '../components/LoadingCard'
import { ErrorBadge } from '../components/ErrorBadge'
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

export function HackerRankPage() {
  const { username } = useParams({ from: '/hackerrank/$username' })
  const [heatmapView, setHeatmapView] = useState<'all' | 'last_365' | 'year'>('last_365')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    document.title = `${username} | HackerRank Profile`
  }, [username])

  const { data, isLoading, error } = useHackerRankDetail(username)
  const { data: heatmapData } = useHackerRankHeatmap(username, {
    view: heatmapView,
    year: heatmapView === 'year' ? selectedYear : null,
  })

  const availableHeatmapYears = heatmapData?.availableYears ?? []

  function handleHeatmapViewChange(value: 'all' | 'last_365' | 'year') {
    setHeatmapView(value)
    if (value === 'year' && availableHeatmapYears.length > 0 && !availableHeatmapYears.includes(selectedYear)) {
      setSelectedYear(availableHeatmapYears[0])
    }
  }

  const heatmapPeriodLabel =
    heatmapView === 'year' ? String(selectedYear) : heatmapView === 'all' ? 'all time' : 'the past year'

  if (isLoading) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BackLink />
      <div className="grid gap-4 mt-6">{[1,2,3].map(i => <Card key={i}><CardContent><LoadingCard /></CardContent></Card>)}</div>
    </div>
  )

  if (error || !data) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BackLink />
      <ErrorBadge message={(error as Error)?.message ?? 'Failed to load HackerRank stats'} />
    </div>
  )

  const { contestInfo } = data

  const contestRatingHistory = contestInfo?.contestHistory
    ?.filter(c => c.attended)
    .map((c, i) => ({
      contestId: i,
      contestName: c.contest.title,
      rank: c.ranking,
      newRating: Math.round(c.rating),
      oldRating: i === 0 ? Math.round(c.rating) : Math.round(contestInfo.contestHistory.filter(x => x.attended)[i - 1]?.rating ?? c.rating),
    })) ?? []

  const socialLinks = [
    { label: 'GitHub', url: data.githubUrl },
    { label: 'Twitter', url: data.twitterUrl },
    { label: 'LinkedIn', url: data.linkedinUrl },
    ...(data.profile?.websites ?? []).slice(0, 3).map((url, index) => ({ label: `Site ${index + 1}`, url })),
  ].filter(link => !!link.url)

  const submissionPanels = data.submitStats ? [
    { title: 'Accepted Tracks', rows: data.submitStats.acSubmissionNum },
    { title: 'All Attempts', rows: data.submitStats.totalSubmissionNum },
  ] : []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <BackLink />

      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 pb-4">
        <div className="flex items-center gap-4 flex-1">
          {data.profile?.userAvatar && (
            <Avatar className="size-16 rounded-2xl">
              <AvatarImage src={data.profile.userAvatar} alt={username} className="rounded-2xl" />
              <AvatarFallback className="rounded-2xl">{username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline" className="gap-1.5" style={{ color: 'var(--platform-hackerrank)' }}>
                <PlatformIcon platform="hackerrank" className="size-3" />
                HackerRank
              </Badge>
              {data.profile?.starRating && (
                <Badge variant="outline" className="text-[10px] font-mono">
                  {data.profile.starRating} ★
                </Badge>
              )}
              {data.activeBadge && (
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                  Active: {data.activeBadge.displayName}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">{username}</h1>
            {data.profile?.realName && data.profile.realName !== username && (
              <p className="text-sm text-muted-foreground mt-1">{data.profile.realName}</p>
            )}
          </div>
        </div>
        <div className="flex gap-8">
          <StatNumber value={data.totalSolved} label="Total Solved" size="lg" enabled={!!data} />
          <StatNumber value={data.ranking} label="Global Rank" size="lg" enabled={!!data} />
        </div>
      </div>

      <Separator />

      <Section title="Overview">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <StatNumber value={data.totalSolved} label="Problems Solved" enabled={!!data} />
          <StatNumber value={data.ranking} label="Global Ranking" enabled={!!data} />
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-mono font-medium text-primary">{data.acceptanceRate.toFixed(1)}%</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Acceptance Rate</span>
          </div>
          {contestInfo && (
            <StatNumber value={contestInfo.attendedContestsCount} label="Contests" enabled={!!data} />
          )}
        </div>
        {data.profile && (
          <>
            <Separator />
            <div className="flex flex-wrap gap-4 text-xs font-mono text-muted-foreground">
              {data.profile.countryName && <span>{data.profile.countryName}</span>}
              {data.profile.company && <span>{data.profile.company}</span>}
              {data.profile.school && <span>{data.profile.school}</span>}
              {data.profile.skillTags?.slice(0, 6).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs font-mono">{tag}</Badge>
              ))}
            </div>
          </>
        )}
      </Section>

      {(data.profile || data.contributions || socialLinks.length > 0 || contestInfo) && (
        <Section title="Profile Signal">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[1.5rem] border border-border bg-secondary/35 p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-sm font-mono text-foreground">Presence & reputation</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {data.profile?.birthday ? `Birthday ${formatDisplayDate(data.profile.birthday, { month: 'short', day: 'numeric' })}` : 'Expanded from the live profile endpoint'}
                  </div>
                </div>
                {contestInfo?.badge && (
                  <Badge variant="outline" className="border-primary/30 text-primary">{contestInfo.badge.name}</Badge>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {data.profile?.aboutMe?.trim() || 'No public bio was returned. The backend now exposes richer profile, social, contest, and submission metadata, so this page can surface reputation and activity beyond the basic solve totals.'}
              </p>

              {socialLinks.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {socialLinks.map(link => (
                    <a
                      key={`${link.label}-${link.url}`}
                      href={link.url!}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-[11px] font-mono text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                    >
                      {link.label}
                      <ExternalLink className="size-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Reputation', value: data.reputation },
                { label: 'Points', value: data.contributions?.points ?? 0 },
                { label: 'Top %', value: contestInfo ? `${contestInfo.topPercentage.toFixed(1)}%` : 'n/a' },
                { label: 'Participants', value: contestInfo?.totalParticipants?.toLocaleString() ?? 'n/a' },
              ].map(metric => (
                <div key={metric.label} className="rounded-2xl border border-border bg-secondary/35 p-4">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{metric.label}</div>
                  <div className="mt-2 text-2xl font-mono text-foreground">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      <Section title="Problem Breakdown">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Easy', solved: data.easySolved, total: data.totalEasy, color: '#2db55d' },
            { label: 'Medium', solved: data.mediumSolved, total: data.totalMedium, color: '#ffa116' },
            { label: 'Hard', solved: data.hardSolved, total: data.totalHard, color: '#ef4444' },
          ].map(({ label, solved, total, color }) => (
            <div key={label} className="flex flex-col items-center gap-1 p-4 rounded-xl bg-secondary/50 border border-border">
              <span className="text-3xl font-mono font-bold" style={{ color }}>{solved}</span>
              <Badge variant="outline" className="text-[10px]" style={{ color, borderColor: `color-mix(in srgb, ${color} 30%, transparent)` }}>
                {label}
              </Badge>
              <span className="text-xs text-muted-foreground/60">/ {total}</span>
            </div>
          ))}
        </div>
        <DifficultyMeter
          easySolved={data.easySolved} mediumSolved={data.mediumSolved} hardSolved={data.hardSolved}
          totalEasy={data.totalEasy} totalMedium={data.totalMedium} totalHard={data.totalHard}
        />
      </Section>

      {heatmapData ? (
        <div className="flex flex-col gap-3">
          <ActivityFilterBar
            title="Activity Lens"
            description="The heatmap endpoint now supports archive, trailing-year, and explicit-year windows. Switch windows to replay how your HackerRank practice changed over time."
            options={[...HEATMAP_VIEWS]}
            value={heatmapView}
            onValueChange={value => handleHeatmapViewChange(value as 'all' | 'last_365' | 'year')}
            years={heatmapView === 'year' ? availableHeatmapYears : []}
            selectedYear={heatmapView === 'year' ? selectedYear : null}
            onYearChange={setSelectedYear}
            meta={[
              `${heatmapData.totalSubmissions.toLocaleString()} submissions`,
              `${heatmapData.activeDays} active days`,
              `${heatmapData.longestStreak}d max streak`,
            ]}
          />
          <UniversalHeatmap
            hackerrankHeatmap={heatmapData}
            startDate={heatmapData.startDate || undefined}
            endDate={heatmapData.endDate || undefined}
            periodLabel={heatmapPeriodLabel}
          />
        </div>
      ) : Object.keys(data.submissionCalendar).length > 0 ? (
        <UniversalHeatmap calendar={data.submissionCalendar} />
      ) : null}

      {submissionPanels.length > 0 && (
        <Section title="Submission Pulse">
          <div className="grid gap-4 md:grid-cols-2">
            {submissionPanels.map(panel => (
              <div key={panel.title} className="rounded-[1.5rem] border border-border bg-secondary/35 p-4">
                <div className="text-sm font-mono text-foreground">{panel.title}</div>
                <div className="mt-3 space-y-2">
                  {panel.rows.map(row => (
                    <div key={`${panel.title}-${row.difficulty}`} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/55 px-3 py-2">
                      <div>
                        <div className="text-xs font-mono text-foreground">{row.difficulty}</div>
                        <div className="text-[10px] text-muted-foreground">{row.count} categories</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono text-primary">{row.submissions}</div>
                        <div className="text-[10px] text-muted-foreground">submissions</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {contestRatingHistory.length > 1 && (
        <Section title="Contest Rating History">
          <RatingChart history={contestRatingHistory} height={120} color="var(--platform-hackerrank)" />
        </Section>
      )}

      {contestInfo && contestInfo.contestHistory.length > 0 && (
        <Section title={`Contest History (${contestInfo.attendedContestsCount} attended)`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contest</TableHead>
                <TableHead className="text-right">Rank</TableHead>
                <TableHead className="text-right">Solved</TableHead>
                <TableHead className="text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contestInfo.contestHistory.filter(c => c.attended).slice(-20).reverse().map((c, i) => {
                const history = contestInfo.contestHistory.filter(x => x.attended).slice(-20).reverse()
                const delta = i < history.length - 1
                  ? Math.round(c.rating - (history[i+1]?.rating ?? c.rating))
                  : null
                return (
                  <TableRow key={c.contest.title + c.contest.startTime}>
                    <TableCell className="font-mono max-w-[200px] truncate">{c.contest.title}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{c.ranking.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{c.problemsSolved}/{c.totalProblems}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-foreground">{Math.round(c.rating)}</span>
                      {delta !== null && delta !== 0 && (
                        <span className="ml-1.5" style={{ color: delta > 0 ? '#2db55d' : '#ef4444' }}>
                          {delta > 0 ? '↑' : '↓'}{Math.abs(delta)}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Section>
      )}

      {data.recentSubmissions.length > 0 && (
        <Section title="Recent Submissions">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Challenge</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Language</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentSubmissions.slice(0, 8).map(submission => (
                <TableRow key={`${submission.titleSlug}-${submission.timestamp}`}>
                  <TableCell className="font-mono text-foreground">{submission.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{submission.statusDisplay}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{submission.lang}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">
                    {new Date(submission.timestamp * 1000).toLocaleString('en', {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      )}

      {(data.badges.length > 0 || data.upcomingBadges.length > 0) && (
        <Section title="Badges">
          {data.activeBadge && (
            <div className="rounded-[1.5rem] border border-primary/20 bg-primary/6 p-4">
              <div className="text-[10px] uppercase tracking-widest text-primary/80">Active Badge</div>
              <div className="mt-2 flex items-center gap-3">
                <img src={data.activeBadge.icon} alt={data.activeBadge.displayName} className="size-10 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <div>
                  <div className="text-sm font-mono text-foreground">{data.activeBadge.displayName}</div>
                  <div className="text-xs text-muted-foreground">Highlighted on the current profile</div>
                </div>
              </div>
            </div>
          )}

          {data.badges.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground/60 mb-3 uppercase tracking-wider">Earned</p>
              <div className="flex flex-wrap gap-3">
                {data.badges.map(badge => (
                  <div key={badge.id} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-secondary/50 w-24">
                    <img src={badge.icon} alt={badge.displayName} className="size-10 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <span className="text-[10px] text-center text-muted-foreground leading-tight">{badge.displayName}</span>
                    <span className="text-[9px] text-muted-foreground/60">{formatDisplayDate(badge.creationDate, { month: 'short', year: 'numeric' })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.upcomingBadges.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground/60 mb-3 uppercase tracking-wider">Upcoming</p>
              <div className="flex flex-wrap gap-3">
                {data.upcomingBadges.map(badge => (
                  <div key={badge.name} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-secondary/50 w-24 opacity-50">
                    <img src={badge.icon} alt={badge.name} className="size-10 object-contain grayscale" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <span className="text-[10px] text-center text-muted-foreground leading-tight">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
