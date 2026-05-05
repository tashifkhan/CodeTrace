import { useState } from 'react'
import { History, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useInputHistory } from '../hooks/useInputHistory'

interface HistoryInputProps {
  platform: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export function HistoryInput({ platform, value, onChange, placeholder }: HistoryInputProps) {
  const { history, removeHistory } = useInputHistory(platform)
  const [open, setOpen] = useState(false)

  return (
    <div className="relative flex items-center w-full">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="font-mono bg-muted/30 border-transparent focus-visible:bg-transparent transition-colors pr-10"
      />
      {history.length > 0 && (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 size-8 text-muted-foreground hover:text-primary"
            >
              <History className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 font-mono text-xs bg-background/90 backdrop-blur-md border-white/10 rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95">
            {history.map((item) => (
              <DropdownMenuItem
                key={item}
                className="flex items-center justify-between cursor-pointer rounded-lg hover:bg-muted/50 transition-colors py-1.5 px-3 group"
                onSelect={() => {
                  onChange(item)
                  setOpen(false)
                }}
              >
                <span className="truncate text-muted-foreground group-hover:text-foreground transition-colors">{item}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 shrink-0 transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeHistory(item)
                  }}
                >
                  <X className="size-3" />
                </Button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
