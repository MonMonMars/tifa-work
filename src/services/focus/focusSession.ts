import type { FocusActiveSession, FocusDailyStats, FocusPersisted, FocusPreset } from './types';

/** Device-local calendar day — keep aligned with `services/checkIn/streak.ts`. */
function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const FOCUS_PRESET_MINUTES = {
  p25: 25,
  p50: 50,
} as const;

export type FocusEndReason = 'complete' | 'stop' | 'reconcile';

export interface FocusEndResult {
  focus: FocusPersisted;
  minutesLogged: number;
  reason: FocusEndReason;
}

function normalizeDaily(daily: FocusDailyStats, todayKey: string): FocusDailyStats {
  if (daily.dayKey === todayKey) return daily;
  return { dayKey: todayKey, minutesToday: 0 };
}

function addMinutes(daily: FocusDailyStats, todayKey: string, minutes: number): FocusDailyStats {
  const base = normalizeDaily(daily, todayKey);
  return {
    dayKey: todayKey,
    minutesToday: base.minutesToday + Math.max(0, minutes),
  };
}

export function clampFocusDurationMinutes(raw: number): number {
  if (!Number.isFinite(raw)) return 25;
  return Math.min(180, Math.max(5, Math.round(raw)));
}

export function sessionEndAtMs(session: FocusActiveSession): number {
  return session.startedAtMs + session.durationMinutes * 60_000;
}

export function getRemainingSeconds(session: FocusActiveSession, nowMs: number): number {
  const end = sessionEndAtMs(session);
  return Math.max(0, Math.ceil((end - nowMs) / 1000));
}

export function isSessionComplete(session: FocusActiveSession, nowMs: number): boolean {
  return getRemainingSeconds(session, nowMs) <= 0;
}

export function elapsedWholeMinutes(session: FocusActiveSession, nowMs: number): number {
  const elapsedSec = Math.max(0, Math.floor((nowMs - session.startedAtMs) / 1000));
  return Math.floor(elapsedSec / 60);
}

export function startFocusSession(
  focus: FocusPersisted,
  nowMs: number,
  durationMinutes: number,
  preset: FocusPreset,
): FocusPersisted {
  const todayKey = localDateKey(new Date(nowMs));
  return {
    daily: normalizeDaily(focus.daily, todayKey),
    active: {
      startedAtMs: nowMs,
      durationMinutes: clampFocusDurationMinutes(durationMinutes),
      preset,
    },
  };
}

/** Credit minutes and clear active session. */
export function endFocusSession(
  focus: FocusPersisted,
  nowMs: number,
  reason: FocusEndReason,
): FocusEndResult {
  const todayKey = localDateKey(new Date(nowMs));
  const session = focus.active;
  if (!session) {
    return { focus, minutesLogged: 0, reason };
  }

  let minutesLogged = 0;
  if (reason === 'complete' || reason === 'reconcile') {
    minutesLogged = session.durationMinutes;
  } else {
    minutesLogged = elapsedWholeMinutes(session, nowMs);
  }

  const next: FocusPersisted = {
    daily: addMinutes(focus.daily, todayKey, minutesLogged),
    active: null,
  };

  return { focus: next, minutesLogged, reason };
}

/** If app was closed mid-session, roll forward completion. */
export function reconcileFocusOnLoad(focus: FocusPersisted, nowMs: number): FocusEndResult | null {
  const session = focus.active;
  if (!session) return null;
  if (!isSessionComplete(session, nowMs)) return null;
  return endFocusSession(focus, nowMs, 'reconcile');
}

export function formatWorkFocusMemoryNote(userNote: string): string {
  const trimmed = userNote.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('Focus ·') ? trimmed : `Focus · ${trimmed}`;
}
