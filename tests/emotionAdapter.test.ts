import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyzeUserText,
  parseEmotionTagFromReply,
  weightsToMorphTargets,
} from '../src/expression/emotionAdapter.ts';

test('analyzeUserText detects joy hints', () => {
  const snap = analyzeUserText('I am so happy today thanks!');
  assert.ok((snap.weights.joy ?? 0) > 0.5);
});

test('parseEmotionTagFromReply strips tag', () => {
  const { cleanText, weights } = parseEmotionTagFromReply('Hello [emotion:joy=0.8] friend');
  assert.equal(cleanText, 'Hello  friend');
  assert.ok((weights.joy ?? 0) >= 0.55);
});

test('parseEmotionTagFromReply infers from Cantonese text without tag', () => {
  const { weights, label } = parseEmotionTagFromReply('唔使驚，我喺度');
  assert.ok((weights.fear ?? 0) > 0.2 || (weights.affection ?? 0) > 0);
  assert.match(label, /Reply/);
});

test('weightsToMorphTargets includes Think channel', () => {
  const morphs = weightsToMorphTargets({ thinking: 0.7 });
  assert.equal(morphs.Think, 0.7);
});
