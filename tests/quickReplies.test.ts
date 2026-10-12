import assert from 'node:assert/strict';
import test from 'node:test';
import { getQuickReplies } from '../src/services/chat/quickReplies.ts';

test('getQuickReplies returns five lines for en pack', () => {
  const lines = getQuickReplies('mika', 'en');
  assert.equal(lines.length, 5);
  assert.ok(lines[0]!.includes('rough') || lines[0]!.length > 3);
});

test('getQuickReplies bilingual mixes en and zh', () => {
  const lines = getQuickReplies('ren', 'bilingual');
  assert.equal(lines.length, 5);
  assert.ok(lines.some((l) => /[\u4e00-\u9fff]/.test(l)));
  assert.ok(lines.some((l) => /^[A-Za-z]/.test(l)));
});

test('getQuickReplies covers all personas', () => {
  for (const id of ['mika', 'ren', 'luna'] as const) {
    assert.equal(getQuickReplies(id, 'zh-HK').length, 5);
  }
});
