import type { CodeforcesData, CodeforcesDetailData, UpcomingContest } from '../types/api';

const BASE = '/api/codeforces';

export async function fetchCodeforcesStats(userid: string): Promise<CodeforcesData> {
  const res = await fetch(`${BASE}/${userid}`);
  const data = await res.json();
  if (data.detail) throw new Error(data.detail);
  return data as CodeforcesData;
}

export async function fetchCodeforcesDetail(userid: string): Promise<CodeforcesDetailData> {
  // The main /{userid} endpoint already returns rating_history, contests_count,
  // and solved_problems_count. We fetch /rating and /solved as fallbacks.
  const [profileRes, ratingRes, solvedRes] = await Promise.allSettled([
    fetchCodeforcesStats(userid),
    fetch(`${BASE}/${userid}/rating`).then(r => r.json()),
    fetch(`${BASE}/${userid}/solved`).then(r => r.json()),
  ]);

  if (profileRes.status === 'rejected') throw new Error((profileRes.reason as Error).message);
  const profile = profileRes.value;

  // Use /rating endpoint if successful (returns an array), otherwise fallback
  // to the rating_history embedded in the main response
  const ratingHistory = ratingRes.status === 'fulfilled' && Array.isArray(ratingRes.value)
    ? ratingRes.value : profile.rating_history ?? [];

  // Use /solved endpoint count if available, otherwise fallback to the main response
  const solvedCount = solvedRes.status === 'fulfilled' && solvedRes.value?.count != null
    ? solvedRes.value.count : profile.solved_problems_count;

  return { ...profile, ratingHistory, solvedCount };
}

export async function fetchUpcomingContests(): Promise<UpcomingContest[]> {
  const data = await fetch(`${BASE}/contests/upcoming`).then(r => r.json());
  return Array.isArray(data) ? data.slice(0, 5) : [];
}

export async function fetchCodeforcesHeatmap(userid: string, days: number = 365): Promise<import('../types/api').CodeforcesHeatmapData> {
  const res = await fetch(`${BASE}/${userid}/heatmap?days=${days}`);
  const data = await res.json();
  if (data.detail) throw new Error(data.detail);
  return data;
}
