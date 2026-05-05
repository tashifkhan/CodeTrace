import { useCountUp } from '@/hooks/useCountUp'

interface Props {
  value: number
  label: string
  prefix?: string
  suffix?: string
  enabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function StatNumber({ value, label, prefix = '', suffix = '', enabled = true, size = 'md' }: Props) {
  const display = useCountUp(value, 1200, enabled)

  const numClass = { sm: 'text-2xl', md: 'text-3xl', lg: 'text-5xl' }[size]

  return (
    <div className="flex flex-col gap-1">
      <span className={`font-mono font-semibold text-primary leading-none tracking-tight ${numClass}`}>
        {prefix}{display.toLocaleString()}{suffix}
      </span>
      <span className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  )
}
