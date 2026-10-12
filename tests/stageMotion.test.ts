import assert from 'node:assert/strict';
import test from 'node:test';
import { pickEmotionTag, stageMotionFromWeights } from '../src/expression/stageMotion.ts';

test('stageMotionFromWeights boosts joy spin', () => {
  const calm = stageMotionFromWeights({ neutral: 0.8 });
  const happy = stageMotionFromWeights({ joy: 0.9, affection: 0.4 });
  assert.ok(happy.spin > calm.spin);
  assert.ok(happy.scaleBoost > calm.scaleBoost);
});

test('pickEmotionTag returns dominant key', () => {
  assert.equal(pickEmotionTag({ sadness: 0.7, neutral: 0.2 }), 'sadness');
});

test('pickEmotionTag omits neutral-only weights', () => {
  assert.equal(pickEmotionTag({ neutral: 0.9 }), undefined);
  assert.equal(pickEmotionTag({}), undefined);
});
