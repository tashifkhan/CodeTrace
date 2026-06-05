import type { Platform } from '@/types/api'
import { SiGithub, SiLeetcode, SiCodeforces, SiGeeksforgeeks, SiCodechef, SiHackerrank } from '@icons-pack/react-simple-icons'

interface Props {
  platform: Platform
  className?: string
}

export function PlatformIcon({ platform, className = 'size-4' }: Props) {
  if (platform === 'github') return <SiGithub className={className} aria-hidden="true" />
  if (platform === 'leetcode') return <SiLeetcode className={className} aria-hidden="true" />
  if (platform === 'codeforces') return <SiCodeforces className={className} aria-hidden="true" />
  if (platform === 'gfg') return <SiGeeksforgeeks className={className} aria-hidden="true" />
  if (platform === 'codechef') return <SiCodechef className={className} aria-hidden="true" />
  if (platform === 'hackerrank') return <SiHackerrank className={className} aria-hidden="true" />
  if (platform === 'tuf') {
    return (
      <span
        className={className}
        aria-hidden="true"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68em', fontWeight: 800 }}
      >
        T
      </span>
    )
  }
  return null
}
