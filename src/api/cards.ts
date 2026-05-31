// Unified card service — one fetcher for every platform.
//
// All six Stat APIs expose `GET /{username}/card`, returning the same
// `UnifiedCard` shape inside the response envelope (see types/unified.ts and the
// backend UNIFIED_SCHEMA.md). This replaces the per-platform bespoke fetch +
// normalization the aggregated profile view used to do by hand.

import type { Platform } from '../types/api'
import type { UnifiedCard, UnifiedEnvelope } from '../types/unified'

// Base URL per platform. The two `/api/*` entries are dev-proxied in
// vite.config.ts to avoid CORS; the rest are hit directly. Each can be
// overridden with a `VITE_<PLATFORM>_API` env var — handy for pointing the demo
// at locally-running unified backends before they're deployed.
const env = import.meta.env
export const PLATFORM_BASE: Record<Platform, string> = {
  github: env.VITE_GITHUB_API ?? 'https://github-stats.tashif.codes',
  leetcode: env.VITE_LEETCODE_API ?? 'https://leetcode-stats.tashif.codes',
  codeforces: env.VITE_CODEFORCES_API ?? '/api/codeforces',
  gfg: env.VITE_GFG_API ?? 'https://gfg-stats.tashif.codes',
  codechef: env.VITE_CODECHEF_API ?? '/api/codechef',
  hackerrank: env.VITE_HACKERRANK_API ?? 'https://hackerrank-stats-api.vercel.app',
}

export const ALL_PLATFORMS: Platform[] = [
  'github', 'leetcode', 'codeforces', 'gfg', 'codechef', 'hackerrank',
]

async function getJson(url: string): Promise<UnifiedEnvelope<UnifiedCard>> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

/**
 * Fetch a single platform's unified profile card.
 * Unwraps the envelope and surfaces backend error envelopes as thrown errors.
 */
export async function fetchCard(platform: Platform, username: string): Promise<UnifiedCard> {
  const handle = username.trim()
  if (!handle) throw new Error('username required')

  const envelope = await getJson(`${PLATFORM_BASE[platform]}/${encodeURIComponent(handle)}/card`)

  if (envelope.status === 'error' || envelope.success === false) {
    throw new Error(String(envelope.message ?? `${platform} user not found`))
  }
  if (!envelope.data) {
    throw new Error(`${platform} returned no card data`)
  }
  // Backend always stamps platform/username, but guarantee them client-side too.
  return { ...envelope.data, platform, username: envelope.data.username || handle }
}
