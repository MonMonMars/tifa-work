import assert from 'node:assert/strict';
import test from 'node:test';
import { stripForSpeech } from '../src/services/voice/speechText.ts';

test('stripForSpeech removes emotion tags', () => {
  const out = stripForSpeech('Hello [emotion:joy=0.8] there!');
  assert.equal(out, 'Hello there!');
});
