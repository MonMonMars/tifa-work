import assert from 'node:assert/strict';
import test from 'node:test';
import { settingsMatches } from '../src/screens/settingsFilter.ts';

test('settingsMatches empty query shows all', () => {
  assert.equal(settingsMatches('', ['llm']), true);
  assert.equal(settingsMatches('   ', ['voice']), true);
});

test('settingsMatches filters by keyword substring', () => {
  assert.equal(settingsMatches('focus', ['work', 'focus', 'break']), true);
  assert.equal(settingsMatches('tts', ['voice', 'speak']), false);
  assert.equal(settingsMatches('speak', ['Speak replies']), true);
});
