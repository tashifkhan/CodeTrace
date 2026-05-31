import { useEffect, useState } from 'react'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useQueryStates, parseAsString } from 'nuqs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Link } from '@tanstack/react-router'
import type { Usernames } from '../types/api'
import { SearchBar } from '../components/SearchBar'
import { PlatformCard } from '../components/PlatformCard'
import { GitHubCard } from '../components/GitHubCard'
import { LeetCodeCard } from '../components/LeetCodeCard'
import { CodeforcesCard } from '../components/CodeforcesCard'
import { GFGCard } from '../components/GFGCard'
import { CodeChefCard } from '../components/CodeChefCard'
import { HackerRankCard } from '../components/HackerRankCard'
import { SummaryStrip } from '../components/SummaryStrip'

export function HomePage() {
  const [query, setQuery] = useQueryStates({
    github: parseAsString.withDefault(''),
    leetcode: parseAsString.withDefault(''),
    codeforces: parseAsString.withDefault(''),
    gfg: parseAsString.withDefault(''),
    codechef: parseAsString.withDefault(''),
    hackerrank: parseAsString.withDefault(''),
  }, { history: 'replace' })

  const [isSubmitted, setIsSubmitted] = useState(() => {
    return !!(query.github || query.leetcode || query.codeforces || query.gfg || query.codechef || query.hackerrank)
  })

  const usernames: Usernames | null = 
    isSubmitted && (query.github || query.leetcode || query.codeforces || query.gfg || query.codechef || query.hackerrank)
      ? {
          github: query.github,
          leetcode: query.leetcode,
          codeforces: query.codeforces,
          gfg: query.gfg,
          codechef: query.codechef,
          hackerrank: query.hackerrank
        }
      : null

  const handleSearchAgain = () => {
    setIsSubmitted(false)
    setQuery(null)
  }

  useEffect(() => {
    document.title = 'CodeTrace'
  }, [])

  return (
    <div className="px-4 py-12 md:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <header className="mb-12 text-center relative">
          <div className="flex justify-center mb-6">
            <Link
              to="/market"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-mono text-primary transition-colors hover:bg-primary/10"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Discover CodeTrace Marketing &rarr;
            </Link>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground tracking-tight leading-none mb-4">
            Code<span style={{ WebkitTextStroke: '1px var(--color-primary)', color: 'transparent' }}>Trace</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Aggregate your coding footprint across GitHub, LeetCode, Codeforces, GFG, CodeChef, and HackerRank.
          </p>
        </header>

        {!usernames ? (
          <div className="fade-in">
            <SearchBar onSubmit={() => setIsSubmitted(true)} />
            <p className="text-center text-[10px] font-mono text-muted-foreground/50 mt-4">
              Leave any field empty to skip that platform.
            </p>
          </div>
        ) : (
          <div className="fade-in">
            {/* Back + active usernames */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearchAgain}
                className="font-mono text-xs text-muted-foreground hover:text-primary"
              >
                <ArrowLeft data-icon="inline-start" />
                Search again
              </Button>
              <div className="flex gap-2 flex-wrap justify-end">
                {(Object.entries(usernames) as [keyof Usernames, string][])
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <Badge key={k} variant="outline" className="text-[10px] font-mono">{v}</Badge>
                  ))}
              </div>
            </div>

            <SummaryStrip usernames={usernames} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usernames.github && (
                <PlatformCard platform="github" username={usernames.github} animIndex={0}
                  detailLink={`/github/${usernames.github}`}>
                  <GitHubCard username={usernames.github} />
                </PlatformCard>
              )}
              {usernames.leetcode && (
                <PlatformCard platform="leetcode" username={usernames.leetcode} animIndex={1}
                  detailLink={`/leetcode/${usernames.leetcode}`}>
                  <LeetCodeCard username={usernames.leetcode} />
                </PlatformCard>
              )}
              {usernames.codeforces && (
                <PlatformCard platform="codeforces" username={usernames.codeforces} animIndex={2}
                  detailLink={`/codeforces/${usernames.codeforces}`}>
                  <CodeforcesCard username={usernames.codeforces} />
                </PlatformCard>
              )}
              {usernames.gfg && (
                <PlatformCard platform="gfg" username={usernames.gfg} animIndex={3}
                  detailLink={`/gfg/${usernames.gfg}`}>
                  <GFGCard username={usernames.gfg} />
                </PlatformCard>
              )}
              {usernames.codechef && (
                <PlatformCard platform="codechef" username={usernames.codechef} animIndex={4}
                  detailLink={`/codechef/${usernames.codechef}`}>
                  <CodeChefCard username={usernames.codechef} />
                </PlatformCard>
              )}
              {usernames.hackerrank && (
                <PlatformCard platform="hackerrank" username={usernames.hackerrank} animIndex={5}
                  detailLink={`/hackerrank/${usernames.hackerrank}`}>
                  <HackerRankCard username={usernames.hackerrank} />
                </PlatformCard>
              )}
            </div>

            {/* API docs footer */}
            <Separator className="mt-10" />
            <div className="pt-6 flex flex-wrap gap-4 justify-center">
              {[
                { name: 'GitHub API', url: 'https://github-stats.tashif.codes/docs' },
                { name: 'LeetCode API', url: 'https://leetcode-stats.tashif.codes/' },
                { name: 'Codeforces API', url: 'https://codeforces-stats.tashif.codes/docs' },
                { name: 'GFG API', url: 'https://gfg-stats.tashif.codes/docs' },
                { name: 'CodeChef API', url: 'https://codechef-stats-api-two.vercel.app/' },
                { name: 'HackerRank API', url: 'https://hackerrank-stats-api.vercel.app/docs' },
              ].map(api => (
                <Button key={api.name} variant="link" size="xs" asChild className="text-muted-foreground/50 hover:text-primary">
                  <a href={api.url} target="_blank" rel="noreferrer">
                    {api.name}
                    <ExternalLink data-icon="inline-end" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
