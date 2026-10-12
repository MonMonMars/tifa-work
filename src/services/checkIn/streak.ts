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

import { localDateKey, previousDayKey } from '../../domain/localDateKey.ts';

export { localDateKey, previousDayKey };

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
