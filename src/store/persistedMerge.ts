import type { ChatMessage } from '../domain/messages';
import type { PersonaId } from '../domain/personas';
import type { LlmConfig } from '../services/ai/types';
import type { ThemeMode } from '../theme/palettes';
import type { VoiceConfig } from '../services/voice/types';

/** Duplicated shape — keep aligned with `services/checkIn/streak.ts` (avoid Node ESM import chain). */
export interface CheckInState {
  lastCheckInKey: string | null;
  currentStreak: number;
  longestStreak: number;
}

const DEFAULT_CHECK_IN: CheckInState = {
  lastCheckInKey: null,
  currentStreak: 0,
  longestStreak: 0,
};

/** Keep aligned with `services/notifications/types.ts`. */
export interface NotificationPrefs {
  checkInRemindersEnabled: boolean;
}

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  checkInRemindersEnabled: false,
};

/** Keep aligned with `services/focus/types.ts`. */
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
  tipsEnabled: boolean;
}

const DEFAULT_FOCUS: FocusPersisted = {
  daily: { dayKey: '', minutesToday: 0 },
  active: null,
};

const DEFAULT_WORK_COMPANION_PREFS: WorkCompanionPrefs = {
  tipsEnabled: true,
};

/** Keep in sync with `DEFAULT_VOICE_CONFIG` in `services/voice/types`. */
const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  ttsEnabled: true,
  rate: 1,
  locale: 'en-US',
  banterPack: 'bilingual',
};

export const DEFAULT_LLM_CONFIG: LlmConfig = {
  enabled: false,
  baseUrl: '',
  apiKey: '',
  model: 'gpt-4o-mini',
  streamEnabled: true,
};

export interface PersistedState {
  personaId: PersonaId | null;
  histories: Partial<Record<PersonaId, ChatMessage[]>>;
  memoryNotes: string[];
  llmConfig: LlmConfig;
  voiceConfig: VoiceConfig;
  hasCompletedOnboarding: boolean;
  /** First-run tips sheet shown before opening chat. */
  hasSeenPreChatTips: boolean;
  checkIn: CheckInState;
  themeMode: ThemeMode;
  notificationPrefs: NotificationPrefs;
  focus: FocusPersisted;
  workCompanion: WorkCompanionPrefs;
}

export const DEFAULT_PERSISTED: PersistedState = {
  personaId: null,
  histories: {},
  memoryNotes: [],
  llmConfig: DEFAULT_LLM_CONFIG,
  voiceConfig: DEFAULT_VOICE_CONFIG,
  hasCompletedOnboarding: false,
  hasSeenPreChatTips: false,
  checkIn: DEFAULT_CHECK_IN,
  themeMode: 'dark',
  notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
  focus: DEFAULT_FOCUS,
  workCompanion: DEFAULT_WORK_COMPANION_PREFS,
};

/** Pure merge for defaults — safe to unit test without AsyncStorage. */
export function mergePersistedState(parsed: Partial<PersistedState> | null | undefined): PersistedState {
  if (!parsed) {
    return { ...DEFAULT_PERSISTED };
  }
  return {
    ...DEFAULT_PERSISTED,
    ...parsed,
    llmConfig: { ...DEFAULT_LLM_CONFIG, ...parsed.llmConfig },
    voiceConfig: { ...DEFAULT_VOICE_CONFIG, ...parsed.voiceConfig },
    checkIn: { ...DEFAULT_CHECK_IN, ...parsed.checkIn },
    notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS, ...parsed.notificationPrefs },
    focus: {
      daily: { ...DEFAULT_FOCUS.daily, ...parsed.focus?.daily },
      active: parsed.focus?.active ?? null,
    },
    workCompanion: { ...DEFAULT_WORK_COMPANION_PREFS, ...parsed.workCompanion },
  };
}
