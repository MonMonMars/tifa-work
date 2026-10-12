import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAvatarPokeLine, buildOfflineLine } from '../src/services/ai/offlineBanterPacks.ts';

test('buildOfflineLine en pack is English only', () => {
  const { line } = buildOfflineLine('mika', 'en', 42);
  assert.match(line, /I hear you|Thanks|interesting/i);
  assert.doesNotMatch(line, /我聽到/);
});

test('buildOfflineLine zh-HK pack is Cantonese', () => {
  const { line } = buildOfflineLine('mika', 'zh-HK', 42);
  assert.match(line, /[\u4e00-\u9fff]/);
});

test('buildAvatarPokeLine respects banter pack', () => {
  const en = buildAvatarPokeLine('mika', 'en', 3);
  assert.match(en, /here|Hey|okay/i);
  const zh = buildAvatarPokeLine('mika', 'zh-HK', 3);
  assert.match(zh, /[\u4e00-\u9fff]/);
});

test('buildOfflineLine bilingual includes both', () => {
  const { line, followUp } = buildOfflineLine('ren', 'bilingual', 7);
  assert.match(line, /Got it|明白/);
  assert.ok(followUp.includes('?') || followUp.includes('？'));
});
