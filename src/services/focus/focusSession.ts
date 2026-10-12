import { localDateKey, previousDayKey } from '../../domain/localDateKey.ts';

/** Shapes aligned with `types.ts` — kept here so Node unit tests avoid extensionless ESM imports. */
export type FocusPreset = 'p25' | 'p50' | 'custom';

export interface FocusActiveSession {
  startedAtMs: number;
  durationMinutes: number;
  preset: FocusPreset;
}

export interface FocusDailyStats {
  dayKey: string;
  minutesToday: number;
}

export interface FocusSoftBreak {
  startedAtMs: number;
  durationMinutes: number;
}

export interface FocusPersisted {
  daily: FocusDailyStats;
  minutesByDay: Record<string, number>;
  active: FocusActiveSession | null;
  activeBreak: FocusSoftBreak | null;
}

export const SOFT_BREAK_MINUTES = 5;

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

function trimMinutesByDay(
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

function applyLoggedMinutes(
  focus: FocusPersisted,
  todayKey: string,
  minutes: number,
): FocusPersisted {
  const add = Math.max(0, minutes);
  const daily = addMinutes(focus.daily, todayKey, add);
  const prevDay = focus.minutesByDay[todayKey] ?? 0;
  const minutesByDay = trimMinutesByDay(
    { ...focus.minutesByDay, [todayKey]: prevDay + add },
    todayKey,
    14,
  );
  return { ...focus, daily, minutesByDay };
}

export function isEarlyFocusAbandon(
  session: FocusActiveSession,
  nowMs: number,
  reason: FocusEndReason,
): boolean {
  if (reason !== 'stop') return false;
  const elapsed = elapsedWholeMinutes(session, nowMs);
  const planned = session.durationMinutes;
  const threshold = Math.max(3, Math.floor(planned * 0.5));
  return elapsed < threshold;
}

export function startSoftBreak(focus: FocusPersisted, nowMs: number): FocusPersisted {
  return {
    ...focus,
    activeBreak: { startedAtMs: nowMs, durationMinutes: SOFT_BREAK_MINUTES },
  };
}

export function dismissSoftBreak(focus: FocusPersisted): FocusPersisted {
  return { ...focus, activeBreak: null };
}

export function getBreakRemainingSeconds(
  brk: { startedAtMs: number; durationMinutes: number },
  nowMs: number,
): number {
  const end = brk.startedAtMs + brk.durationMinutes * 60_000;
  return Math.max(0, Math.ceil((end - nowMs) / 1000));
}

export function isBreakComplete(
  brk: { startedAtMs: number; durationMinutes: number },
  nowMs: number,
): boolean {
  return getBreakRemainingSeconds(brk, nowMs) <= 0;
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
    ...focus,
    daily: normalizeDaily(focus.daily, todayKey),
    activeBreak: null,
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

  let next = applyLoggedMinutes({ ...focus, active: null }, todayKey, minutesLogged);

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
