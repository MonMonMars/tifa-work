/** Offline reply language pack — no external APIs. */
export type BanterPack = 'en' | 'zh-HK' | 'bilingual';

export const BANTER_PACK_LABELS: Record<BanterPack, string> = {
  en: 'English',
  'zh-HK': 'Cantonese (繁中)',
  bilingual: 'Bilingual EN + 廣東話',
};
