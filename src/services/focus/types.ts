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
  /** Rolling local-day totals (device only). */
  minutesByDay: Record<string, number>;
  active: FocusActiveSession | null;
  activeBreak: FocusSoftBreak | null;
}

export interface WorkCompanionPrefs {
  /** Encouraging offline lines on focus start/complete. */
  tipsEnabled: boolean;
  /** 5-minute soft break countdown after a completed focus block. */
  breakReminderEnabled: boolean;
}

export const DEFAULT_FOCUS: FocusPersisted = {
  daily: { dayKey: '', minutesToday: 0 },
  minutesByDay: {},
  active: null,
  activeBreak: null,
};

export const DEFAULT_WORK_COMPANION_PREFS: WorkCompanionPrefs = {
  tipsEnabled: true,
  breakReminderEnabled: false,
};

export const SOFT_BREAK_MINUTES = 5;
