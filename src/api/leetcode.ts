import type { LeetCodeData, LeetCodeDetailData, LeetCodeHeatmapData } from '../types/api';

const BASE = 'https://leetcode-stats.tashif.codes';

async function getJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchLeetCodeBaseStats(username: string) {
  const stats = await getJson(`${BASE}/${username}`);
  if (stats.status === 'error') throw new Error(stats.message || 'LeetCode user not found');
  return stats;
}

async function fetchLeetCodeProfileBundle(username: string) {
  const res = await fetch(`${BASE}/${username}/profile`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status === 'error') return null;
  return data;
}

function normalizeLeetCodeStats(
  stats: {
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    totalSolved: number;
    totalEasy: number;
    totalMedium: number;
    totalHard: number;
    totalQuestions?: number;
    acceptanceRate: number;
    ranking: number;
    submissionCalendar?: Record<string, number>;
  },
  profile: LeetCodeData['profile'],
): LeetCodeData {
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
    profile,
  };
}

export async function fetchLeetCodeStats(username: string): Promise<LeetCodeData> {
  const [stats, profileData] = await Promise.all([
    fetchLeetCodeBaseStats(username),
    fetchLeetCodeProfileBundle(username),
  ]);
  return normalizeLeetCodeStats(stats, profileData?.profile ?? null);
}

export async function fetchLeetCodeDetail(username: string): Promise<LeetCodeDetailData> {
  const [statsRes, profileRes, contestRes, badgesRes] = await Promise.allSettled([
    fetchLeetCodeBaseStats(username),
    fetchLeetCodeProfileBundle(username),
    getJson(`${BASE}/${username}/contests`),
    getJson(`${BASE}/${username}/badges`),
  ]);

  if (statsRes.status === 'rejected') throw new Error((statsRes.reason as Error).message);

  const profileData = profileRes.status === 'fulfilled' ? profileRes.value : null;
  const contestInfo = contestRes.status === 'fulfilled' && !contestRes.value?.status?.includes?.('error')
    ? contestRes.value : null;
  const badgesData = badgesRes.status === 'fulfilled' ? badgesRes.value : null;

  return {
    ...normalizeLeetCodeStats(statsRes.value, profileData?.profile ?? null),
    githubUrl: profileData?.githubUrl ?? null,
    twitterUrl: profileData?.twitterUrl ?? null,
    linkedinUrl: profileData?.linkedinUrl ?? null,
    contributions: profileData?.contributions ?? null,
    contestInfo,
    badges: badgesData?.badges ?? [],
    upcomingBadges: badgesData?.upcomingBadges ?? [],
    activeBadge: badgesData?.activeBadge ?? profileData?.activeBadge ?? null,
    submitStats: profileData?.submitStats ?? null,
    recentSubmissions: profileData?.recentSubmissions ?? [],
  };
}

export async function fetchLeetCodeHeatmap(username: string): Promise<LeetCodeHeatmapData> {
  const res = await fetch(`${BASE}/${username}/heatmap`);
  const data = await res.json();
  if (data.status === 'error') throw new Error(data.message || 'LeetCode heatmap unavailable');
  return data as LeetCodeHeatmapData;
}
