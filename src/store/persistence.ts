import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMessage } from '../domain/messages';
import type { PersonaId } from '../domain/personas';
import type { LlmConfig } from '../services/ai/types';
import { DEFAULT_VOICE_CONFIG, type VoiceConfig } from '../services/voice/types';

const STORAGE_KEY = '@companion_b2c/v1';

export interface PersistedState {
  personaId: PersonaId | null;
  histories: Partial<Record<PersonaId, ChatMessage[]>>;
  memoryNotes: string[];
  llmConfig: LlmConfig;
  voiceConfig: VoiceConfig;
  hasCompletedOnboarding: boolean;
}

export const DEFAULT_LLM_CONFIG: LlmConfig = {
  enabled: false,
  baseUrl: '',
  apiKey: '',
  model: 'gpt-4o-mini',
  streamEnabled: true,
};

export const DEFAULT_PERSISTED: PersistedState = {
  personaId: null,
  histories: {},
  memoryNotes: [],
  llmConfig: DEFAULT_LLM_CONFIG,
  voiceConfig: DEFAULT_VOICE_CONFIG,
  hasCompletedOnboarding: false,
};

export async function loadPersistedState(): Promise<PersistedState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_PERSISTED };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      ...DEFAULT_PERSISTED,
      ...parsed,
      llmConfig: { ...DEFAULT_LLM_CONFIG, ...parsed.llmConfig },
      voiceConfig: { ...DEFAULT_VOICE_CONFIG, ...parsed.voiceConfig },
    };
  } catch {
    return { ...DEFAULT_PERSISTED };
  }
}

export async function savePersistedState(state: PersistedState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
