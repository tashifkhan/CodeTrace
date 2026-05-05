import type { GitHubFullData, GitHubDetailData, GitHubContributions, GitHubPR, OrgContribution } from '../types/api';

const BASE = 'https://github-stats.tashif.codes';

async function get(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export async function fetchGitHubStats(username: string): Promise<GitHubFullData> {
  const [stats, pinned, stars] = await Promise.all([
    get(`${BASE}/${username}/stats`),
    get(`${BASE}/${username}/pinned`),
    get(`${BASE}/${username}/stars`),
  ]);
  if (stats.status === 'error') throw new Error(stats.message || 'GitHub user not found');
  return {
    stats,
    pinned: Array.isArray(pinned) ? pinned : [],
    stars,
  };
}

export async function fetchGitHubDetail(username: string): Promise<GitHubDetailData> {
  const [base, contribRaw, prsRaw, orgsRaw, viewsRaw] = await Promise.allSettled([
    fetchGitHubStats(username),
    get(`${BASE}/${username}/contributions`),
    get(`${BASE}/${username}/prs`),
    get(`${BASE}/${username}/org-contributions`),
    get(`${BASE}/${username}/profile-views`),
  ]);

  if (base.status === 'rejected') throw new Error((base.reason as Error).message);

  const contributions: GitHubContributions | null =
    contribRaw.status === 'fulfilled' ? contribRaw.value : null;
  const prs: GitHubPR[] =
    prsRaw.status === 'fulfilled' && Array.isArray(prsRaw.value) ? prsRaw.value : [];
  const orgContributions: OrgContribution[] =
    orgsRaw.status === 'fulfilled' && Array.isArray(orgsRaw.value) ? orgsRaw.value : [];
  const profileViews: number =
    viewsRaw.status === 'fulfilled' ? (viewsRaw.value?.views ?? 0) : 0;

  return { ...base.value, contributions, prs, orgContributions, profileViews };
}
