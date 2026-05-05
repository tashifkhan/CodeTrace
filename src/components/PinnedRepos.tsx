import { ExternalLink, Star, GitFork } from 'lucide-react'
import type { PinnedRepo } from '../types/api'

interface Props {
  repos: PinnedRepo[]
}

export function PinnedRepos({ repos }: Props) {
  if (!repos.length) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {repos.slice(0, 4).map(repo => (
        <a
          key={repo.name}
          href={repo.url}
          target="_blank"
          rel="noreferrer"
          className="group flex flex-col gap-1.5 p-3 rounded-xl border border-border bg-secondary/50 hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-mono text-foreground group-hover:text-primary transition-colors truncate">
              {repo.name}
            </span>
            <ExternalLink className="size-3 text-muted-foreground flex-shrink-0" />
          </div>
          {repo.description && (
            <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
              {repo.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-auto pt-1">
            {repo.primary_language && (
              <span className="text-[10px] text-muted-foreground/60">{repo.primary_language}</span>
            )}
            <span className="text-[10px] text-muted-foreground/60 ml-auto flex items-center gap-0.5">
              <Star className="size-2.5" /> {repo.stars}
            </span>
            <span className="text-[10px] text-muted-foreground/60 flex items-center gap-0.5">
              <GitFork className="size-2.5" /> {repo.forks}
            </span>
          </div>
        </a>
      ))}
    </div>
  )
}
