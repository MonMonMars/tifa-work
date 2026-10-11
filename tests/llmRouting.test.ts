import assert from 'node:assert/strict';
import test from 'node:test';
import { isLlmConfigured, pickReplyRoute } from '../src/services/ai/routingPure.ts';
import type { LlmConfig } from '../src/services/ai/types.ts';

const baseConfig: LlmConfig = {
  enabled: true,
  baseUrl: 'https://api.example.com/v1',
  apiKey: 'sk-test',
  model: 'gpt-4o-mini',
  streamEnabled: true,
};

test('isLlmConfigured requires key and url', () => {
  assert.equal(isLlmConfigured({ ...baseConfig, apiKey: '' }), false);
  assert.equal(isLlmConfigured(baseConfig), true);
});

test('pickReplyRoute offline when LLM not configured', () => {
  assert.equal(pickReplyRoute({ ...baseConfig, enabled: false }), 'offline');
});

test('pickReplyRoute stream when enabled and onPartial', () => {
  assert.equal(pickReplyRoute(baseConfig, { onPartial: () => {} }), 'llm-stream');
});

test('pickReplyRoute buffered when stream off', () => {
  assert.equal(
    pickReplyRoute({ ...baseConfig, streamEnabled: false }, { onPartial: () => {} }),
    'llm-buffered',
  );
});
