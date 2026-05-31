import { useMemo } from 'react'
import { useQueryStates, parseAsString } from 'nuqs'
import { ActivityCalendar, type Activity } from 'react-activity-calendar'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import {
  ArrowLeft, Trophy, Flame, Code2, Star, TrendingUp, CalendarDays,
  GitPullRequest, GitBranch, MessageSquare, AlertCircle, ExternalLink,
  Award, Zap, Activity as ActivityIcon,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'

import type { Platform } from '@/types/api'
import type { UnifiedCard, PlatformCategory } from '@/types/unified'
import { useProfileCards } from '@/hooks/useCards'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PlatformIcon } from '@/components/PlatformIcon'

const PLATFORM_COLORS: Record<string, string> = {
  github: 'var(--platform-github)',
  leetcode: 'var(--platform-leetcode)',
  codeforces: 'var(--platform-codeforces)',
  gfg: 'var(--platform-gfg)',
  codechef: 'var(--platform-codechef)',
  hackerrank: 'var(--platform-hackerrank)',
}

const PLATFORM_LABELS: Record<string, string> = {
  github: 'GitHub',
  leetcode: 'LeetCode',
  codeforces: 'Codeforces',
  gfg: 'GeeksForGeeks',
  codechef: 'CodeChef',
  hackerrank: 'HackerRank',
}

// Typed link component for platform detail pages — TanStack Router requires
// parameterized routes to be called with explicit `to` + `params`.
function PlatformLink({ platform, username, children, className }: {
  platform: string
  username: string
  children: React.ReactNode
  className?: string
}) {
  const u = username
  switch (platform) {
    case 'github':     return <Link to="/github/$username"     params={{ username: u }} className={className}>{children}</Link>
    case 'leetcode':   return <Link to="/leetcode/$username"   params={{ username: u }} className={className}>{children}</Link>
    case 'codeforces': return <Link to="/codeforces/$username" params={{ username: u }} className={className}>{children}</Link>
    case 'gfg':        return <Link to="/gfg/$username"        params={{ username: u }} className={className}>{children}</Link>
    case 'codechef':   return <Link to="/codechef/$username"   params={{ username: u }} className={className}>{children}</Link>
    case 'hackerrank': return <Link to="/hackerrank/$username" params={{ username: u }} className={className}>{children}</Link>
    default:           return <>{children}</>
  }
}

const CATEGORY_LABELS: Record<PlatformCategory, string> = {
  dsa: 'DSA',
  competitive: 'Competitive',
  fundamentals: 'Fundamentals',
  development: 'Development',
}

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0)

