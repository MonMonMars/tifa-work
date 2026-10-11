import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeUserText, parseEmotionTagFromReply } from '../src/expression/emotionAdapter.ts';

test('analyzeUserText detects joy hints', () => {
  const snap = analyzeUserText('I am so happy today thanks!');
  assert.ok((snap.weights.joy ?? 0) > 0.5);
});

test('parseEmotionTagFromReply strips tag', () => {
  const { cleanText, weights } = parseEmotionTagFromReply('Hello [emotion:joy=0.8] friend');
  assert.equal(cleanText, 'Hello  friend');
  assert.equal(weights.joy, 0.8);
});
