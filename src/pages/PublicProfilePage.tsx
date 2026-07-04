import { useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getPublicProfileByUsername } from '@/api/savedProfiles'
import { isSupabaseConfigured } from '@/lib/supabase'
import { configToUsernames } from '@/lib/profileConfig'
import { ProfilePage } from '@/pages/ProfilePage'

export function PublicProfilePage() {
  const { profileUsername } = useParams({ from: '/$profileUsername' })
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-profile', profileUsername],
    queryFn: () => getPublicProfileByUsername(profileUsername),
    enabled: isSupabaseConfigured,
  })

  if (!isSupabaseConfigured) {
    return <ProfileState title="Saved profiles are not configured" description="Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable public profile URLs." />
  }

  if (isLoading) return <ProfileState title={`Loading @${profileUsername}`} description="Fetching saved account configuration." />
  if (error) return <ProfileState title="Profile failed to load" description={(error as Error).message} />
  if (!data) return <ProfileState title="Profile not found" description={`No public CodeTrace profile exists for @${profileUsername}.`} />

  return <ProfilePage usernames={configToUsernames(data.config)} owner={data} />
}

function ProfileState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border/70 bg-card/60">
        <CardHeader>
          <CardTitle className="font-display text-3xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild><a href="/app">Open CodeTrace</a></Button>
        </CardContent>
      </Card>
    </div>
  )
}