// ── Mini stat card ───────────────────────────────────────────────
function MiniStat({
  icon, label, value, sub, color, loading,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color?: string
  loading?: boolean
}) {
  return (
    <Card className="card-slide-up">
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className="flex items-center justify-center rounded-lg size-10 shrink-0"
          style={{ background: color ? `color-mix(in srgb, ${color} 15%, transparent)` : undefined }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          {loading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <span className="text-2xl font-mono font-bold text-foreground">{value}</span>
          )}
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">{label}</p>
          {sub && <p className="text-[10px] text-muted-foreground/60 font-mono">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Platform streak row ──────────────────────────────────────────
function StreakRow({ c }: { c: UnifiedCard }) {
  const current = c.heatmap.currentStreak
  const longest = c.heatmap.longestStreak
  const activeDays = c.heatmap.totalActiveDays
  const color = PLATFORM_COLORS[c.platform]
  if (!current && !longest && !activeDays) return null
  return (
    <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground mt-1">
      {current > 0 && (
        <span className="flex items-center gap-1">
          <Flame className="size-3" style={{ color }} />
          <span style={{ color }}>{current}d</span>
          <span className="opacity-50">current</span>
        </span>
      )}
      {longest > 0 && (
        <span className="flex items-center gap-1 opacity-70">
          <Zap className="size-3" />
          {longest}d best
        </span>
      )}
      {activeDays > 0 && (
        <span className="opacity-50">{activeDays} active</span>
      )}
    </div>
  )
}

// ── Badges section for a single platform ────────────────────────
function PlatformBadgeSection({ c }: { c: UnifiedCard }) {
  const badges = c.badges
  if (!badges || (!badges.count && !badges.list?.length)) return null
  const color = PLATFORM_COLORS[c.platform]
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center rounded size-5"
          style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}
        >
          <PlatformIcon platform={c.platform} className="size-3" />
        </div>
        <span className="text-xs font-medium">{PLATFORM_LABELS[c.platform]}</span>
        <span
          className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
          style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
        >
          {badges.count}
        </span>
      </div>
      {badges.active && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground pl-7">
          {badges.active.icon ? (
            <img src={badges.active.icon} alt="" className="size-5 rounded object-contain" />
          ) : (
            <Award className="size-4" style={{ color }} />
          )}
          <span className="font-medium text-foreground">{badges.active.name ?? 'Active Badge'}</span>
          {badges.active.level && (
            <span className="opacity-60 text-[10px]">{badges.active.level}</span>
          )}
        </div>
      )}
      {badges.list.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-7">
          {badges.list.slice(0, 8).map((b, i) => (
            <div
              key={b.id ?? i}
              className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-md border border-border/40 bg-secondary/40"
              title={b.name ?? undefined}
            >
              {b.icon ? (
                <img src={b.icon} alt="" className="size-3.5 object-contain" />
              ) : (
                <Award className="size-3" />
              )}
              <span className="max-w-[80px] truncate">{b.name}</span>
            </div>
          ))}
          {badges.list.length > 8 && (
            <span className="text-[10px] text-muted-foreground px-2 py-1">
              +{badges.list.length - 8} more
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function ProfilePage() {
  const [query] = useQueryStates({
    github: parseAsString.withDefault(''),
    leetcode: parseAsString.withDefault(''),
    codeforces: parseAsString.withDefault(''),
    gfg: parseAsString.withDefault(''),
    codechef: parseAsString.withDefault(''),
    hackerrank: parseAsString.withDefault(''),
  })

  const { cards, loaded, isLoading, activeCount } = useProfileCards(query)

  const activeBadges = useMemo(
    () => cards.map((c) => [c.platform, c.username] as [Platform, string]),
    [cards],
  )

  // ── Overview totals ──────────────────────────────────────────
  const totalSolved = sum(loaded.map((c) => c.stats.totalSolved))
  const totalActiveDays = sum(loaded.map((c) => c.heatmap.totalActiveDays))
  const totalContests = sum(loaded.map((c) => c.contests.count))
  const bestStreak = Math.max(0, ...loaded.map((c) => c.heatmap.longestStreak))
  const currentStreak = Math.max(0, ...loaded.map((c) => c.heatmap.currentStreak))
  const totalBadges = sum(loaded.map((c) => c.badges.count))

  // ── Category buckets ─────────────────────────────────────────
  const byCategory = useMemo(() => {
    const groups: Record<PlatformCategory, number> = {
      dsa: 0, competitive: 0, fundamentals: 0, development: 0,
    }
    loaded.forEach((c) => { groups[c.category] += c.stats.totalSolved })
    return groups
  }, [loaded])

  // ── DSA difficulty ───────────────────────────────────────────
  const difficulty = useMemo(() => {
    const acc = { easy: 0, medium: 0, hard: 0 }
    loaded.forEach((c) => {
      acc.easy += c.stats.byDifficulty.easy ?? 0
      acc.medium += c.stats.byDifficulty.medium ?? 0
      acc.hard += c.stats.byDifficulty.hard ?? 0
    })
    return acc
  }, [loaded])
  const difficultyTotal = difficulty.easy + difficulty.medium + difficulty.hard

  // ── Topics merged ────────────────────────────────────────────
  const topics = useMemo(() => {
    const map = new Map<string, number>()
    loaded.forEach((c) =>
      c.stats.topicAnalysis.forEach((t) => map.set(t.topic, (map.get(t.topic) ?? 0) + t.count)),
    )
    return [...map.entries()]
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [loaded])
  const topicMax = Math.max(1, ...topics.map((t) => t.count))

  // ── Contest ranks ────────────────────────────────────────────
  const contestRanks = useMemo(
    () => loaded.filter((c) => c.contests.rating != null || c.contests.rank),
    [loaded],
  )

  // ── Rating histories (platforms with history data) ───────────
  const ratingHistories = useMemo(() => {
    return loaded
      .filter((c) => c.rating.history && c.rating.history.length > 0)
      .map((c) => ({
        platform: c.platform,
        current: c.rating.current ?? c.contests.rating,
        max: c.rating.max ?? c.contests.maxRating,
        rank: c.contests.rank,
        color: PLATFORM_COLORS[c.platform],
        points: c.rating.history
          .filter((p) => p.rating != null)
          .map((p, i) => ({
            i,
            rating: p.rating!,
            name: p.contestName ?? `Contest ${i + 1}`,
          })),
      }))
      .filter((h) => h.points.length > 1)
  }, [loaded])

  // ── Platform engagement radar ────────────────────────────────
  const radarData = useMemo(() => {
    const entries = loaded.map((c) => {
      const raw =
        c.category === 'competitive'
          ? (c.contests.rating ?? c.contests.maxRating ?? 0)
          : c.stats.totalSolved
      return { platform: PLATFORM_LABELS[c.platform], raw, category: c.category }
    })
    if (!entries.length) return []
    const maxVal = Math.max(...entries.map((e) => e.raw), 1)
    return entries.map((e) => ({
      subject: e.platform,
      value: Math.round((e.raw / maxVal) * 100),
      raw: e.raw,
      label: e.category === 'competitive' ? 'Rating' : e.category === 'development' ? 'Commits' : 'Solved',
    }))
  }, [loaded])

  // ── Unified heatmap ──────────────────────────────────────────
  const unifiedHeatmap = useMemo(() => {
    const dateMap = new Map<string, number>()
    loaded.forEach((c) =>
      c.heatmap.dailyContributions.forEach((d) =>
        dateMap.set(d.date, (dateMap.get(d.date) ?? 0) + d.count),
      ),
    )
    const now = new Date()
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(now.getFullYear() - 1)

    const activities: Activity[] = []
    const cursor = new Date(oneYearAgo)
    while (cursor <= now) {
      const dateStr = cursor.toISOString().split('T')[0]
      const count = dateMap.get(dateStr) ?? 0
      let level = 0
      if (count >= 1) level = 1
      if (count >= 3) level = 2
      if (count >= 6) level = 3
      if (count >= 10) level = 4
      activities.push({ date: dateStr, count, level })
      cursor.setDate(cursor.getDate() + 1)
    }
    return activities
  }, [loaded])

  // ── Badges across platforms ──────────────────────────────────
  const badgePlatforms = useMemo(
    () => loaded.filter((c) => c.badges.count > 0 || c.badges.list?.length > 0),
    [loaded],
  )

  // ── GitHub dev data ──────────────────────────────────────────
  const githubCard = useMemo(
    () => loaded.find((c) => c.platform === 'github'),
    [loaded],
  )
  const devStats = useMemo(() => {
    if (!githubCard) return null
    const bd = githubCard.stats.byDifficulty ?? {}
    return {
      commits: bd.commits ?? githubCard.stats.totalSolved,
      prs: bd.prs ?? 0,
      issues: bd.issues ?? 0,
      reviews: bd.reviews ?? 0,
      languages: githubCard.stats.topicAnalysis,
    }
  }, [githubCard])

  // ── Profile source ───────────────────────────────────────────
  const profileSource = useMemo(
    () => loaded.find((c) => c.profile.avatar || c.profile.displayName),
    [loaded],
  )
  const profileAvatar = profileSource?.profile.avatar ?? ''
  const profileName =
    loaded.find((c) => c.profile.displayName)?.profile.displayName ||
    activeBadges[0]?.[1] || 'Coder'
  const institution = loaded.find((c) => c.profile.institution)?.profile.institution ?? null

  if (activeCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 fade-in">
        <h2 className="text-2xl font-bold">No Profiles Selected</h2>
        <p className="text-muted-foreground text-sm">Go back to the home page and enter some usernames.</p>
        <Button asChild>
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="px-4 py-10 md:px-8 fade-in">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="font-mono text-xs text-muted-foreground hover:text-primary">
            <Link to="/">
              <ArrowLeft className="size-4 mr-1.5" />
              Search again
            </Link>
          </Button>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground tracking-tight">
            Profile{' '}
            <span style={{ WebkitTextStroke: '1px var(--color-primary)', color: 'transparent' }}>
              Overview
            </span>
          </h1>
        </div>

        {/* ── Profile card ──────────────────────────────────── */}
        <Card className="card-slide-up">
          <CardContent className="flex flex-col md:flex-row items-center gap-6 py-6">
            <Avatar className="size-20 border-2 border-primary/30 glow-ring">
              <AvatarImage src={profileAvatar} />
              <AvatarFallback className="text-2xl font-bold font-mono">
                {profileName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left space-y-2">
              {isLoading ? (
                <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
              ) : (
                <h2 className="text-2xl font-display font-bold">{profileName}</h2>
              )}
              {institution && <p className="text-xs text-muted-foreground">{institution}</p>}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {activeBadges.map(([platform, username]) => (
                  <PlatformLink key={platform} platform={platform} username={username}>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        color: PLATFORM_COLORS[platform],
                        borderColor: `color-mix(in srgb, ${PLATFORM_COLORS[platform]} 30%, transparent)`,
                      }}
                    >
                      <PlatformIcon platform={platform} className="size-3" />
                      {username}
                    </Badge>
                  </PlatformLink>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Overview stat cards ───────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStat
            icon={<Code2 className="size-5 text-primary" />}
            label="Total Questions"
            value={totalSolved}
            loading={isLoading}
            color="var(--color-primary)"
          />
          <MiniStat
            icon={<CalendarDays className="size-5" style={{ color: 'var(--platform-leetcode)' }} />}
            label="Total Active Days"
            value={totalActiveDays}
            loading={isLoading}
            color="var(--platform-leetcode)"
          />
          <MiniStat
            icon={<Trophy className="size-5" style={{ color: 'var(--platform-codeforces)' }} />}
            label="Total Contests"
            value={totalContests}
            loading={isLoading}
            color="var(--platform-codeforces)"
          />
          <MiniStat
            icon={<Flame className="size-5" style={{ color: 'var(--platform-codechef)' }} />}
            label="Best Streak"
            value={bestStreak}
            sub={`Current: ${currentStreak}d · ${totalBadges} awards`}
            loading={isLoading}
            color="var(--platform-codechef)"
          />
        </div>

        {/* ── Problems Solved by category ───────────────────── */}
        <Card className="card-slide-up" style={{ animationDelay: '40ms' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Code2 className="size-4 text-primary" /> Problems Solved
            </CardTitle>
            <CardDescription>Grouped by platform category, plus DSA difficulty split</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(CATEGORY_LABELS) as PlatformCategory[])
                .filter((cat) => byCategory[cat] > 0)
                .map((cat) => (
                  <div key={cat} className="rounded-lg border border-border/60 px-4 py-3">
                    <p className="text-2xl font-mono font-bold text-foreground">{byCategory[cat]}</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {CATEGORY_LABELS[cat]}
                    </p>
                  </div>
                ))}
            </div>
            {difficultyTotal > 0 ? (
              <div className="space-y-3 self-center">
                {([
                  ['Easy', difficulty.easy, '#22c55e'],
                  ['Medium', difficulty.medium, '#eab308'],
                  ['Hard', difficulty.hard, '#ef4444'],
                ] as const).map(([label, val, color]) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span style={{ color }}>{label}</span>
                      <span className="text-muted-foreground">{val}</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(val / difficultyTotal) * 100}%`, background: color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground self-center">
                No difficulty breakdown available.
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Platform Engagement + Topic Analysis ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Platform Engagement */}
          <Card className="card-slide-up" style={{ animationDelay: '80ms' }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                Platform Engagement
              </CardTitle>
              <CardDescription>Normalized activity comparison (0–100 scale)</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="size-[280px] rounded-full mx-auto" />
              ) : radarData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet.</p>
              ) : radarData.length >= 3 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                      tickCount={5}
                    />
                    <Radar
                      name="Activity"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload?.length) return null
                        const d = payload[0].payload
                        return (
                          <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
                            <p className="font-medium">{d.subject}</p>
                            <p className="text-muted-foreground">{d.label}: <span className="text-primary font-mono">{d.raw}</span></p>
                          </div>
                        )
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                /* Bar fallback for 1-2 platforms */
                <div className="space-y-4 py-4">
                  {radarData.map((d) => (
                    <div key={d.subject} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-muted-foreground">{d.subject}</span>
                        <span className="text-primary">{d.value}/100</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${d.value}%`,
                            background: 'hsl(var(--primary))',
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 font-mono">{d.label}: {d.raw}</p>
                    </div>
                  ))}
                  <p className="text-[11px] text-muted-foreground/50 text-center pt-2">
                    Add 3+ platforms to see radar chart
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Topic Analysis */}
          <Card className="card-slide-up" style={{ animationDelay: '160ms' }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="size-4 text-primary" />
                Topic Analysis
              </CardTitle>
              <CardDescription>Problems solved per topic, merged across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
                </div>
              ) : topics.length === 0 ? (
                <p className="text-sm text-muted-foreground">No topic data available.</p>
              ) : (
                <div className="space-y-2.5">
                  {topics.map((t) => (
                    <div key={t.topic} className="flex items-center gap-3">
                      <span className="text-xs w-36 truncate text-muted-foreground" title={t.topic}>{t.topic}</span>
                      <div className="flex-1 h-4 bg-secondary rounded-sm overflow-hidden">
                        <div
                          className="h-full rounded-sm transition-all duration-700 flex items-center justify-end pr-1.5"
                          style={{ width: `${(t.count / topicMax) * 100}%`, background: 'var(--color-primary)' }}
                        >
                          <span className="text-[9px] font-mono text-primary-foreground">{t.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Contest Rankings ──────────────────────────────── */}
        {contestRanks.length > 0 && (
          <Card className="card-slide-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="size-4 text-primary" /> Contest Rankings
              </CardTitle>
              <CardDescription>Current rating and rank per platform</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {contestRanks.map((c) => (
                <PlatformLink key={c.platform} platform={c.platform} username={c.username}>
                  <div className="text-center space-y-1 rounded-lg border border-border/60 py-4 hover:border-primary/40 hover:bg-secondary/30 transition-colors cursor-pointer">
                    <PlatformIcon platform={c.platform} className="size-5 mx-auto mb-1" />
                    <p className="text-2xl font-mono font-bold" style={{ color: PLATFORM_COLORS[c.platform] }}>
                      {c.contests.rating != null ? Math.round(c.contests.rating) : '–'}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {PLATFORM_LABELS[c.platform]}
                    </p>
                    {c.contests.rank && (
                      <Badge variant="outline" className="text-[10px] mt-1">{c.contests.rank}</Badge>
                    )}
                    {c.contests.maxRating != null && (
                      <p className="text-[10px] text-muted-foreground/60 font-mono">max {Math.round(c.contests.maxRating)}</p>
                    )}
                    {c.contests.globalRanking != null && (
                      <p className="text-[10px] text-muted-foreground/50 font-mono">#{c.contests.globalRanking.toLocaleString()}</p>
                    )}
                  </div>
                </PlatformLink>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ── Rating History charts ─────────────────────────── */}
        {ratingHistories.length > 0 && (
          <Card className="card-slide-up" style={{ animationDelay: '220ms' }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" /> Rating History
              </CardTitle>
              <CardDescription>Contest rating progression per platform</CardDescription>
            </CardHeader>
            <CardContent className={`grid grid-cols-1 gap-6 ${ratingHistories.length > 1 ? 'md:grid-cols-2' : ''}`}>
              {ratingHistories.map((h) => (
                <div key={h.platform} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={h.platform} className="size-4" />
                      <span className="text-sm font-medium">{PLATFORM_LABELS[h.platform]}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      {h.current != null && (
                        <span style={{ color: h.color }}>
                          {Math.round(h.current)} current
                        </span>
                      )}
                      {h.max != null && h.max !== h.current && (
                        <span className="text-muted-foreground/60">
                          {Math.round(h.max)} max
                        </span>
                      )}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={h.points} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                      <XAxis dataKey="i" hide />
                      <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                        width={40}
                      />
                      <Tooltip
                        content={({ payload }) => {
                          if (!payload?.length) return null
                          const d = payload[0].payload
                          return (
                            <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
                              <p className="text-muted-foreground truncate max-w-[180px]">{d.name}</p>
                              <p style={{ color: h.color }} className="font-mono font-bold">{d.rating}</p>
                            </div>
                          )
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="rating"
                        stroke={h.color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: h.color }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ── Platform Breakdown (with streaks + navigate) ──── */}
        <Card className="card-slide-up" style={{ animationDelay: '240ms' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ActivityIcon className="size-4 text-primary" /> Platform Breakdown
            </CardTitle>
            <CardDescription>Per-platform performance metrics — click to view details</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {loaded.map((c, i) => {
                  const isDev = c.category === 'development'
                  const metric = isDev ? 'Commits' : c.category === 'competitive' ? 'Rating' : 'Solved'
                  const value = c.category === 'competitive'
                    ? (c.contests.rating != null ? Math.round(c.contests.rating) : c.stats.totalSolved)
                    : c.stats.totalSolved
                  const sub = c.contests.rank
                    ? `${c.contests.rank}${c.contests.rating != null ? ` · ${Math.round(c.contests.rating)}` : ''}`
                    : c.category === 'dsa'
                      ? `E:${c.stats.byDifficulty.easy ?? 0} M:${c.stats.byDifficulty.medium ?? 0} H:${c.stats.byDifficulty.hard ?? 0}`
                      : `${c.heatmap.totalActiveDays} active days`

                  return (
                    <div key={c.platform}>
                      <PlatformLink platform={c.platform} username={c.username}>
                        <div className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className="flex items-center justify-center rounded-md size-8 shrink-0"
                              style={{ background: `color-mix(in srgb, ${PLATFORM_COLORS[c.platform]} 15%, transparent)` }}
                            >
                              <PlatformIcon platform={c.platform} className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium">{PLATFORM_LABELS[c.platform]}</p>
                                <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-[10px] text-muted-foreground font-mono">{sub}</p>
                              <StreakRow c={c} />
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-lg font-mono font-bold" style={{ color: PLATFORM_COLORS[c.platform] }}>
                              {value}
                            </span>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{metric}</p>
                          </div>
                        </div>
                      </PlatformLink>
                      {i < loaded.length - 1 && <Separator className="opacity-30" />}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── GitHub Development Section ─────────────────────── */}
        {devStats && (
          <Card className="card-slide-up" style={{ animationDelay: '260ms' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GitBranch className="size-4 text-primary" /> Development Activity
                  </CardTitle>
                  <CardDescription>GitHub open-source contributions</CardDescription>
                </div>
                <PlatformLink platform="github" username={githubCard!.username}>
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <ExternalLink className="size-3" />
                    GitHub
                  </Button>
                </PlatformLink>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dev stat counters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: <GitBranch className="size-4" />, label: 'Commits', value: devStats.commits },
                  { icon: <GitPullRequest className="size-4" />, label: 'Pull Requests', value: devStats.prs },
                  { icon: <AlertCircle className="size-4" />, label: 'Issues Raised', value: devStats.issues },
                  { icon: <MessageSquare className="size-4" />, label: 'Code Reviews', value: devStats.reviews },
                ].map(({ icon, label, value }) => (
                  value > 0 ? (
                    <div
                      key={label}
                      className="rounded-lg border border-border/60 px-4 py-3 flex items-center gap-3"
                    >
                      <div
                        className="flex items-center justify-center rounded-md size-8 shrink-0 text-[var(--platform-github)]"
                        style={{ background: `color-mix(in srgb, var(--platform-github) 12%, transparent)` }}
                      >
                        {icon}
                      </div>
                      <div>
                        <p className="text-xl font-mono font-bold">{value.toLocaleString()}</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
                      </div>
                    </div>
                  ) : null
                ))}
              </div>

              {/* Languages */}
              {devStats.languages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Languages</p>
                  <div className="space-y-2.5">
                    {devStats.languages.map((lang) => (
                      <div key={lang.topic} className="flex items-center gap-3">
                        <span className="text-xs w-28 truncate text-muted-foreground">{lang.topic}</span>
                        <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden relative">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${lang.count}%`,
                              background: `color-mix(in srgb, var(--platform-github) 80%, transparent)`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground w-10 text-right">{lang.count}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Badges ────────────────────────────────────────── */}
        {badgePlatforms.length > 0 && (
          <Card className="card-slide-up" style={{ animationDelay: '280ms' }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="size-4 text-primary" /> Awards & Badges
              </CardTitle>
              <CardDescription>{totalBadges} total across {badgePlatforms.length} platform{badgePlatforms.length !== 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="space-y-5">
                  {badgePlatforms.map((c) => (
                    <PlatformBadgeSection key={c.platform} c={c} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Unified Heatmap ───────────────────────────────── */}
        <Card className="card-slide-up" style={{ animationDelay: '320ms' }}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-lg">Unified Contribution Activity</CardTitle>
                <CardDescription>
                  Combined across {activeBadges.map(([p]) => PLATFORM_LABELS[p]).join(', ')}
                </CardDescription>
              </div>
              {/* Per-platform streak pills */}
              <div className="flex flex-wrap gap-2">
                {loaded.filter((c) => c.heatmap.currentStreak > 0 || c.heatmap.longestStreak > 0).map((c) => (
                  <div
                    key={c.platform}
                    className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-full border border-border/40"
                    style={{ color: PLATFORM_COLORS[c.platform] }}
                  >
                    <PlatformIcon platform={c.platform} className="size-3" />
                    <Flame className="size-3" />
                    <span>{c.heatmap.currentStreak}d</span>
                    <span className="text-muted-foreground/50">/ {c.heatmap.longestStreak}d max</span>
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto pb-2 -mx-2 px-2">
              {isLoading ? (
                <Skeleton className="w-full h-32" />
              ) : (
                <ActivityCalendar
                  data={unifiedHeatmap}
                  theme={{ dark: ['hsl(var(--secondary))', 'hsl(var(--primary))'] }}
                  colorScheme="dark"
                  blockSize={13}
                  blockMargin={4}
                  fontSize={12}
                  labels={{ totalCount: '{{count}} total contributions across all platforms' }}
                />
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
