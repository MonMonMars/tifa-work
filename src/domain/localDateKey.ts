/**
 * Device-local calendar day keys (`YYYY-MM-DD`) — not UTC.
 * Check-in streaks, focus minutes, and reminders all use these keys so
 * “today” matches the phone’s timezone (see docs/NOTIFICATIONS.md).
 */
export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Previous local calendar day key (for streaks, focus history rollups). */
export function previousDayKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y!, m! - 1, d!);
  dt.setDate(dt.getDate() - 1);
  return localDateKey(dt);
}
