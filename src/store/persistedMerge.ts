import type { ChatMessage } from '../domain/messages';
import type { PersonaId } from '../domain/personas';
import type { LlmConfig } from '../services/ai/types';
import type { VoiceConfig } from '../services/voice/types';

/** Keep in sync with `DEFAULT_VOICE_CONFIG` in `services/voice/types`. */
const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  ttsEnabled: true,
  rate: 1,
  locale: 'en-US',
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
}

export const DEFAULT_PERSISTED: PersistedState = {
  personaId: null,
  histories: {},
  memoryNotes: [],
  llmConfig: DEFAULT_LLM_CONFIG,
  voiceConfig: DEFAULT_VOICE_CONFIG,
  hasCompletedOnboarding: false,
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
  };
}
