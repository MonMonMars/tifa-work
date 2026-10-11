import type { EmotionWeights } from './types';

export interface StageMotionParams {
  spin: number;
  bob: number;
  scaleBoost: number;
  tiltX: number;
  emissive: number;
  sadnessDroop: number;
  shake: number;
  dominant: keyof EmotionWeights | 'neutral';
}

function dominantEmotion(weights: EmotionWeights): keyof EmotionWeights | 'neutral' {
  const entries = Object.entries(weights).filter(([, v]) => (v ?? 0) > 0.05) as Array<
    [keyof EmotionWeights, number]
  >;
  if (entries.length === 0) return 'neutral';
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? 'neutral';
}

/** Maps expression weights → procedural avatar motion (until VRM blend shapes). */
export function stageMotionFromWeights(weights: EmotionWeights): StageMotionParams {
  const joy = weights.joy ?? 0;
  const sadness = weights.sadness ?? 0;
  const anger = weights.anger ?? 0;
  const fear = weights.fear ?? 0;
  const surprise = weights.surprise ?? 0;
  const affection = weights.affection ?? 0;
  const thinking = weights.thinking ?? 0;
  const neutral = weights.neutral ?? 0.2;

  const dominant = dominantEmotion(weights);

  return {
    spin: 0.35 + joy * 0.35 + surprise * 0.25 - thinking * 0.15,
    bob: 0.08 + joy * 0.06 + affection * 0.04,
    scaleBoost: joy * 0.08 + surprise * 0.1 + affection * 0.05 - sadness * 0.04,
    tiltX: sadness * 0.35 - joy * 0.08 + thinking * 0.05,
    emissive: anger * 0.35 + joy * 0.15 + surprise * 0.12,
    sadnessDroop: sadness * 0.25 + fear * 0.08,
    shake: fear * 0.12 + anger * 0.06,
    dominant: dominant === 'disgust' ? 'neutral' : dominant,
  };
}

export function pickEmotionTag(weights: EmotionWeights): string | undefined {
  const d = dominantEmotion(weights);
  return d === 'neutral' ? undefined : d;
}
