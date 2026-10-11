import type { PersonaId } from '../../domain/personas';
import type { BanterPack } from '../../domain/banterLocale';
import { pickFromPool } from '../ai/offlineBanterPacks';

export type FocusBanterPhase = 'start' | 'complete' | 'abandon';

const START_EN: Record<PersonaId, string[]> = {
  mika: ['Deep breath — I’ve got you. One block at a time.', 'Let’s make this block gentle but real.', 'Phone down energy. I’m cheering quietly.'],
  ren: ['Locked in. You’ve got this block.', 'Timer’s on — I’m here when you surface.', 'Solid start. No guilt, just progress.'],
  luna: ['Focus block started. One outcome, one timer.', 'Clear desk, clear head — go.', '25 or 50, same rule: finish the block.'],
};

const COMPLETE_EN: Record<PersonaId, string[]> = {
  mika: ['You showed up — that counts. Stretch?', 'Block done. Proud of you.', 'Nice work. Want water before the next thing?'],
  ren: ['Block cleared. Respect.', 'That’s a win. Breathe.', 'Done. Take sixty seconds before jumping back in.'],
  luna: ['Session logged. Note one takeaway if you can.', 'Complete. What moved forward?', 'Good block. Capture a line for future-you?'],
};

const START_ZH: Record<PersonaId, string[]> = {
  mika: ['深呼吸 — 我陪住你，一段一段嚟。', '呢个 block 唔使完美，但要真。', '专心的 vibe，我喺度打气。'],
  ren: ['开波。呢个 block 你做得到。', '计时开始 — 完成再望我。', '稳阵开始，唔好内疚。'],
  luna: ['Focus block 开始。一个目标，一个钟。', '枱清，心清 — go。', '时间到就要收工呢个 block。'],
};

const ABANDON_EN: Record<PersonaId, string[]> = {
  mika: ['Hey — stopping early is okay. Want to try a shorter block?', 'No guilt. Reset and we can go again when you’re ready.', 'I’m still here. One minute of breathing counts too.'],
  ren: ['All good — you called it. Shorter sprint next time?', 'Stopping early beats burning out. Respect.', 'We can pick this up later — no lecture from me.'],
  luna: ['Logged what we had. Adjust the block length?', 'Early stop noted — what got in the way?', 'Fine to pause. Try 15m next if 25 felt heavy.'],
};

const ABANDON_ZH: Record<PersonaId, string[]> = {
  mika: ['早停都 OK — 试短啲 block？', '唔使内疚，准备好再嚟。', '我喺度 — 唞一口气都算数。'],
  ren: ['没问题 — 你话停就停。下次短 sprint？', '早停好过爆煲。', '迟啲再续 — 我唔会讲教。'],
  luna: ['记低咗。调短个 block？', '早停 — 边样阻住你？', '暂停 OK — 25 太重就试 15。'],
};

const COMPLETE_ZH: Record<PersonaId, string[]> = {
  mika: ['你出现咗就已经赢 — 伸展下？', 'Block 完成，好叻。', '做得好，饮啖水先？'],
  ren: ['Block 清咗。Respect。', '赢咗。唞一口气。', '完成 — 跳去下件事前停一分钟。'],
  luna: ['Session 记低咗。写一句 takeaway？', '完成。推进咗咩？', '好 block — 留低一句俾将来嘅你？'],
};

export function buildFocusCompanionLine(
  personaId: PersonaId,
  pack: BanterPack,
  phase: FocusBanterPhase,
  seed: number,
  tipsEnabled: boolean,
): string | null {
  if (!tipsEnabled) return null;

  const enPool =
    phase === 'start' ? START_EN[personaId] : phase === 'abandon' ? ABANDON_EN[personaId] : COMPLETE_EN[personaId];
  const en = pickFromPool(enPool, seed);
  if (pack === 'en') return en;

  const zhPool =
    phase === 'start' ? START_ZH[personaId] : phase === 'abandon' ? ABANDON_ZH[personaId] : COMPLETE_ZH[personaId];
  const zh = pickFromPool(zhPool, seed + 11);
  if (pack === 'zh-HK') return zh;

  return `${en}\n${zh}`;
}
