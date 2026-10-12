import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_PERSISTED,
  mergePersistedState,
  type PersistedState,
} from './persistedMerge';

export type { PersistedState } from './persistedMerge';
export {
  DEFAULT_LLM_CONFIG,
  DEFAULT_PERSISTED,
  mergePersistedState,
} from './persistedMerge';

const STORAGE_KEY = '@companion_b2c/v1';

export interface LoadPersistedResult {
  state: PersistedState;
  /** True when saved data was missing or unreadable — fresh defaults applied. */
  recoveredFromStorageIssue: boolean;
}

export async function loadPersistedState(): Promise<LoadPersistedResult> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { state: mergePersistedState(null), recoveredFromStorageIssue: false };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return { state: mergePersistedState(parsed), recoveredFromStorageIssue: false };
  } catch {
    return { state: mergePersistedState(null), recoveredFromStorageIssue: true };
  }
}

export async function savePersistedState(state: PersistedState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearPersistedState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
