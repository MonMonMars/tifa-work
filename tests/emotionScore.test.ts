import assert from 'node:assert/strict';
import test from 'node:test';
import { scoreEmotionHints } from '../src/expression/emotionAdapter.ts';

test('scoreEmotionHints detects Cantonese joy', () => {
  const r = scoreEmotionHints('今日好開心呀，多謝你陪住我');
  assert.ok((r.weights.joy ?? 0) > 0.4);
  assert.ok(r.matchCount >= 1);
});

test('scoreEmotionHints blends multiple hints', () => {
  const r = scoreEmotionHints('I am happy but also worried and 好攰');
  assert.ok(r.matchCount >= 2);
  assert.ok((r.weights.joy ?? 0) > 0);
  assert.ok((r.weights.fear ?? 0) > 0 || (r.weights.sadness ?? 0) > 0);
});

test('scoreEmotionHints handles tired Cantonese', () => {
  const r = scoreEmotionHints('好攰，想瞓');
  assert.ok((r.weights.sadness ?? 0) > 0.2 || (r.weights.neutral ?? 0) > 0.2);
});
