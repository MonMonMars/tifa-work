/** Canonical emotion weights (0–1) for avatar morph / VRM blend shapes. */
export type EmotionWeights = Partial<
  Record<
    | 'joy'
    | 'sadness'
    | 'anger'
    | 'fear'
    | 'surprise'
    | 'disgust'
    | 'neutral'
    | 'affection'
    | 'thinking',
    number
  >
>;

export interface ExpressionSnapshot {
  weights: EmotionWeights;
  /** Human-readable label for debug UI until VRM is wired. */
  label: string;
  /** Source of the current expression (chat reply, idle, user poke, etc.). */
  source: 'idle' | 'reply' | 'user_text' | 'manual';
  updatedAt: number;
}

export const IDLE_EXPRESSION: ExpressionSnapshot = {
  weights: { neutral: 0.85, affection: 0.15 },
  label: 'Idle · soft smile',
  source: 'idle',
  updatedAt: 0,
};
