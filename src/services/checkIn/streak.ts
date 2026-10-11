export interface CheckInState {
  lastCheckInKey: string | null;
  currentStreak: number;
  longestStreak: number;
}

export const DEFAULT_CHECK_IN: CheckInState = {
  lastCheckInKey: null,
  currentStreak: 0,
  longestStreak: 0,
};

export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function previousDayKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y!, m! - 1, d!);
  dt.setDate(dt.getDate() - 1);
  return localDateKey(dt);
}

export interface CheckInResult {
  state: CheckInState;
  alreadyCheckedIn: boolean;
  message: string;
}

export function applyCheckIn(state: CheckInState, todayKey: string): CheckInResult {
  if (state.lastCheckInKey === todayKey) {
    const streak = state.currentStreak;
    return {
      state,
      alreadyCheckedIn: true,
      message:
        streak > 0
          ? `Already checked in · ${streak}-day streak 🔥`
          : 'Already checked in today.',
    };
  }

  let nextStreak = 1;
  if (state.lastCheckInKey === previousDayKey(todayKey)) {
    nextStreak = state.currentStreak + 1;
  }

  const next: CheckInState = {
    lastCheckInKey: todayKey,
    currentStreak: nextStreak,
    longestStreak: Math.max(state.longestStreak, nextStreak),
  };

  const message =
    nextStreak === 1
      ? 'First check-in — nice to see you.'
      : `${nextStreak}-day streak — keep showing up.`;

  return { state: next, alreadyCheckedIn: false, message };
}
