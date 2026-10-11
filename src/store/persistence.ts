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

export async function loadPersistedState(): Promise<PersistedState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return mergePersistedState(null);
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return mergePersistedState(parsed);
  } catch {
    return mergePersistedState(null);
  }
}

export async function savePersistedState(state: PersistedState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearPersistedState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
