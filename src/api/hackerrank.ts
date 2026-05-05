import type { HackerRankData, HackerRankDetailData, HackerRankHeatmapData } from '../types/api';

const BASE = 'https://hackerrank-stats-api.vercel.app';

export async function fetchHackerRankStats(username: string): Promise<HackerRankData> {
  const res = await fetch(`${BASE}/${username}`);
  const data = await res.json();
  if (data.status === 'error') throw new Error(data.message || 'HackerRank user not found');
  return data as HackerRankData;
}

export async function fetchHackerRankDetail(username: string): Promise<HackerRankDetailData> {
  const [stats, profileRes, contestRes, badgesRes] = await Promise.allSettled([
    fetchHackerRankStats(username),
    fetch(`${BASE}/${username}/profile`).then(r => r.json()),
    fetch(`${BASE}/${username}/contests`).then(r => r.json()),
    fetch(`${BASE}/${username}/badges`).then(r => r.json()),
  ]);

  if (stats.status === 'rejected') throw new Error((stats.reason as Error).message);

  const profile = profileRes.status === 'fulfilled' && profileRes.value?.status === 'success'
    ? profileRes.value.profile : null;
  const contestInfo = contestRes.status === 'fulfilled' && contestRes.value?.status === 'success'
    ? contestRes.value : null;
  const badgesData = badgesRes.status === 'fulfilled' && badgesRes.value?.status === 'success'
    ? badgesRes.value : null;

  return {
    ...stats.value,
    profile,
    contestInfo,
    badges: badgesData?.badges ?? [],
    upcomingBadges: badgesData?.upcomingBadges ?? [],
  };
}

export async function fetchHackerRankHeatmap(username: string): Promise<HackerRankHeatmapData> {
  const res = await fetch(`${BASE}/${username}/heatmap`);
  const data = await res.json();
  if (data.status === 'error') throw new Error(data.message || 'HackerRank heatmap unavailable');
  return data as HackerRankHeatmapData;
}
