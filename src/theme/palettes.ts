export type ThemeMode = 'dark' | 'light';

/** Dark companion UI — default Weepo look. */
export const DARK_UI = {
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

/** Light mode — same accent, softer surfaces for daytime. */
export const LIGHT_UI = {
  bg: '#F4F4F8',
  bgDeep: '#E8E8F0',
  surface: '#FFFFFF',
  surfaceHi: '#F0F0F6',
  surfaceTop: '#E4E4EE',
  accent: '#E0244B',
  accentSoft: 'rgba(224,36,75,0.12)',
  accentLine: 'rgba(224,36,75,0.35)',
  ok: '#1FA862',
  warn: '#D99000',
  danger: '#E0244B',
  locked: '#9A9CB0',
  text: '#12131A',
  textMid: 'rgba(18,19,26,0.75)',
  textDim: '#5C5E72',
  hairline: 'rgba(0,0,0,0.08)',
  rule: 'rgba(0,0,0,0.15)',
} as const;

export type UiPalette = {
  readonly bg: string;
  readonly bgDeep: string;
  readonly surface: string;
  readonly surfaceHi: string;
  readonly surfaceTop: string;
  readonly accent: string;
  readonly accentSoft: string;
  readonly accentLine: string;
  readonly ok: string;
  readonly warn: string;
  readonly danger: string;
  readonly locked: string;
  readonly text: string;
  readonly textMid: string;
  readonly textDim: string;
  readonly hairline: string;
  readonly rule: string;
};

export function uiForMode(mode: ThemeMode): UiPalette {
  return mode === 'light' ? LIGHT_UI : DARK_UI;
}
