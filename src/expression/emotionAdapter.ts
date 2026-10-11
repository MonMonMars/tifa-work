import type { EmotionWeights, ExpressionSnapshot } from './types';

/**
 * Thin adapter toward @amoji/emotion-core / amoji-expression-engine formulas.
 * M5 will replace keyword heuristics with shared formula output → morph targets.
 */
const KEYWORD_HINTS: Array<{ pattern: RegExp; weights: EmotionWeights; label: string }> = [
  {
    pattern: /\b(love|happy|glad|great|awesome|thanks|thank you|❤|😊|🙂)\b/i,
    weights: { joy: 0.7, affection: 0.4 },
    label: 'Warm · happy',
  },
  {
    pattern: /\b(sad|lonely|miss|cry|hurt|sorry|😢|😭)\b/i,
    weights: { sadness: 0.65, affection: 0.2 },
    label: 'Soft · concerned',
  },
  {
    pattern: /\b(angry|mad|annoyed|ugh|wtf|😠)\b/i,
    weights: { anger: 0.55, surprise: 0.15 },
    label: 'Firm · listening',
  },
  {
    pattern: /\b(wow|whoa|surprise|really\?|😮|!{2,})/i,
    weights: { surprise: 0.6, joy: 0.25 },
    label: 'Bright · surprised',
  },
  {
    pattern: /\b(scared|afraid|worried|anxious|nervous)\b/i,
    weights: { fear: 0.5, sadness: 0.2 },
    label: 'Gentle · reassuring',
  },
  {
    pattern: /\b(think|maybe|hmm|consider|plan|work|project)\b/i,
    weights: { thinking: 0.55, neutral: 0.3 },
    label: 'Focused · thinking',
  },
];

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
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
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      weights: { neutral: 0.9 },
      label: 'Listening',
      source: 'user_text',
      updatedAt: Date.now(),
    };
  }

  for (const hint of KEYWORD_HINTS) {
    if (hint.pattern.test(trimmed)) {
      return {
        weights: hint.weights,
        label: hint.label,
        source: 'user_text',
        updatedAt: Date.now(),
      };
    }
  }

  return {
    weights: { neutral: 0.5, affection: 0.25 },
    label: 'Attentive · neutral',
    source: 'user_text',
    updatedAt: Date.now(),
  };
}

/** Parse optional [emotion:joy=0.8] style tags from assistant replies (future LLM). */
export function parseEmotionTagFromReply(reply: string): {
  cleanText: string;
  weights: EmotionWeights;
  label: string;
} {
  const tagMatch = reply.match(/\[emotion:([a-z]+)(?:=([0-9.]+))?\]/i);
  if (!tagMatch) {
    return {
      cleanText: reply,
      weights: { affection: 0.35, joy: 0.25, neutral: 0.2 },
      label: 'Reply · warm',
    };
  }

  const name = tagMatch[1]?.toLowerCase() ?? 'neutral';
  const strength = clamp01(parseFloat(tagMatch[2] ?? '0.6'));
  const cleanText = reply.replace(tagMatch[0], '').trim();

  const weights: EmotionWeights = emotionNameToWeights(name, strength);
  return {
    cleanText,
    weights,
    label: `Reply · ${name}`,
  };
}

/** Map emotion weights to placeholder morph target keys (VRM blend shape names TBD). */
export function weightsToMorphTargets(weights: EmotionWeights): Record<string, number> {
  return {
    Joy: clamp01(weights.joy ?? 0),
    Sorrow: clamp01(weights.sadness ?? 0),
    Angry: clamp01(weights.anger ?? 0),
    Surprised: clamp01(weights.surprise ?? 0),
    Relaxed: clamp01(weights.neutral ?? 0.3),
    Fun: clamp01(weights.affection ?? 0.2),
    Blink: 0,
  };
}
