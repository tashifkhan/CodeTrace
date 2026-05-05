import { useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PlatformIcon } from './PlatformIcon'
import type { Usernames } from '../types/api'
import type { Platform } from '../types/api'

interface Props {
  onSearch: (usernames: Usernames) => void
}

const FIELDS: { key: keyof Usernames; platform: Platform; label: string; placeholder: string; color: string }[] = [
  { key: 'github',     platform: 'github',     label: 'GitHub',        placeholder: 'username',  color: 'var(--platform-github)' },
  { key: 'leetcode',   platform: 'leetcode',   label: 'LeetCode',      placeholder: 'username',  color: 'var(--platform-leetcode)' },
  { key: 'codeforces', platform: 'codeforces', label: 'Codeforces',    placeholder: 'handle',    color: 'var(--platform-codeforces)' },
  { key: 'gfg',        platform: 'gfg',        label: 'GeeksForGeeks', placeholder: 'username',  color: 'var(--platform-gfg)' },
]

export function SearchBar({ onSearch }: Props) {
  const [values, setValues] = useState<Usernames>({ github: '', leetcode: '', codeforces: '', gfg: '' })
  const [focused, setFocused] = useState(false)

  const hasAny = Object.values(values).some(v => v.trim() !== '')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!hasAny) return
    onSearch({
      github:     values.github.trim(),
      leetcode:   values.leetcode.trim(),
      codeforces: values.codeforces.trim(),
      gfg:        values.gfg.trim(),
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-lg mx-auto flex flex-col rounded-2xl border bg-card overflow-hidden transition-all duration-300 ${
        focused
          ? 'border-ring ring-2 ring-ring/30'
          : 'border-border'
      }`}
      onFocus={() => setFocused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false) }}
    >
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
              onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
              placeholder={placeholder}
              autoComplete="off"
              spellCheck={false}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-transparent h-auto py-0 px-0 text-sm font-mono placeholder:text-muted-foreground/50"
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
    </form>
  )
}
