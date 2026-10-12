import { useCompanionStore } from '../store/companionStore';
import { uiForMode, type UiPalette } from './palettes';

export function useUi(): UiPalette {
  const { themeMode } = useCompanionStore();
  return uiForMode(themeMode);
}
