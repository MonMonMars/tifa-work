import assert from 'node:assert/strict';
import test from 'node:test';
import { THREAD_STORAGE_CAP, trimThreadForStorage } from '../src/domain/chatThreadLimits.ts';
import { createMessage } from '../src/domain/messages.ts';

test('trimThreadForStorage keeps short threads', () => {
  const msgs = [createMessage('user', 'hi')];
  assert.equal(trimThreadForStorage(msgs).length, 1);
});

test('trimThreadForStorage drops oldest beyond cap', () => {
  const msgs = Array.from({ length: THREAD_STORAGE_CAP + 5 }, (_, i) =>
    createMessage('user', `m${i}`),
  );
  const trimmed = trimThreadForStorage(msgs);
  assert.equal(trimmed.length, THREAD_STORAGE_CAP);
  assert.equal(trimmed[0]?.content, 'm5');
  assert.equal(trimmed[trimmed.length - 1]?.content, `m${THREAD_STORAGE_CAP + 4}`);
});
