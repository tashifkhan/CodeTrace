import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import { HomePage } from '@/pages/HomePage'
import { GitHubPage } from '@/pages/GitHubPage'
import { LeetCodePage } from '@/pages/LeetCodePage'
import { CodeforcesPage } from '@/pages/CodeforcesPage'
import { GFGPage } from '@/pages/GFGPage'
import { CodeChefPage } from '@/pages/CodeChefPage'
import { HackerRankPage } from '@/pages/HackerRankPage'
import { TUFPage } from '@/pages/TUFPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { MarketPage } from '@/pages/MarketPage'
import { LoginPage } from '@/pages/LoginPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { PublicProfilePage } from '@/pages/PublicProfilePage'

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
  component: MarketPage,
})

export const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
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

export const tufRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tuf/$username',
  component: TUFPage,
})

export const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
})

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

export const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: OnboardingPage,
})

export const publicProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$profileUsername',
  component: PublicProfilePage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  appRoute,
  loginRoute,
  onboardingRoute,
  githubRoute,
  leetcodeRoute,
  codeforcesRoute,
  gfgRoute,
  codechefRoute,
  hackerrankRoute,
  tufRoute,
  profileRoute,
  publicProfileRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
