import type { LeetCodeData, LeetCodeDetailData, LeetCodeHeatmapData } from '../types/api';

const BASE = 'https://leetcode-stats.tashif.codes';

export async function fetchLeetCodeStats(username: string): Promise<LeetCodeData> {
  const [stats, profileRes] = await Promise.all([
    fetch(`${BASE}/${username}`).then(r => r.json()),
    fetch(`${BASE}/${username}/profile`).then(r => r.ok ? r.json() : null),
  ]);
  if (stats.status === 'error') throw new Error(stats.message || 'LeetCode user not found');
  return {
    easySolved: stats.easySolved,
    mediumSolved: stats.mediumSolved,
    hardSolved: stats.hardSolved,
    totalSolved: stats.totalSolved,
    totalEasy: stats.totalEasy,
    totalMedium: stats.totalMedium,
    totalHard: stats.totalHard,
    totalQuestions: stats.totalQuestions ?? 0,
    acceptanceRate: stats.acceptanceRate,
    ranking: stats.ranking,
    submissionCalendar: stats.submissionCalendar ?? {},
    profile: profileRes?.status === 'success' ? profileRes.profile : null,
  };
}

export async function fetchLeetCodeDetail(username: string): Promise<LeetCodeDetailData> {
  const [base, contestRes, badgesRes] = await Promise.allSettled([
    fetchLeetCodeStats(username),
    fetch(`${BASE}/${username}/contests`).then(r => r.json()),
    fetch(`${BASE}/${username}/badges`).then(r => r.json()),
  ]);

  if (base.status === 'rejected') throw new Error((base.reason as Error).message);

  const contestInfo = contestRes.status === 'fulfilled' && !contestRes.value?.status?.includes?.('error')
    ? contestRes.value : null;
  const badgesData = badgesRes.status === 'fulfilled' ? badgesRes.value : null;

  return {
    ...base.value,
    contestInfo,
    badges: badgesData?.badges ?? [],
    upcomingBadges: badgesData?.upcomingBadges ?? [],
  };
}

export async function fetchLeetCodeHeatmap(username: string): Promise<LeetCodeHeatmapData> {
  const res = await fetch(`${BASE}/${username}/heatmap`);
  const data = await res.json();
  if (data.status === 'error') throw new Error(data.message || 'LeetCode heatmap unavailable');
  return data as LeetCodeHeatmapData;
}
