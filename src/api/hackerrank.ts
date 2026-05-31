import type { HackerRankData, HackerRankDetailData, HackerRankHeatmapData } from '../types/api';

const BASE = 'https://hackerrank-stats-api.vercel.app';

async function getJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchHackerRankProfileBundle(username: string) {
  const res = await fetch(`${BASE}/${username}/profile`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status === 'error') return null;
  return data;
}

export async function fetchHackerRankStats(username: string): Promise<HackerRankData> {
  const res = await fetch(`${BASE}/${username}`);
  const data = await res.json();
  if (data.status === 'error') throw new Error(data.message || 'HackerRank user not found');
  return data as HackerRankData;
}

export async function fetchHackerRankDetail(username: string): Promise<HackerRankDetailData> {
  const [stats, profileRes, contestRes, badgesRes] = await Promise.allSettled([
    fetchHackerRankStats(username),
    fetchHackerRankProfileBundle(username),
    getJson(`${BASE}/${username}/contests`),
    getJson(`${BASE}/${username}/badges`),
  ]);

  if (stats.status === 'rejected') throw new Error((stats.reason as Error).message);

  const profileData = profileRes.status === 'fulfilled' ? profileRes.value : null;
  const contestInfo = contestRes.status === 'fulfilled' && contestRes.value?.status === 'success'
    ? contestRes.value : null;
  const badgesData = badgesRes.status === 'fulfilled' && badgesRes.value?.status === 'success'
    ? badgesRes.value : null;

  return {
    ...stats.value,
    githubUrl: profileData?.githubUrl ?? null,
    twitterUrl: profileData?.twitterUrl ?? null,
    linkedinUrl: profileData?.linkedinUrl ?? null,
    contributions: profileData?.contributions ?? null,
    profile: profileData?.profile ?? null,
    contestInfo,
    badges: badgesData?.badges ?? [],
    upcomingBadges: badgesData?.upcomingBadges ?? [],
    activeBadge: badgesData?.activeBadge ?? profileData?.activeBadge ?? null,
    submitStats: profileData?.submitStats ?? null,
    recentSubmissions: profileData?.recentSubmissions ?? [],
  };
}

export async function fetchHackerRankHeatmap(
  username: string,
  options: { view?: 'all' | 'last_365' | 'year'; year?: number | null } = {},
): Promise<HackerRankHeatmapData> {
  const params = new URLSearchParams();
  if (options.view) params.set('view', options.view);
  if (options.year != null) params.set('year', String(options.year));
  const query = params.toString();
  const res = await fetch(`${BASE}/${username}/heatmap${query ? `?${query}` : ''}`);
  const data = await res.json();
  if (data.status === 'error') throw new Error(data.message || 'HackerRank heatmap unavailable');
  return data as HackerRankHeatmapData;
}
