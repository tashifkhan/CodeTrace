import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ActivityFilterOption {
  value: string;
  label: string;
}

interface Props {
  title: string;
  description: string;
  options: ActivityFilterOption[];
  value: string;
  onValueChange: (value: string) => void;
  years?: number[];
  selectedYear?: number | null;
  onYearChange?: (year: number) => void;
  meta?: string[];
}

export function ActivityFilterBar({
  title,
  description,
  options,
  value,
  onValueChange,
  years = [],
  selectedYear,
  onYearChange,
  meta = [],
}: Props) {
  const showYears = years.length > 0 && selectedYear != null && onYearChange;

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-border/70 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-secondary)_65%,transparent),transparent_60%),linear-gradient(180deg,color-mix(in_srgb,var(--color-card)_88%,transparent),var(--color-card))] p-4 shadow-[0_20px_60px_-36px_rgba(0,0,0,0.7)] sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-primary)_10%,transparent),transparent_45%)]" />

      <div className="relative flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground/70">{title}</div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {options.map((option) => {
              const active = option.value === value;

              return (
                <Button
                  key={option.value}
                  type="button"
                  variant={active ? 'secondary' : 'outline'}
                  size="sm"
                  className={active ? 'border-transparent bg-primary/12 text-primary shadow-none' : 'bg-background/50'}
                  onClick={() => onValueChange(option.value)}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        {showYears && (
          <div className="flex flex-wrap gap-2">
            {years.map((year) => {
              const active = year === selectedYear;

              return (
                <Button
                  key={year}
                  type="button"
                  variant={active ? 'secondary' : 'ghost'}
                  size="xs"
                  className={active ? 'bg-foreground text-background hover:bg-foreground/90 hover:text-background' : 'text-muted-foreground hover:text-foreground'}
                  onClick={() => onYearChange(year)}
                >
                  {year}
                </Button>
              );
            })}
          </div>
        )}

        {meta.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {meta.map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="border-border/70 bg-background/55 font-mono text-[10px] text-muted-foreground backdrop-blur"
              >
                {item}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
