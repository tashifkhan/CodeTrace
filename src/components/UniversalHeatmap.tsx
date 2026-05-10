import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { GitHubContributions, LeetCodeHeatmapData, HackerRankHeatmapData } from '../types/api';

interface Props {
  // Pass one of the three data types
  calendar?: Record<string, number>;
  githubContributions?: GitHubContributions;
  leetcodeHeatmap?: LeetCodeHeatmapData;
  hackerrankHeatmap?: HackerRankHeatmapData;

  // Overrides for header stats
  totalSubmissions?: number;
  activeDays?: number;
  maxStreak?: number;
  startDate?: string;
  endDate?: string;

  // Custom label (e.g. 'contributions', 'submissions')
  label?: string;
  periodLabel?: string;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function getColor(count: number, max: number): string {
  if (count === 0) return 'var(--color-border)';
  const pct = count / max;
  if (pct < 0.25) return 'color-mix(in srgb, var(--color-primary) 25%, transparent)';
  if (pct < 0.5)  return 'color-mix(in srgb, var(--color-primary) 50%, transparent)';
  if (pct < 0.75) return 'color-mix(in srgb, var(--color-primary) 75%, transparent)';
  return 'var(--color-primary)';
}

export function UniversalHeatmap({
  calendar,
  githubContributions,
  leetcodeHeatmap,
  hackerrankHeatmap,
  totalSubmissions: propTotal,
  activeDays: propActiveDays,
  maxStreak: propMaxStreak,
  startDate,
  endDate,
  label = 'submissions',
  periodLabel,
}: Props) {
  
  // Year selection state
  const availableYears = useMemo(() => {
    if (githubContributions) return Object.keys(githubContributions.contributions).sort((a, b) => Number(b) - Number(a));
    return ['Current'];
  }, [githubContributions]);

  const [selectedYear, setSelectedYear] = useState<string>(availableYears[0] ?? 'Current');

  const { weeks, maxCount, computedTotal, computedActive, computedStreak } = useMemo(() => {
    let finalWeeks: { date: string; count: number }[][] = [];
    let active = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let total = 0;
    let maxCount = 1;

    if (githubContributions) {
      const yearData = githubContributions.contributions[selectedYear];
      if (yearData?.data?.user?.contributionsCollection?.contributionCalendar?.weeks) {
        finalWeeks = yearData.data.user.contributionsCollection.contributionCalendar.weeks.map(
          w => {
            const days: ({ date: string; count: number } | null)[] = new Array(7).fill(null);
            w.contributionDays.forEach(d => {
              // Create date in local timezone but from YYYY-MM-DD correctly to get day of week
              const [y, m, day] = d.date.split('-');
              const dateObj = new Date(Number(y), Number(m) - 1, Number(day));
              const dayIndex = dateObj.getDay();
              days[dayIndex] = { date: d.date, count: d.contributionCount };
            });
            return days as { date: string; count: number }[]; // Hack for type, we handle null in render
          }
        );
      }
    } else {
      // Build an aligned week grid for the provided range, falling back
      // to the trailing year when no explicit range is available.
      const rangeStart = startDate ? new Date(`${startDate}T00:00:00`) : new Date();
      const rangeEnd = endDate ? new Date(`${endDate}T00:00:00`) : new Date();
      rangeStart.setHours(0, 0, 0, 0);
      rangeEnd.setHours(0, 0, 0, 0);

      if (!startDate || !endDate) {
        rangeStart.setDate(rangeEnd.getDate() - (51 * 7 + 6));
      }

      const startSunday = new Date(rangeStart);
      startSunday.setDate(rangeStart.getDate() - rangeStart.getDay());

      const endSaturday = new Date(rangeEnd);
      endSaturday.setDate(rangeEnd.getDate() + (6 - rangeEnd.getDay()));

      const days: { date: string; count: number }[] = [];
      
      // If we have leetcode heatmap data, construct a calendar record
      let lookupCalendar = calendar ?? {};
      if (leetcodeHeatmap) {
        lookupCalendar = {};
        for (const day of leetcodeHeatmap.dailyContributions) {
          lookupCalendar[day.date] = day.count;
        }
      } else if (hackerrankHeatmap) {
        lookupCalendar = {};
        for (const day of hackerrankHeatmap.dailyContributions) {
          lookupCalendar[day.date] = day.count;
        }
      }

      for (let d = new Date(startSunday); d <= endSaturday; d.setDate(d.getDate() + 1)) {
        const ts = String(Math.floor(d.getTime() / 1000));
        const dateStr = d.toISOString().split('T')[0];
        const count = lookupCalendar[ts] ?? lookupCalendar[dateStr] ?? 0;
        days.push({ date: dateStr, count });
      }

      for (let w = 0; w < Math.ceil(days.length / 7); w++) {
        finalWeeks.push(days.slice(w * 7, w * 7 + 7));
      }
    }

    // compute stats if not provided
    const allDays = finalWeeks.flat().filter(Boolean);
    allDays.forEach(d => {
      total += d.count;
      if (d.count > 0) {
        active++;
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
      if (d.count > maxCount) maxCount = d.count;
    });

    return { 
      weeks: finalWeeks, 
      maxCount: Math.max(maxCount, 1), 
      computedTotal: total,
      computedActive: active,
      computedStreak: maxStreak
    };
  }, [calendar, endDate, githubContributions, hackerrankHeatmap, leetcodeHeatmap, selectedYear, startDate]);

  // Use provided stats (e.g. from leetcodeHeatmap) or compute from visible data
  const total = propTotal ?? (leetcodeHeatmap ? leetcodeHeatmap.totalSubmissions : (hackerrankHeatmap ? hackerrankHeatmap.totalSubmissions : computedTotal));
  const activeDays = propActiveDays ?? (leetcodeHeatmap ? leetcodeHeatmap.activeDays : (hackerrankHeatmap ? hackerrankHeatmap.activeDays : computedActive));
  const maxStreak = propMaxStreak ?? (leetcodeHeatmap ? leetcodeHeatmap.longestStreak : (hackerrankHeatmap ? hackerrankHeatmap.longestStreak : computedStreak));
  const visiblePeriod = periodLabel ?? (selectedYear === 'Current' ? 'the past one year' : selectedYear);

  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const day = week.find(Boolean);
      if (!day) return;
      const m = Number(day.date.split('-')[1]) - 1;
      if (m !== lastMonth) {
        labels.push({ label: MONTHS[m], col: i });
        lastMonth = m;
      }
    });
    return labels;
  }, [weeks]);

  return (
    <Card className="font-sans overflow-visible">
      <CardContent className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1.5 text-foreground">
            <span className="text-lg font-medium">{total.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">{label} in {visiblePeriod}</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-foreground">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Total active days:</span>
              <span className="font-medium">{activeDays}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Max streak:</span>
              <span className="font-medium">{maxStreak}</span>
            </div>
            {availableYears.length > 1 && (
              <div className="relative group ml-2">
                <button className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 transition-colors px-3 py-1.5 rounded-lg text-sm z-20">
                  {selectedYear}
                  <ChevronDown className="size-4" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-24 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 overflow-hidden">
                  {availableYears.map(y => (
                    <button 
                      key={y}
                      onClick={() => setSelectedYear(y)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors"
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
        <div className="min-w-[700px]">
          <div className="relative h-4 mb-1" style={{ paddingLeft: 28 }}>
            {monthLabels.map(({ label, col }, i) => (
              <span key={i} className="absolute text-[11px] text-muted-foreground" style={{ left: col * 12 + 28 }}>
                {label}
              </span>
            ))}
          </div>
          <div className="flex gap-0.5">
            <div className="flex flex-col gap-0.5 mr-1 pt-[2px]">
              {DAYS.map((d, i) => (
                <div key={i} className="text-[10px] text-muted-foreground h-[10px] flex items-center w-6 pr-1 justify-end leading-none">
                  {d}
                </div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) => (
                  day ? (
                    <div
                      key={day.date}
                      className="w-[10px] h-[10px] rounded-[2px] transition-all hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: getColor(day.count, maxCount) }}
                      title={`${day.date}: ${day.count} ${label}`}
                    />
                  ) : (
                    <div key={`empty-${di}`} className="w-[10px] h-[10px]" />
                  )
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      </CardContent>
    </Card>
  );
}
