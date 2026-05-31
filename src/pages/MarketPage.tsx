import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Copy, Check, ArrowRight, Activity
} from 'lucide-react'
import {
  SiGithub, SiLeetcode, SiCodeforces, SiGeeksforgeeks, SiCodechef, SiHackerrank
} from '@icons-pack/react-simple-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type TabType = 'npx' | 'curl' | 'api.json'

export function MarketPage() {
  const [activeTab, setActiveTab] = useState<TabType>('npx')
  const [githubUser, setGithubUser] = useState('alex_dev')
  const [leetcodeUser, setLeetcodeUser] = useState('alex_dev')
  const [codeforcesUser, setCodeforcesUser] = useState('alex_cf')
  
  const [copied, setCopied] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState('')

  useEffect(() => {
    document.title = 'CodeTrace | Your Unified Developer Footprint'
  }, [])

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://codetrace.dev'
    const params = new URLSearchParams()
    if (githubUser) params.set('github', githubUser)
    if (leetcodeUser) params.set('leetcode', leetcodeUser)
    if (codeforcesUser) params.set('codeforces', codeforcesUser)
    
    setGeneratedUrl(`${origin}/profile?${params.toString()}`)
  }, [githubUser, leetcodeUser, codeforcesUser])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Simulated heatmap cells data
  const heatmapCells = Array.from({ length: 98 }, (_) => {
    // Distribute github (green), leetcode (orange/yellow), empty, and codechef (brown/beige) cells
    const rand = Math.random()
    if (rand < 0.25) return { type: 'github', intensity: Math.floor(Math.random() * 4) + 1 }
    if (rand < 0.45) return { type: 'leetcode', intensity: Math.floor(Math.random() * 4) + 1 }
    if (rand < 0.55) return { type: 'codechef', intensity: Math.floor(Math.random() * 4) + 1 }
    return { type: 'empty', intensity: 0 }
  })

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-background font-sans antialiased overflow-x-hidden">
      
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20" />

      {/* Navbar / Top Bar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-mono text-primary font-bold text-sm select-none">&gt;_</span>
            <span className="font-display font-bold text-xl tracking-tight">
              Code<span className="text-primary transition-all group-hover:text-primary-foreground group-hover:bg-primary px-0.5 rounded">Trace</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-xs border-primary/20 text-primary hover:bg-primary/10 gap-1"
              asChild
            >
              <Link to="/">
                Launch App
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-16 md:py-24 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
        {/* Left Col - Copy & Pitch */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6 z-10">
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider py-1 border-primary/30 text-primary bg-primary/5">
            // Unified Developer Profiler
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight leading-[0.9] text-foreground">
            Every footprint.<br />
            <span style={{ WebkitTextStroke: '1px var(--color-primary)', color: 'transparent' }}>
              One single
            </span><br />
            terminal.
          </h1>

          <p className="text-base text-muted-foreground max-w-lg leading-relaxed">
            Stop pasting six different profile URLs. Aggregate your coding footprints, contest ratings, solved problems count, and commit histories from major developer platforms into one sleek dashboard.
          </p>

          {/* Platform Icon Ribbon */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="text-xs font-mono text-muted-foreground/60 mr-2">Integrates with:</span>
            {[
              { icon: SiGithub, color: '#e0e0e0', label: 'GitHub' },
              { icon: SiLeetcode, color: '#ffa116', label: 'LeetCode' },
              { icon: SiCodeforces, color: '#1f8ef1', label: 'Codeforces' },
              { icon: SiGeeksforgeeks, color: '#2db55d', label: 'GFG' },
              { icon: SiCodechef, color: '#5B4638', label: 'CodeChef' },
              { icon: SiHackerrank, color: '#2ec866', label: 'HackerRank' }
            ].map((p, idx) => (
              <span 
                key={idx} 
                className="p-1.5 rounded bg-card border border-border/50 flex items-center justify-center transition-all hover:scale-110" 
                style={{ color: p.color }}
                title={p.label}
              >
                <p.icon className="size-4" />
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-4">
            <Button size="lg" className="font-mono bg-primary text-primary-foreground font-semibold hover:bg-primary/90 flex items-center justify-center gap-2" asChild>
              <Link to="/">
                Build Your Profile
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="font-mono text-sm border-border hover:bg-card" asChild>
              <a href="#demo-section">
                Explore Features
              </a>
            </Button>
          </div>
        </div>

        {/* Right Col - Simulated Terminal Window */}
        <div className="lg:col-span-5 w-full z-10">
          <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden shadow-2xl">
            {/* Terminal Header */}
            <div className="bg-secondary/40 px-4 py-3 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-red-500/80" />
                <span className="size-2.5 rounded-full bg-yellow-500/80" />
                <span className="size-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">sh - npx codetrace</span>
              <div className="w-8" />
            </div>

            {/* Terminal Tabs */}
            <div className="flex border-b border-border bg-secondary/20">
              {(['npx', 'curl', 'api.json'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-[11px] font-mono border-r border-border transition-colors ${
                    activeTab === tab 
                      ? 'bg-card text-primary border-t-2 border-t-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/30'
                  }`}
                >
                  {tab === 'api.json' ? 'api.json' : tab === 'curl' ? 'curl dev.json' : 'npx output'}
                </button>
              ))}
            </div>

            {/* Terminal Content */}
            <div className="p-4 font-mono text-[11px] leading-relaxed text-left min-h-[220px] bg-black/40 overflow-y-auto">
              {activeTab === 'npx' && (
                <div className="space-y-1 fade-in">
                  <p className="text-muted-foreground">$ npx codetrace --profile=alex_dev</p>
                  <p className="text-yellow-500/80">⚡ Initializing aggregate index...</p>
                  <p className="text-green-500/80">✔ GitHub loaded (142 repos, 2,410 commits)</p>
                  <p className="text-green-500/80">✔ LeetCode loaded (480 solved, 2,150 rating)</p>
                  <p className="text-green-500/80">✔ Codeforces loaded (Specialist @ 1580)</p>
                  <p className="text-muted-foreground">--------------------------------------</p>
                  <p className="text-primary font-bold">CodeTrace profile resolved in 42ms:</p>
                  <div className="pl-2 border-l border-primary/20 space-y-0.5 text-muted-foreground">
                    <p>Total Solved DSA  : <span className="text-foreground font-bold">792 Problems</span></p>
                    <p>Contest Rating    : <span className="text-foreground font-bold">2150 (Top 2.5%)</span></p>
                    <p>Annual Activity   : <span className="text-foreground font-bold">2,410 contribution points</span></p>
                    <p>Rank Tier         : <span className="text-primary font-bold">Elite Developer</span></p>
                  </div>
                </div>
              )}

              {activeTab === 'curl' && (
                <div className="space-y-1 fade-in text-muted-foreground">
                  <p>$ curl -s https://api.codetrace.link/v1/alex_dev</p>
                  <p className="text-primary">{`{`}</p>
                  <p className="pl-4">"status": "success",</p>
                  <p className="pl-4">"latency": "42ms",</p>
                  <p className="pl-4">"profile": {`{`}</p>
                  <p className="pl-8">"developer": "alex_dev",</p>
                  <p className="pl-8">"rank": 0.042,</p>
                  <p className="pl-8">"active_platforms": ["github", "leetcode", "codeforces"]</p>
                  <p className="pl-4">{`}`}</p>
                  <p className="text-primary">{`}`}</p>
                </div>
              )}

              {activeTab === 'api.json' && (
                <pre className="text-muted-foreground whitespace-pre-wrap fade-in">
{`{
  "github": {
    "username": "alex_dev",
    "commits": 2410,
    "stars": 820
  },
  "leetcode": {
    "username": "alex_dev",
    "solved": 480,
    "ranking": "Knight @ 2150"
  },
  "codeforces": {
    "username": "alex_cf",
    "rating": 1580,
    "rank": "specialist"
  }
}`}
                </pre>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section with Universal Calendar / Live Preview */}
      <section id="demo-section" className="px-4 py-16 border-t border-border bg-secondary/10 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
            <Badge variant="outline" className="font-mono text-[9px] uppercase tracking-widest text-primary border-primary/20">
              Feature Spotlight
            </Badge>
            <h2 className="text-3xl md:text-5xl font-display font-bold">
              Premium UI.<br />
              Tailored for Code.
            </h2>
            <p className="text-xs font-mono text-muted-foreground">
              A visually striking dashboard crafted using geometry, micro-glows, and modular design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Feature 1: Universal Calendar (8 cols on md) */}
            <div className="md:col-span-8 rounded-xl border border-border bg-card p-6 flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity className="size-24 text-primary" />
              </div>
              
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-primary bg-primary/5 border border-primary/20 px-2 py-0.5 rounded">
                  Aggregated Activity
                </span>
                <h3 className="text-xl font-bold font-display">Universal Contribution Heatmap</h3>
                <p className="text-xs text-muted-foreground max-w-md">
                  Combines active contribution streaks across GitHub commits, LeetCode submissions, and CodeChef contest participations into one single grid index.
                </p>
              </div>

              {/* Mock Heatmap Grid */}
              <div className="pt-4 border-t border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-muted-foreground">Combined activity (Past 14 weeks)</span>
                  <div className="flex gap-2 text-[8px] font-mono text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="size-2 bg-[#2db55d]/40 rounded-sm" /> GitHub</span>
                    <span className="flex items-center gap-1"><span className="size-2 bg-[#ffa116]/40 rounded-sm" /> LeetCode</span>
                    <span className="flex items-center gap-1"><span className="size-2 bg-[#5B4638]/60 rounded-sm" /> CodeChef</span>
                  </div>
                </div>
                
                {/* Heatmap Layout */}
                <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-2 scrollbar-none">
                  {heatmapCells.map((cell, idx) => {
                    let bgClass = 'bg-muted/10'
                    if (cell.type === 'github') {
                      if (cell.intensity === 1) bgClass = 'bg-[#2db55d]/20'
                      if (cell.intensity === 2) bgClass = 'bg-[#2db55d]/40'
                      if (cell.intensity === 3) bgClass = 'bg-[#2db55d]/70'
                      if (cell.intensity === 4) bgClass = 'bg-[#2db55d]'
                    } else if (cell.type === 'leetcode') {
                      if (cell.intensity === 1) bgClass = 'bg-[#ffa116]/20'
                      if (cell.intensity === 2) bgClass = 'bg-[#ffa116]/40'
                      if (cell.intensity === 3) bgClass = 'bg-[#ffa116]/70'
                      if (cell.intensity === 4) bgClass = 'bg-[#ffa116]'
                    } else if (cell.type === 'codechef') {
                      if (cell.intensity === 1) bgClass = 'bg-[#8c6d58]/20'
                      if (cell.intensity === 2) bgClass = 'bg-[#8c6d58]/40'
                      if (cell.intensity === 3) bgClass = 'bg-[#8c6d58]/70'
                      if (cell.intensity === 4) bgClass = 'bg-[#8c6d58]'
                    }
                    return (
                      <div
                        key={idx}
                        className={`size-2.5 rounded-[1px] transition-colors duration-300 hover:scale-125 cursor-crosshair ${bgClass}`}
                        title={`${cell.type !== 'empty' ? `${cell.type.toUpperCase()} point intensity ${cell.intensity}` : 'No activity'}`}
                      />
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Feature 2: Performance Radar (4 cols on md) */}
            <div className="md:col-span-4 rounded-xl border border-border bg-card p-6 flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-primary bg-primary/5 border border-primary/20 px-2 py-0.5 rounded">
                  Stat Distribution
                </span>
                <h3 className="text-xl font-bold font-display">DSA vs CP Mapping</h3>
                <p className="text-xs text-muted-foreground">
                  Maps rating points, solved count, and system commits to trace your engineering profile type.
                </p>
              </div>

              {/* Circular Radar Layout Mockup using SVG */}
              <div className="flex items-center justify-center py-2">
                <svg className="size-32" viewBox="0 0 100 100">
                  {/* Grid circles */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-border" strokeWidth="0.5" strokeDasharray="2 2" />
                  <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" className="text-border" strokeWidth="0.5" strokeDasharray="2 2" />
                  <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" className="text-border" strokeWidth="0.5" strokeDasharray="2 2" />
                  
                  {/* Axes */}
                  <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" className="text-border" strokeWidth="0.5" />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" className="text-border" strokeWidth="0.5" />
                  
                  {/* Skill polygon - Mint Neon fill */}
                  <polygon
                    points="50,22 82,50 50,78 30,50"
                    fill="color-mix(in srgb, var(--color-primary) 15%, transparent)"
                    stroke="var(--color-primary)"
                    strokeWidth="1.5"
                    className="animate-pulse"
                  />
                  
                  {/* Dots */}
                  <circle cx="50" cy="22" r="2" fill="var(--color-primary)" />
                  <circle cx="82" cy="50" r="2" fill="var(--color-primary)" />
                  <circle cx="50" cy="78" r="2" fill="var(--color-primary)" />
                  <circle cx="30" cy="50" r="2" fill="var(--color-primary)" />

                  {/* Labels */}
                  <text x="50" y="8" textAnchor="middle" fontSize="6" className="fill-muted-foreground font-mono">DSA</text>
                  <text x="94" y="52" textAnchor="start" fontSize="6" className="fill-muted-foreground font-mono">CP</text>
                  <text x="50" y="97" textAnchor="middle" fontSize="6" className="fill-muted-foreground font-mono">FUND</text>
                  <text x="6" y="52" textAnchor="end" fontSize="6" className="fill-muted-foreground font-mono">DEV</text>
                </svg>
              </div>

              <div className="text-[10px] font-mono text-muted-foreground/60 text-center">
                Balanced Type: Strong CP and DSA foundations
              </div>
            </div>

            {/* Feature 3: Asymmetric Layout / Platform Breakdown (12 cols) */}
            <div className="md:col-span-12 rounded-xl border border-border bg-card p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-primary bg-primary/5 border border-primary/20 px-2 py-0.5 rounded">
                    Integrations
                  </span>
                  <h3 className="text-2xl font-bold font-display">Deep Platform Integrations</h3>
                </div>
                <p className="text-xs text-muted-foreground max-w-md font-mono">
                  We hook directly into official APIs and scrapers to extract verified credentials and display badges automatically.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'GitHub', desc: 'Commits, pull requests, repository stars, language breakdowns, and pinning status.', color: 'var(--platform-github)', logo: SiGithub },
                  { name: 'LeetCode', desc: 'Contest rating performance, global rank percentiles, problem counts broken down by difficulty tier.', color: 'var(--platform-leetcode)', logo: SiLeetcode },
                  { name: 'Codeforces', desc: 'Contest ratings, active tier name (Specialist, Candidate Master, etc.), rank histories.', color: 'var(--platform-codeforces)', logo: SiCodeforces },
                  { name: 'GeeksForGeeks', desc: 'Total problems solved, overall score index, coding keys, and platform rank indicators.', color: 'var(--platform-gfg)', logo: SiGeeksforgeeks },
                  { name: 'CodeChef', desc: 'Star badge levels, active ratings, performance curves, global ranks, and heatmaps.', color: 'var(--platform-codechef)', logo: SiCodechef },
                  { name: 'HackerRank', desc: 'Platform badges, certified star ranks across topics, and solved counts.', color: 'var(--platform-hackerrank)', logo: SiHackerrank },
                ].map((plat, idx) => (
                  <Card key={idx} className="border border-border/50 bg-secondary/20 hover:border-primary/20 hover:bg-secondary/40 transition-all duration-300 group">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded" style={{ color: plat.color, backgroundColor: `color-mix(in srgb, ${plat.color} 10%, transparent)` }}>
                          <plat.logo className="size-4" />
                        </div>
                        <h4 className="font-display font-bold text-sm text-foreground">{plat.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{plat.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* URL Link Builder Section (Interactive Widget) */}
      <section className="px-4 py-16 max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-3 max-w-xl mx-auto">
          <Badge variant="outline" className="font-mono text-[9px] uppercase tracking-widest text-primary border-primary/20">
            Create Your Link
          </Badge>
          <h2 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight">
            Generate Your Card
          </h2>
          <p className="text-xs font-mono text-muted-foreground">
            Type your platform usernames below. We will compile them into a single shareable developer card.
          </p>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left p-6 rounded-xl border border-border bg-card/60 backdrop-blur-sm max-w-3xl mx-auto">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1.5">
              <SiGithub className="size-3 text-[#e0e0e0]" /> GitHub
            </label>
            <Input
              type="text"
              value={githubUser}
              onChange={(e) => setGithubUser(e.target.value)}
              placeholder="e.g. alex_dev"
              className="font-mono text-xs border-border bg-black/20 focus-visible:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1.5">
              <SiLeetcode className="size-3 text-[#ffa116]" /> LeetCode
            </label>
            <Input
              type="text"
              value={leetcodeUser}
              onChange={(e) => setLeetcodeUser(e.target.value)}
              placeholder="e.g. alex_dev"
              className="font-mono text-xs border-border bg-black/20 focus-visible:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1.5">
              <SiCodeforces className="size-3 text-[#1f8ef1]" /> Codeforces
            </label>
            <Input
              type="text"
              value={codeforcesUser}
              onChange={(e) => setCodeforcesUser(e.target.value)}
              placeholder="e.g. alex_cf"
              className="font-mono text-xs border-border bg-black/20 focus-visible:ring-primary/20"
            />
          </div>
        </div>

        {/* Share preview bar */}
        <div className="max-w-3xl mx-auto border border-primary/20 rounded-xl bg-primary/5 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-left min-w-0 w-full">
            <span className="font-mono text-[10px] text-primary border border-primary/30 rounded px-1.5 py-0.5 select-none shrink-0">
              GET
            </span>
            <span className="font-mono text-xs text-foreground truncate select-all select-none w-full md:max-w-xl">
              {generatedUrl}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="font-mono text-xs flex-1 md:flex-initial border-primary/20 text-primary hover:bg-primary/10 gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="size-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy Link
                </>
              )}
            </Button>
            
            <Button
              variant="default"
              size="sm"
              className="font-mono text-xs flex-1 md:flex-initial bg-primary text-primary-foreground font-semibold hover:bg-primary/95"
              asChild
            >
              <Link
                to="/"
                search={{
                  github: githubUser || undefined,
                  leetcode: leetcodeUser || undefined,
                  codeforces: codeforcesUser || undefined
                }}
              >
                Launch Card
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Grid Border CTA block */}
      <section className="px-4 py-20 border-t border-border bg-[linear-gradient(to_bottom,transparent_0%,rgba(100,255,218,0.03)_100%)] text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <h2 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight">
            Stop Stacking.<br />
            Start Tracing.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            Get your developer footprints in one line of query. Free forever. Powered by serverless stats relays.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="font-mono font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-2 w-full sm:w-auto" asChild>
              <Link to="/">
                Launch Platform &rarr;
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="font-mono text-sm border-border hover:bg-card w-full sm:w-auto" asChild>
              <a href="https://github.com/tashifkhan/stats-api-demo" target="_blank" rel="noreferrer" className="flex items-center gap-1.5">
                <SiGithub className="size-4" />
                Star Codebase
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Terminal Footer */}
      <footer className="border-t border-border px-4 py-8 bg-black/60 font-mono text-[10px] text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} CodeTrace.</span>
            <span>All stats compiled dynamically.</span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a href="https://github-stats.tashif.codes/docs" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">GitHub API Docs</a>
            <a href="https://leetcode-stats.tashif.codes/" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">LeetCode API Docs</a>
            <a href="https://codeforces-stats.tashif.codes/docs" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">CF API Docs</a>
            <a href="https://gfg-stats.tashif.codes/docs" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">GFG API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
