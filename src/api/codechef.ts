import type { CodeChefProfileData, CodeChefHeatmapData, CodeChefRatingData, CodeChefDetailData } from '../types/api'

const API_BASE = '/api/codechef'

export async function fetchCodeChefStats(username: string): Promise<CodeChefProfileData> {
  const res = await fetch(`${API_BASE}/profile/${username}`)
  if (!res.ok) throw new Error('CodeChef stats fetch failed')
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'CodeChef user not found')
  return data
}

export async function fetchCodeChefHeatmap(
  username: string,
  options: { view?: 'all' | 'last_365' | 'year'; year?: number | null } = {},
): Promise<CodeChefHeatmapData> {
  const params = new URLSearchParams()
  if (options.view) params.set('view', options.view)
  if (options.year != null) params.set('year', String(options.year))

  const query = params.toString()
  const res = await fetch(`${API_BASE}/heatmap/${username}${query ? `?${query}` : ''}`)
  if (!res.ok) throw new Error('CodeChef heatmap fetch failed')
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'Failed to fetch heatmap')
  return data
}

export async function fetchCodeChefRating(username: string): Promise<CodeChefRatingData> {
  const res = await fetch(`${API_BASE}/rating/${username}`)
  if (!res.ok) throw new Error('CodeChef rating fetch failed')
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'Failed to fetch rating')
  return data
}

export async function fetchCodeChefDetail(
  username: string,
  heatmapOptions: { view?: 'all' | 'last_365' | 'year'; year?: number | null } = {},
): Promise<CodeChefDetailData> {
  const [profile, heatmap, ratingHistory] = await Promise.all([
    fetchCodeChefStats(username),
    fetchCodeChefHeatmap(username, heatmapOptions),
    fetchCodeChefRating(username),
  ])

  return {
    ...profile,
    heatmap,
    ratingHistory,
  }
}
