import assert from 'node:assert/strict';
import test from 'node:test';
import { parseSseChatDelta } from '../src/services/ai/sseParse.ts';

test('parseSseChatDelta extracts content', () => {
  const line = 'data: {"choices":[{"delta":{"content":"Hi"}}]}';
  assert.equal(parseSseChatDelta(line), 'Hi');
});

test('parseSseChatDelta ignores DONE', () => {
  assert.equal(parseSseChatDelta('data: [DONE]'), null);
});
