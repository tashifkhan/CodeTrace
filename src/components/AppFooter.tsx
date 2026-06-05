const API_LINKS = [
  { name: 'GitHub API Docs', url: 'https://github-stats.tashif.codes/docs' },
  { name: 'LeetCode API Docs', url: 'https://leetcode-stats.tashif.codes/' },
  { name: 'CF API Docs', url: 'https://codeforces-stats.tashif.codes/docs' },
  { name: 'GFG API Docs', url: 'https://gfg-stats.tashif.codes/docs' },
  { name: 'CodeChef API Docs', url: 'https://codechef-stats-api-two.vercel.app/docs' },
  { name: 'HackerRank API Docs', url: 'https://hackerrank-stats-api.vercel.app/docs' },
  { name: 'TUF API Docs', url: 'http://localhost:8007/docs' },
]

/** Shared terminal footer: a shell-style copyright line with a blinking caret
 *  and the platform API doc links. Used across the app for a common footing. */
export function AppFooter() {
  return (
    <footer className="mt-16 border-t border-border pt-6 font-mono text-[10px] text-muted-foreground">
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
