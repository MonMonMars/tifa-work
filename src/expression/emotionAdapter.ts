import type { EmotionWeights, ExpressionSnapshot } from './types';

export interface EmotionHint {
  pattern: RegExp;
  weights: EmotionWeights;
  label: string;
}

/** M5 hint table — English + Cantonese / 繁中 keywords (offline, no NLP API). */
export const EMOTION_HINTS: EmotionHint[] = [
  {
    pattern:
      /(?:\b(love|happy|glad|great|awesome|thanks|thank you|yay|nice|good)\b|開心|高興|多謝|唔該|好呀|正|❤|😊|🙂)/i,
    weights: { joy: 0.7, affection: 0.4 },
    label: 'Warm · happy',
  },
  {
    pattern: /(?:\b(sad|lonely|miss|cry|hurt|sorry)\b|唔開心|好慘|喊|傷心|寂寞|😢|😭)/i,
    weights: { sadness: 0.65, affection: 0.2 },
    label: 'Soft · concerned',
  },
  {
    pattern: /(?:\b(angry|mad|annoyed|ugh|wtf)\b|嬲|激死|好烦|好煩|😠)/i,
    weights: { anger: 0.55, surprise: 0.15 },
    label: 'Firm · listening',
  },
  {
    pattern: /(?:\b(wow|whoa|surprise|really)\b\??|嘩|真係|咁嘅|😮|!{2,})/i,
    weights: { surprise: 0.6, joy: 0.25 },
    label: 'Bright · surprised',
  },
  {
    pattern: /(?:\b(scared|afraid|worried|anxious|nervous)\b|驚|擔心|好驚|緊張|焦虑|焦慮|唔使驚)/i,
    weights: { fear: 0.5, sadness: 0.2 },
    label: 'Gentle · reassuring',
  },
  {
    pattern: /(?:\b(think|maybe|hmm|consider|plan|work|project)\b|諗|可能|不如|計劃|工作)/i,
    weights: { thinking: 0.55, neutral: 0.3 },
    label: 'Focused · thinking',
  },
  {
    pattern: /(?:\b(tired|exhausted|sleepy)\b|攰|好攰|想瞓|累)/i,
    weights: { sadness: 0.35, neutral: 0.45, thinking: 0.2 },
    label: 'Calm · tired',
  },
  {
    pattern: /(?:\b(cute|sweet|miss you)\b|掛住|好乖|錫|❤️|喺度)/i,
    weights: { affection: 0.65, joy: 0.35 },
    label: 'Tender · affection',
  },
];

const EMOTION_KEYS = [
  'joy',
  'sadness',
  'anger',
  'fear',
  'surprise',
  'disgust',
  'neutral',
  'affection',
  'thinking',
] as const;

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/** Score all matching hints and blend weights (M5 — stronger than first-match-only). */
export function scoreEmotionHints(text: string): {
  weights: EmotionWeights;
  label: string;
  matchCount: number;
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return { weights: { neutral: 0.9 }, label: 'Listening', matchCount: 0 };
  }

  const acc: EmotionWeights = {};
  const labels: string[] = [];
  let matchCount = 0;

  for (const hint of EMOTION_HINTS) {
    if (!hint.pattern.test(trimmed)) continue;
    matchCount += 1;
    labels.push(hint.label);
    for (const key of EMOTION_KEYS) {
      const v = hint.weights[key];
      if (v === undefined) continue;
      acc[key] = clamp01((acc[key] ?? 0) + v * 0.85);
    }
  }

  if (matchCount === 0) {
    return {
      weights: { neutral: 0.5, affection: 0.25 },
      label: 'Attentive · neutral',
      matchCount: 0,
    };
  }

  acc.neutral = clamp01((acc.neutral ?? 0.15) + Math.max(0, 0.35 - matchCount * 0.08));
  const label = matchCount > 1 ? `Mixed · ${labels[0]}` : (labels[0] ?? 'Expressive');

  return { weights: acc, label, matchCount };
}

export function blendEmotionWeights(a: EmotionWeights, b: EmotionWeights, bWeight: number): EmotionWeights {
  const t = clamp01(bWeight);
  const out: EmotionWeights = {};
  for (const key of EMOTION_KEYS) {
    const av = a[key] ?? 0;
    const bv = b[key] ?? 0;
    const mixed = av * (1 - t) + bv * t;
    if (mixed > 0.02) out[key] = clamp01(mixed);
  }
  return out;
}

function emotionNameToWeights(name: string, strength: number): EmotionWeights {
  const base: EmotionWeights = { neutral: clamp01(1 - strength * 0.5) };
  switch (name) {
    case 'joy':
      return { ...base, joy: strength };
    case 'sadness':
      return { ...base, sadness: strength };
    case 'anger':
      return { ...base, anger: strength };
    case 'fear':
      return { ...base, fear: strength };
    case 'surprise':
      return { ...base, surprise: strength };
    case 'affection':
      return { ...base, affection: strength };
    case 'thinking':
      return { ...base, thinking: strength };
    default:
      return { ...base, neutral: strength };
  }
}

export function analyzeUserText(text: string): ExpressionSnapshot {
  const scored = scoreEmotionHints(text);
  return {
    weights: scored.weights,
    label: scored.label,
    source: 'user_text',
    updatedAt: Date.now(),
  };
}

/** Parse optional [emotion:joy=0.8] tags and blend with reply text heuristics (M5). */
export function parseEmotionTagFromReply(reply: string): {
  cleanText: string;
  weights: EmotionWeights;
  label: string;
} {
  const tagMatch = reply.match(/\[emotion:([a-z]+)(?:=([0-9.]+))?\]/i);
  const cleanText = tagMatch ? reply.replace(tagMatch[0], '').trim() : reply;
  const textScored = scoreEmotionHints(cleanText);

  if (!tagMatch) {
    if (textScored.matchCount > 0) {
      return { cleanText, weights: textScored.weights, label: `Reply · ${textScored.label}` };
    }
    return {
      cleanText,
      weights: { affection: 0.35, joy: 0.25, neutral: 0.2 },
      label: 'Reply · warm',
    };
  }

  const name = tagMatch[1]?.toLowerCase() ?? 'neutral';
  const strength = clamp01(parseFloat(tagMatch[2] ?? '0.6'));
  const tagWeights = emotionNameToWeights(name, strength);
  const weights = blendEmotionWeights(tagWeights, textScored.weights, 0.3);

  return {
    cleanText,
    weights,
    label: `Reply · ${name}${textScored.matchCount > 0 ? ' + text' : ''}`,
  };
}

/** Map emotion weights to placeholder morph target keys (VRM blend shape names TBD). */
export function weightsToMorphTargets(
  weights: EmotionWeights,
  options?: { mouthOpen?: number },
): Record<string, number> {
  return {
    Joy: clamp01(weights.joy ?? 0),
    Sorrow: clamp01(weights.sadness ?? 0),
    Angry: clamp01(weights.anger ?? 0),
    Surprised: clamp01(weights.surprise ?? 0),
    Relaxed: clamp01(weights.neutral ?? 0.3),
    Fun: clamp01(weights.affection ?? 0.2),
    Think: clamp01(weights.thinking ?? 0),
    MouthOpen: clamp01(options?.mouthOpen ?? 0),
    Blink: 0,
  };
}
