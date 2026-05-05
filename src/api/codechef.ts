import type { CodeChefProfileData, CodeChefHeatmapData, CodeChefRatingData, CodeChefDetailData } from '../types/api'

const API_BASE = '/api/codechef'

export async function fetchCodeChefStats(username: string): Promise<CodeChefProfileData> {
  const res = await fetch(`${API_BASE}/profile/${username}`)
  if (!res.ok) throw new Error('CodeChef stats fetch failed')
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'CodeChef user not found')
  return data
}

export async function fetchCodeChefHeatmap(username: string): Promise<CodeChefHeatmapData> {
  const res = await fetch(`${API_BASE}/heatmap/${username}`)
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

export async function fetchCodeChefDetail(username: string): Promise<CodeChefDetailData> {
  const [profile, heatmap, ratingHistory] = await Promise.all([
    fetchCodeChefStats(username),
    fetchCodeChefHeatmap(username),
    fetchCodeChefRating(username),
  ])

  return {
    ...profile,
    heatmap,
    ratingHistory,
  }
}
