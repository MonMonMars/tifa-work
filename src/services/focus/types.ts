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

export interface FocusPersisted {
  daily: FocusDailyStats;
  active: FocusActiveSession | null;
}

export interface WorkCompanionPrefs {
  /** Encouraging offline lines on focus start/complete. */
  tipsEnabled: boolean;
}

export const DEFAULT_FOCUS: FocusPersisted = {
  daily: { dayKey: '', minutesToday: 0 },
  active: null,
};

export const DEFAULT_WORK_COMPANION_PREFS: WorkCompanionPrefs = {
  tipsEnabled: true,
};
