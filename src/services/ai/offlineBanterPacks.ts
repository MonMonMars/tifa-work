import type { PersonaId } from '../../domain/personas';
import type { BanterPack } from '../../domain/banterLocale';

const FOLLOW_UPS_EN: Record<PersonaId, string[]> = {
  mika: [
    'Want to tell me the part that stings most?',
    'What would a tiny win look like tonight?',
    'Should we stay with feelings or think about next steps?',
  ],
  ren: [
    "I'm not going anywhere — what's the headline?",
    'Want me to just listen, or bounce ideas?',
    'What would help you feel less alone with this?',
  ],
  luna: [
    'What is the one decision hiding inside this?',
    'Want a 2-minute plan or more venting first?',
    "What's the smallest next action you'd accept?",
  ],
};

const FOLLOW_UPS_ZH: Record<PersonaId, string[]> = {
  mika: [
    '邊一部分最令你不舒服？',
    '今晚有咩細小嘅開心位？',
    '想繼續講感受，定係諗點做？',
  ],
  ren: [
    '我喺度 — 最重要係邊一句？',
    '想我聽多陣，定係幫你諗？',
    '點樣會令你好過啲？',
  ],
  luna: [
    '入面藏住嘅決定係咩？',
    '要唔要兩分鐘計劃先？',
    '你接受嘅最小一步係咩？',
  ],
};

export const REPLY_TEMPLATES_EN: Record<PersonaId, string[]> = {
  mika: [
    "I hear you. [emotion:joy=0.5] That sounds like a lot to carry — I'm staying close.",
    "Thanks for telling me. Your feelings make sense to me.",
    'Mmm… what part of this feels heaviest in your chest?',
  ],
  ren: [
    "Got it. No judgment — just us, same team.",
    "That makes sense. What do you wish I'd say right now?",
    "I'm listening. Take your time — I've got you.",
  ],
  luna: [
    "Let's slow down. What's the core worry underneath?",
    "We can break this into one next step if you want.",
    "Noted. What would 'good enough' look like by tonight?",
  ],
};

export const REPLY_TEMPLATES_ZH: Record<PersonaId, string[]> = {
  mika: [
    '我聽到喇。[emotion:joy=0.45] 聽落真係唔輕鬆 — 我陪住你。',
    '多謝你同我講，咁樣Feel好合理。',
    '嗯… 邊一部分最壓住你？',
  ],
  ren: [
    '明白。唔使扮 — 我哋同一邊。',
    '合理嘅。你想我而家講咩先？',
    '我喺度聽。唔使急，有我。',
  ],
  luna: [
    '停一停。最底層嘅擔心係咩？',
    '想嘅話可以拆做下一步。',
    '收到。今晚「夠好」係點樣？',
  ],
};

/** Short lines when the user pokes the avatar on Home (no LLM). */
export const POKE_LINES_EN: Record<PersonaId, string[]> = {
  mika: ['Hey — I felt that. You okay?', 'Mmm? I’m here.', 'That tickled — talk to me?'],
  ren: ['Yo — you poking me?', 'I’m right here. What’s up?', 'Heh. Got my attention.'],
  luna: ['Noted. Need a minute to vent?', 'Tap accepted — what’s on your mind?', 'I’m listening. One thing at a time.'],
};

export const POKE_LINES_ZH: Record<PersonaId, string[]> = {
  mika: ['喂 — 我Feel到喇。好唔好呀？', '嗯？我喺度。', '呵，撩我 — 同我讲呀？'],
  ren: ['喂 — 戳我呀？', '我喺度。点呀？', '呵，留意到喇。'],
  luna: ['收到。想唔想讲多句？', 'Tap收到 — 谂紧咩？', '我听着。一件一件嚟。'],
};

export function buildAvatarPokeLine(personaId: PersonaId, pack: BanterPack, seed: number): string {
  const en = pickFromPool(POKE_LINES_EN[personaId], seed);
  if (pack === 'en') return en;
  const zh = pickFromPool(POKE_LINES_ZH[personaId], seed + 7);
  if (pack === 'zh-HK') return zh;
  return `${en}\n${zh}`;
}

export function pickFromPool<T>(arr: T[], seed: number): T {
  const idx = Math.abs(Math.floor(seed)) % arr.length;
  return arr[idx]!;
}

export function buildOfflineLine(
  personaId: PersonaId,
  pack: BanterPack,
  seed: number,
): { line: string; followUp: string } {
  const enLine = pickFromPool(REPLY_TEMPLATES_EN[personaId], seed);
  const enFollow = pickFromPool(FOLLOW_UPS_EN[personaId], seed + 1);
  if (pack === 'en') {
    return { line: enLine, followUp: enFollow };
  }
  const zhLine = pickFromPool(REPLY_TEMPLATES_ZH[personaId], seed + 2);
  const zhFollow = pickFromPool(FOLLOW_UPS_ZH[personaId], seed + 3);
  if (pack === 'zh-HK') {
    return { line: zhLine, followUp: zhFollow };
  }
  return {
    line: `${enLine}\n\n${zhLine}`,
    followUp: `${enFollow}\n${zhFollow}`,
  };
}
