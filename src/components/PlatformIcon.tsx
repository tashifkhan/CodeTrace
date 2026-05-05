import type { Platform } from '@/types/api'
import { SiGithub, SiLeetcode, SiCodeforces, SiGeeksforgeeks, SiCodechef } from '@icons-pack/react-simple-icons'

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
  return null
}
