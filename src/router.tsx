import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import { HomePage } from '@/pages/HomePage'
import { GitHubPage } from '@/pages/GitHubPage'
import { LeetCodePage } from '@/pages/LeetCodePage'
import { CodeforcesPage } from '@/pages/CodeforcesPage'
import { GFGPage } from '@/pages/GFGPage'
import { CodeChefPage } from '@/pages/CodeChefPage'
import { HackerRankPage } from '@/pages/HackerRankPage'

const rootRoute = createRootRoute({
  component: () => (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  ),
})

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

export const githubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/github/$username',
  component: GitHubPage,
})

export const leetcodeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/leetcode/$username',
  component: LeetCodePage,
})

export const codeforcesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/codeforces/$username',
  component: CodeforcesPage,
})

export const gfgRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gfg/$username',
  component: GFGPage,
})

export const codechefRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/codechef/$username',
  component: CodeChefPage,
})

export const hackerrankRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hackerrank/$username',
  component: HackerRankPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  githubRoute,
  leetcodeRoute,
  codeforcesRoute,
  gfgRoute,
  codechefRoute,
  hackerrankRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
