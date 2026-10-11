import { Platform } from 'react-native';

/** Dark companion UI — aligned with aiva-companion / Amoji B2C direction. */
export const UI = {
  bg: '#0A0B10',
  bgDeep: '#05060A',
  surface: '#14151F',
  surfaceHi: '#1E202C',
  surfaceTop: '#262936',
  accent: '#FF2B4E',
  accentSoft: 'rgba(255,43,78,0.14)',
  accentLine: 'rgba(255,43,78,0.45)',
  ok: '#2FD07A',
  warn: '#FFB020',
  danger: '#FF2B4E',
  locked: '#565A70',
  text: '#F3F3F8',
  textMid: 'rgba(243,243,248,0.72)',
  textDim: '#8B8CA3',
  hairline: 'rgba(255,255,255,0.09)',
  rule: 'rgba(255,255,255,0.20)',
} as const;

export const inputFontSize = (design: number) => (Platform.OS === 'web' ? 16 : design);
