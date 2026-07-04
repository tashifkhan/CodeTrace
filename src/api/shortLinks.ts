import { requireSupabase } from '@/lib/supabase'
import { hasConfigAccounts, type ProfileConfig } from '@/lib/profileConfig'
import { asProfileConfig } from '@/api/savedProfiles'
import type { Json } from '@/types/supabase'

export interface ShortLink {
  id: string
  code: string
  label: string | null
  config: ProfileConfig
  clicks: number
  createdAt: string
}

export interface ResolvedShortLink {
  code: string
  label: string | null
  config: ProfileConfig
}

const CODE_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789' // no 0/O/1/l/i lookalikes

export function generateShortCode(length = 7) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return [...bytes].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

export function normalizeShortCode(value: string) {
  return value.trim().toLowerCase()
}

export function validateShortCode(value: string) {
  const code = normalizeShortCode(value)
  if (!/^[a-z0-9][a-z0-9_-]{2,31}$/.test(code)) {
    return 'Ids are 3-32 lowercase letters, numbers, underscores, or hyphens.'
  }
  return null
}

function rowToShortLink(row: {
  id: string
  code: string
  label: string | null
  config: Json
  clicks: number
  created_at: string
}): ShortLink {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    config: asProfileConfig(row.config),
    clicks: row.clicks,
    createdAt: row.created_at,
  }
}

export async function listMyShortLinks(): Promise<ShortLink[]> {
  const client = requireSupabase()
  const { data: auth, error: authError } = await client.auth.getUser()
  if (authError) throw authError
  if (!auth.user) return []

  const { data, error } = await client
    .from('short_links')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(rowToShortLink)
}

export async function createShortLink(input: {
  config: ProfileConfig
  code?: string
  label?: string
}): Promise<ShortLink> {
  if (!hasConfigAccounts(input.config)) {
    throw new Error('Add at least one platform handle before minting a short URL.')
  }

  const client = requireSupabase()
  const { data: auth, error: authError } = await client.auth.getUser()
  if (authError) throw authError
  if (!auth.user) throw new Error('Sign in before creating short URLs.')

  const code = input.code ? normalizeShortCode(input.code) : generateShortCode()
  const validation = validateShortCode(code)
  if (validation) throw new Error(validation)

  const { data, error } = await client
    .from('short_links')
    .insert({
      user_id: auth.user.id,
      code,
      label: input.label?.trim() || null,
      config: input.config as Json,
    })
    .select()
    .single()
  if (error) {
    if (error.code === '23505') throw new Error(`The id "${code}" is already taken — pick another.`)
    throw error
  }
  return rowToShortLink(data)
}

export async function deleteShortLink(id: string) {
  const client = requireSupabase()
  const { error } = await client.from('short_links').delete().eq('id', id)
  if (error) throw error
}

/** Anonymous exact-code lookup via the counting RPC — no table read needed. */
export async function resolveShortLink(code: string): Promise<ResolvedShortLink | null> {
  const client = requireSupabase()
  const { data, error } = await client.rpc('resolve_short_link', {
    link_code: normalizeShortCode(code),
  })
  if (error) throw error
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const record = data as { code?: string; label?: string | null; config?: Json }
  if (!record.code || record.config === undefined) return null
  return {
    code: record.code,
    label: record.label ?? null,
    config: asProfileConfig(record.config),
  }
}

export function shortLinkUrl(code: string) {
  return `${window.location.origin}/s/${code}`
}
