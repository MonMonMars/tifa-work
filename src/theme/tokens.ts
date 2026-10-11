import { Platform } from 'react-native';
import { DARK_UI } from './palettes';

/** Default static dark tokens — prefer `useUi()` in screens for theme-aware UI. */
export const UI = DARK_UI;

export const inputFontSize = (design: number) => (Platform.OS === 'web' ? 16 : design);
