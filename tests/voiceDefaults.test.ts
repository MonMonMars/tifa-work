import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_VOICE_CONFIG } from '../src/services/voice/types.ts';
import { DEFAULT_PERSISTED } from '../src/store/persistedMerge.ts';

test('DEFAULT_VOICE_CONFIG matches persisted merge defaults', () => {
  assert.deepEqual(DEFAULT_PERSISTED.voiceConfig, DEFAULT_VOICE_CONFIG);
});
