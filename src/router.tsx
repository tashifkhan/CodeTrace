import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import { HomePage } from '@/pages/HomePage'
import { GitHubPage } from '@/pages/GitHubPage'
import { LeetCodePage } from '@/pages/LeetCodePage'
import { CodeforcesPage } from '@/pages/CodeforcesPage'
import { GFGPage } from '@/pages/GFGPage'

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

const routeTree = rootRoute.addChildren([
  indexRoute,
  githubRoute,
  leetcodeRoute,
  codeforcesRoute,
  gfgRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
