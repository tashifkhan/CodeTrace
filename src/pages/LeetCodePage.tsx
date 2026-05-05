import { useEffect } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { fetchLeetCodeDetail, fetchLeetCodeHeatmap } from '../api/leetcode'
import { StatNumber } from '../components/StatNumber'
import { DifficultyMeter } from '../components/DifficultyMeter'
import { UniversalHeatmap } from '../components/UniversalHeatmap'
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

const TREND_ARROW = { UP: '↑', DOWN: '↓', SAME: '→' } as const

export function LeetCodePage() {
  const { username } = useParams({ from: '/leetcode/$username' })

  useEffect(() => {
    document.title = `${username} | LeetCode Profile`
  }, [username])

  const { data, isLoading, error } = useQuery({
    queryKey: ['leetcode-detail', username],
    queryFn: () => fetchLeetCodeDetail(username!),
    enabled: !!username,
  })

  const { data: heatmapData } = useQuery({
    queryKey: ['leetcode-heatmap', username],
    queryFn: () => fetchLeetCodeHeatmap(username!),
    enabled: !!username,
    retry: false,
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
      <ErrorBadge message={(error as Error)?.message ?? 'Failed to load LeetCode stats'} />
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

  // Build heatmap calendar from the heatmap endpoint data if available,
  // otherwise fall back to the submissionCalendar from the base stats endpoint
  const heatmapCalendar = heatmapData
    ? Object.fromEntries(
        heatmapData.dailyContributions
          .filter(d => d.count > 0)
          .map(d => [String(d.timestamp), d.count])
      )
    : data.submissionCalendar

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <BackLink />

      {/* Hero */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 pb-4">
        <div className="flex items-center gap-4 flex-1">
          {data.profile?.userAvatar && (
            <Avatar className="size-16 rounded-2xl">
              <AvatarImage src={data.profile.userAvatar} alt={username} className="rounded-2xl" />
              <AvatarFallback className="rounded-2xl">{username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="gap-1.5" style={{ color: 'var(--platform-leetcode)' }}>
                <PlatformIcon platform="leetcode" className="size-3" />
                LeetCode
              </Badge>
              {contestInfo?.badge && (
                <Badge variant="outline" className="text-[10px] font-mono">
                  {contestInfo.badge.name}
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

      {/* Overview stats */}
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

      {/* Difficulty */}
      <Section title="Problem Breakdown">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Easy',   solved: data.easySolved,   total: data.totalEasy,   color: '#2db55d' },
            { label: 'Medium', solved: data.mediumSolved, total: data.totalMedium, color: '#ffa116' },
            { label: 'Hard',   solved: data.hardSolved,   total: data.totalHard,   color: '#ef4444' },
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

      {/* Submission Heatmap - uses dedicated heatmap endpoint with streak stats */}
      {heatmapData ? (
        <UniversalHeatmap leetcodeHeatmap={heatmapData} />
      ) : Object.keys(heatmapCalendar).length > 0 ? (
        <UniversalHeatmap calendar={heatmapCalendar} />
      ) : null}

      {/* Contest rating chart */}
      {contestRatingHistory.length > 1 && (
        <Section title="Contest Rating History">
          <RatingChart history={contestRatingHistory} height={120} color="var(--platform-leetcode)" />
        </Section>
      )}

      {/* Contest history table */}
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
                const delta = i < contestInfo.contestHistory.filter(x=>x.attended).length - 1
                  ? Math.round(c.rating - (contestInfo.contestHistory.filter(x=>x.attended).slice(-20).reverse()[i+1]?.rating ?? c.rating))
                  : null
                return (
                  <TableRow key={c.contest.title + c.contest.startTime}>
                    <TableCell className="font-mono max-w-[200px] truncate">{c.contest.title}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{c.ranking.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{c.problemsSolved}/{c.totalProblems}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-foreground">{Math.round(c.rating)}</span>
                      {delta !== null && (
                        <span className="ml-1.5" style={{ color: delta >= 0 ? '#2db55d' : '#ef4444' }}>
                          {TREND_ARROW[c.trendDirection]}{Math.abs(delta)}
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

      {/* Badges */}
      {(data.badges.length > 0 || data.upcomingBadges.length > 0) && (
        <Section title="Badges">
          {data.badges.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground/60 mb-3 uppercase tracking-wider">Earned</p>
              <div className="flex flex-wrap gap-3">
                {data.badges.map(badge => (
                  <div key={badge.id} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-secondary/50 w-24">
                    <img src={`https://leetcode.com${badge.icon}`} alt={badge.displayName} className="size-10 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <span className="text-[10px] text-center text-muted-foreground leading-tight">{badge.displayName}</span>
                    <span className="text-[9px] text-muted-foreground/60">{new Date(badge.creationDate).toLocaleDateString('en', { month: 'short', year: 'numeric' })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.upcomingBadges.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] text-muted-foreground/60 mb-3 uppercase tracking-wider">Upcoming</p>
              <div className="flex flex-wrap gap-3">
                {data.upcomingBadges.map(badge => (
                  <div key={badge.name} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-secondary/50 w-24 opacity-50">
                    <img src={`https://leetcode.com${badge.icon}`} alt={badge.name} className="size-10 object-contain grayscale" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
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
