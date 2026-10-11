import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_LLM_CONFIG,
  mergePersistedState,
} from '../src/store/persistedMerge.ts';

test('mergePersistedState returns defaults when input is null', () => {
  const merged = mergePersistedState(null);
  assert.deepEqual(merged.llmConfig, DEFAULT_LLM_CONFIG);
  assert.equal(merged.personaId, null);
  assert.equal(merged.memoryNotes.length, 0);
});

test('mergePersistedState deep-merges llm and voice config', () => {
  const merged = mergePersistedState({
    personaId: 'luna',
    llmConfig: { enabled: true, apiKey: 'sk-local' },
    voiceConfig: { rate: 1.15 },
  });
  assert.equal(merged.personaId, 'luna');
  assert.equal(merged.llmConfig.enabled, true);
  assert.equal(merged.llmConfig.apiKey, 'sk-local');
  assert.equal(merged.llmConfig.model, DEFAULT_LLM_CONFIG.model);
  assert.equal(merged.voiceConfig.rate, 1.15);
});

test('mergePersistedState preserves memory notes array', () => {
  const merged = mergePersistedState({ memoryNotes: ['hello', 'world'] });
  assert.deepEqual(merged.memoryNotes, ['hello', 'world']);
});
