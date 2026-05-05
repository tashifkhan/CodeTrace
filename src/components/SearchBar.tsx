import { type FormEvent } from 'react'
import { Search } from 'lucide-react'
import { useQueryStates, parseAsString } from 'nuqs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { PlatformIcon } from './PlatformIcon'
import type { Usernames } from '../types/api'
import type { Platform } from '../types/api'

interface Props {
  onSubmit: () => void
}

const FIELDS: { key: keyof Usernames; platform: Platform; label: string; placeholder: string; color: string }[] = [
  { key: 'github',     platform: 'github',     label: 'GitHub',        placeholder: 'username',  color: 'var(--platform-github)' },
  { key: 'leetcode',   platform: 'leetcode',   label: 'LeetCode',      placeholder: 'username',  color: 'var(--platform-leetcode)' },
  { key: 'codeforces', platform: 'codeforces', label: 'Codeforces',    placeholder: 'handle',    color: 'var(--platform-codeforces)' },
  { key: 'gfg',        platform: 'gfg',        label: 'GeeksForGeeks', placeholder: 'username',  color: 'var(--platform-gfg)' },
]

export function SearchBar({ onSubmit }: Props) {
  const [values, setValues] = useQueryStates({
    github: parseAsString.withDefault(''),
    leetcode: parseAsString.withDefault(''),
    codeforces: parseAsString.withDefault(''),
    gfg: parseAsString.withDefault(''),
  }, { history: 'replace' })

  const hasAny = Object.values(values).some(v => v.trim() !== '')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!hasAny) return
    onSubmit()
  }

  return (
    <Card className="w-full max-w-lg mx-auto overflow-hidden transition-all duration-300 py-0">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col"
      >
        <CardContent className="p-0 flex flex-col gap-0">
          {FIELDS.map(({ key, platform, label, placeholder, color }, i) => (
            <div key={key}>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="flex items-center gap-2 w-28 flex-shrink-0" style={{ color }}>
                  <PlatformIcon platform={platform} className="size-4" />
                  <span className="text-xs font-mono font-medium">
                    {label}
                  </span>
                </div>
                <Input
                  value={values[key]}
                  onChange={e => setValues({ [key]: e.target.value })}
                  placeholder={placeholder}
                  autoComplete="off"
                  spellCheck={false}
                  className="font-mono bg-muted/30 border-transparent focus-visible:bg-transparent transition-colors"
                />
              </div>
              {i < FIELDS.length - 1 && <Separator />}
            </div>
          ))}

          <div className="p-3 pt-0">
            <Button
              type="submit"
              disabled={!hasAny}
              className="w-full rounded-xl font-semibold text-sm tracking-widest uppercase"
            >
              <Search data-icon="inline-start" />
              Stack Profiles
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}
