import { cn } from '@/lib/utils'
import { API_LINKS } from '@/lib/apiLinks'

/** Shared terminal footer: a shell-style copyright line with a blinking caret
 *  and the platform API doc links. Used across the app for a common footing. */
export function AppFooter({ className }: { className?: string }) {
  return (
    <footer className={cn('mt-16 border-t border-border pt-6 font-mono text-[10px] text-muted-foreground', className)}>
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-[var(--term-green)]">$</span>
          <span>&copy; {new Date().getFullYear()} CodeTrace.</span>
          <span>all stats compiled dynamically<span className="caret" /></span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {API_LINKS.map((l) => (
            <a
              key={l.name}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-primary"
            >
              {l.name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
