import { useQuery } from '@tanstack/react-query'
import { fetchGitHubStats } from '../api/github'
import { fetchLeetCodeStats } from '../api/leetcode'
import { fetchCodeforcesStats } from '../api/codeforces'
import { StatNumber } from './StatNumber'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Usernames } from '../types/api'

interface Props {
  usernames: Usernames
}

export function SummaryStrip({ usernames }: Props) {
  const gh = useQuery({ queryKey: ['github', usernames.github], queryFn: () => fetchGitHubStats(usernames.github), enabled: !!usernames.github })
  const lc = useQuery({ queryKey: ['leetcode', usernames.leetcode], queryFn: () => fetchLeetCodeStats(usernames.leetcode), enabled: !!usernames.leetcode })
  const cf = useQuery({ queryKey: ['codeforces', usernames.codeforces], queryFn: () => fetchCodeforcesStats(usernames.codeforces), enabled: !!usernames.codeforces })

  const commits = gh.data?.stats.totalCommits ?? 0
  const solved = lc.data?.totalSolved ?? 0
  const rating = cf.data?.rating ?? 0

  const stats = [
    { value: commits, label: 'GitHub Commits', enabled: !!gh.data },
    { value: solved,  label: 'LeetCode Solved', enabled: !!lc.data },
    { value: rating,  label: 'CF Rating',       enabled: !!cf.data },
  ]

  return (
    <Card className="fade-in flex flex-row items-stretch overflow-hidden mb-4 !py-0">
      {stats.map((s, i) => (
        <div key={s.label} className="flex items-center flex-1">
          <div className="flex-1 flex flex-col items-center justify-center gap-1 py-4 px-6">
            <StatNumber value={s.value} label={s.label} size="lg" enabled={s.enabled} />
          </div>
          {i < stats.length - 1 && <Separator orientation="vertical" className="h-auto self-stretch" />}
        </div>
      ))}
    </Card>
  )
}
