import type { PersonaId } from '../../domain/personas';
import type { BanterPack } from '../../domain/banterLocale';

const FOLLOW_UPS_EN = [
  'What would feel most helpful right now — venting or planning?',
  'Tell me one small thing that went okay today.',
  'Want to keep going, or switch topics?',
];

const FOLLOW_UPS_ZH = [
  '而家最想傾下，定係諗下點做？',
  '講一件今日還算 OK 嘅小事俾我聽？',
  '想繼續聊，定係轉個話題？',
];

export const REPLY_TEMPLATES_EN: Record<PersonaId, string[]> = {
  mika: [
    "I hear you. [emotion:joy=0.5] That sounds like a lot to carry.",
    "Thanks for sharing that with me — I'm right here.",
    'Mmm, interesting. What part of it bothers you most?',
  ],
  ren: [
    "Got it. No judgment — just us talking.",
    "That makes sense. What do you wish had gone differently?",
    "I'm listening. Take your time.",
  ],
  luna: [
    "Let's slow down for a second. What's the core worry?",
    "We can break it into one next step if you want.",
    "Noted. What would 'good enough' look like today?",
  ],
};

export const REPLY_TEMPLATES_ZH: Record<PersonaId, string[]> = {
  mika: [
    '我聽到喇。[emotion:joy=0.45] 聽落真係唔輕鬆。',
    '多謝你同我講 — 我喺度陪住你。',
    '嗯… 邊一部分最令你不舒服？',
  ],
  ren: [
    '明白。唔使扮嘢 — 我哋慢慢傾。',
    '合理嘅。如果重嚟，你希望點樣？',
    '我喺度聽。唔使急。',
  ],
  luna: [
    '停一停先。最核心嘅擔心係咩？',
    '想嘅話可以拆做下一步。',
    '收到。今日「夠好」係點樣？',
  ],
};

export function pickFromPool<T>(arr: T[], seed: number): T {
  const idx = Math.abs(Math.floor(seed)) % arr.length;
  return arr[idx]!;
}

/** Deterministic-ish pick for tests when seed provided. */
export function buildOfflineLine(
  personaId: PersonaId,
  pack: BanterPack,
  seed: number,
): { line: string; followUp: string } {
  const enLine = pickFromPool(REPLY_TEMPLATES_EN[personaId], seed);
  const enFollow = pickFromPool(FOLLOW_UPS_EN, seed + 1);
  if (pack === 'en') {
    return { line: enLine, followUp: enFollow };
  }
  const zhLine = pickFromPool(REPLY_TEMPLATES_ZH[personaId], seed + 2);
  const zhFollow = pickFromPool(FOLLOW_UPS_ZH, seed + 3);
  if (pack === 'zh-HK') {
    return { line: zhLine, followUp: zhFollow };
  }
  return {
    line: `${enLine}\n\n${zhLine}`,
    followUp: `${enFollow}\n${zhFollow}`,
  };
}
