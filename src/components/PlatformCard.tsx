import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlatformIcon } from './PlatformIcon'
import type { Platform } from '../types/api'

const PLATFORM_META: Record<Platform, { label: string; color: string }> = {
  github:     { label: 'GitHub',        color: 'var(--platform-github)' },
  leetcode:   { label: 'LeetCode',      color: 'var(--platform-leetcode)' },
  codeforces: { label: 'Codeforces',    color: 'var(--platform-codeforces)' },
  gfg:        { label: 'GeeksForGeeks', color: 'var(--platform-gfg)' },
  codechef:   { label: 'CodeChef',      color: 'var(--platform-codechef)' },
}

interface Props {
  platform: Platform
  username: string
  animIndex: number
  children: ReactNode
  detailLink?: string
}

export function PlatformCard({ platform, username, animIndex, children, detailLink }: Props) {
  const { label, color } = PLATFORM_META[platform]

  return (
    <Card
      className="card-slide-up overflow-hidden"
      style={{
        animationDelay: `${animIndex * 80}ms`,
      }}
    >
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Badge
              variant="outline"
              className="gap-1.5"
              style={{ color, borderColor: `color-mix(in srgb, ${color} 30%, transparent)` }}
            >
              <PlatformIcon platform={platform} className="size-3" />
              {label}
            </Badge>
            <span className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">
              {username}
            </span>
          </div>
          {detailLink && (
            <Button variant="ghost" size="xs" asChild>
              <Link to={detailLink}>
                Full details
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 !p-0">
        {children}
      </CardContent>
    </Card>
  )
}
