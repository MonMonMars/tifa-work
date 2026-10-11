/** Previous calendar day key (YYYY-MM-DD). Keep aligned with checkIn/streak.ts. */
export function previousDayKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y!, m! - 1, d!);
  dt.setDate(dt.getDate() - 1);
  const ny = dt.getFullYear();
  const nm = String(dt.getMonth() + 1).padStart(2, '0');
  const nd = String(dt.getDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

export interface FocusDayBar {
  dayKey: string;
  weekday: string;
  minutes: number;
}

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function weekdayLabel(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  const dt = new Date(y!, m! - 1, d!);
  return WEEKDAY[dt.getDay()] ?? '?';
}

/** Last 7 local calendar days ending today (oldest first). */
export function buildFocusLast7Days(
  minutesByDay: Record<string, number>,
  todayKey: string,
): FocusDayBar[] {
  const out: FocusDayBar[] = [];
  let key = todayKey;
  for (let i = 0; i < 7; i++) {
    out.unshift({
      dayKey: key,
      weekday: weekdayLabel(key),
      minutes: minutesByDay[key] ?? 0,
    });
    key = previousDayKey(key);
  }
  return out;
}

/** Drop keys older than keepDays before anchor day. */
export function trimMinutesByDay(
  minutesByDay: Record<string, number>,
  anchorDayKey: string,
  keepDays = 14,
): Record<string, number> {
  let cutoff = anchorDayKey;
  for (let i = 0; i < keepDays; i++) {
    cutoff = previousDayKey(cutoff);
  }
  const next: Record<string, number> = {};
  for (const [k, v] of Object.entries(minutesByDay)) {
    if (k >= cutoff) next[k] = v;
  }
  return next;
}
