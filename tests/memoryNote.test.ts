import assert from 'node:assert/strict';
import test from 'node:test';
import {
  memoryTextsForPrompt,
  normalizeMemoryNotes,
  sortMemoryNotesForDisplay,
} from '../src/domain/memoryNote.ts';

test('normalizeMemoryNotes migrates legacy strings', () => {
  const notes = normalizeMemoryNotes([' hello ', { text: 'pinned', pinned: true }]);
  assert.equal(notes.length, 2);
  assert.equal(notes[0]!.text, 'hello');
  assert.equal(notes[1]!.pinned, true);
});

test('sortMemoryNotesForDisplay puts pinned first', () => {
  const sorted = sortMemoryNotesForDisplay([
    { text: 'a', pinned: false },
    { text: 'b', pinned: true },
    { text: 'c', pinned: false },
  ]);
  assert.equal(sorted[0]!.text, 'b');
});

test('memoryTextsForPrompt prefers pinned', () => {
  const texts = memoryTextsForPrompt(
    [
      { text: 'old', pinned: false },
      { text: 'keep', pinned: true },
    ],
    1,
  );
  assert.deepEqual(texts, ['keep']);
});
