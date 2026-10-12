import type { BanterPack } from '../../domain/banterLocale';
import type { PersonaId } from '../../domain/personas';

/** Short user messages — offline-friendly conversation starters per persona. */
const USER_PROMPTS_EN: Record<PersonaId, readonly string[]> = {
  mika: [
    'I had a rough day',
    'Something small made me smile',
    'Can we just chat?',
    'I need a little encouragement',
    'Help me untangle my thoughts',
  ],
  ren: [
    "Today was a lot — I'm listening",
    'I want to vent for a minute',
    'What should I do next?',
    'I feel stuck on something',
    'Celebrate a tiny win with me?',
  ],
  luna: [
    'Help me focus for a bit',
    'I need to plan my evening',
    'Work stress is creeping in',
    'What is one small next step?',
    'I want to slow down and breathe',
  ],
};

const USER_PROMPTS_ZH: Record<PersonaId, readonly string[]> = {
  mika: [
    '今日好攰',
    '有件小事令我開心',
    '陪傾下計好唔好？',
    '想要啲鼓勵',
    '個腦好亂，幫我理一理',
  ],
  ren: [
    '今日真係好多嘢',
    '想發洩一陣',
    '我下一步可以点做？',
    '有件事卡住我',
    '同我慶祝下小勝利？',
  ],
  luna: [
    '幫我集中一陣',
    '想計劃今晚',
    '工作壓力上嚟喇',
    '最小一步係咩？',
    '想慢落嚟唞一唞',
  ],
};

/** 3–5 persona-aware chips for the chat composer (works offline). */
export function getQuickReplies(personaId: PersonaId, pack: BanterPack): readonly string[] {
  const en = USER_PROMPTS_EN[personaId];
  const zh = USER_PROMPTS_ZH[personaId];
  switch (pack) {
    case 'en':
      return en.slice(0, 5);
    case 'zh-HK':
      return zh.slice(0, 5);
    case 'bilingual':
      return [...en.slice(0, 3), ...zh.slice(0, 2)] as readonly string[];
    default: {
      const _exhaustive: never = pack;
      return _exhaustive;
    }
  }
}
