import type { GFGData, GFGProfileData, GFGHeatmapData } from '../types/api';

const BASE = 'https://gfg-stats.tashif.codes';

export async function fetchGFGStats(username: string): Promise<GFGData> {
  const json = await fetch(`${BASE}/${username}`).then(r => r.json());
  if (json.error || json.status === 'error') {
    throw new Error('GFG stats currently unavailable — GeeksForGeeks may have changed their page structure.');
  }
  return {
    totalProblemsSolved: json.totalProblemsSolved ?? 0,
    School: json.School ?? 0,
    Basic: json.Basic ?? 0,
    Easy: json.Easy ?? 0,
    Medium: json.Medium ?? 0,
    Hard: json.Hard ?? 0,
  };
}

export async function fetchGFGProfile(username: string): Promise<GFGProfileData> {
  const json = await fetch(`${BASE}/${username}/profile`).then(r => r.json());
  if (json.error) throw new Error(json.message || 'GFG profile unavailable');
  return json as GFGProfileData;
}

export async function fetchGFGHeatmap(
  username: string,
  options: { range?: 'all' | 'last365days' | 'year'; year?: number | null; month?: number | null } = {},
): Promise<GFGHeatmapData> {
  const params = new URLSearchParams();
  if (options.range) params.set('range', options.range);
  if (options.year != null) params.set('year', String(options.year));
  if (options.month != null) params.set('month', String(options.month));

  const query = params.toString();
  const res = await fetch(`${BASE}/${username}/heatmap${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('GFG heatmap unavailable');
  const json = await res.json();
  if (json.error) throw new Error(json.message || 'GFG heatmap unavailable');
  return json as GFGHeatmapData;
}
