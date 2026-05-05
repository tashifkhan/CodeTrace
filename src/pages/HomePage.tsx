import { useState, useEffect } from 'react'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Usernames } from '../types/api'
import { SearchBar } from '../components/SearchBar'
import { PlatformCard } from '../components/PlatformCard'
import { GitHubCard } from '../components/GitHubCard'
import { LeetCodeCard } from '../components/LeetCodeCard'
import { CodeforcesCard } from '../components/CodeforcesCard'
import { GFGCard } from '../components/GFGCard'
import { SummaryStrip } from '../components/SummaryStrip'

export function HomePage() {
  const [usernames, setUsernames] = useState<Usernames | null>(null)

  useEffect(() => {
    document.title = 'Coding Profile Stacker'
  }, [])

  return (
    <div className="px-4 py-12 md:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground tracking-tight leading-none mb-4">
            Coding Profile<br />
            <span style={{ WebkitTextStroke: '1px var(--color-primary)', color: 'transparent' }}>
              Stacker
            </span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Aggregate your coding footprint across GitHub, LeetCode, Codeforces, and GeeksForGeeks.
          </p>
        </header>

        {!usernames ? (
          <div className="fade-in">
            <SearchBar onSearch={setUsernames} />
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
                onClick={() => setUsernames(null)}
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
            </div>

            {/* API docs footer */}
            <Separator className="mt-10" />
            <div className="pt-6 flex flex-wrap gap-4 justify-center">
              {[
                { name: 'GitHub API', url: 'https://github-stats.tashif.codes/docs' },
                { name: 'LeetCode API', url: 'https://leetcode-stats.tashif.codes/docs' },
                { name: 'Codeforces API', url: 'https://codeforces-stats.tashif.codes/docs' },
                { name: 'GFG API', url: 'https://gfg-stats.tashif.codes/docs' },
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
