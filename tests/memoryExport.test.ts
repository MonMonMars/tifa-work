import assert from 'node:assert/strict';
import test from 'node:test';
import { formatMemoryExportText } from '../src/services/memory/exportMemoryNotes.ts';

test('formatMemoryExportText empty notes', () => {
  const text = formatMemoryExportText([], { exportedAt: new Date('2026-10-11T12:00:00Z') });
  assert.match(text, /No saved notes/);
  assert.match(text, /Exported 2026-10-11/);
  assert.doesNotMatch(text, /sk-/);
});

test('formatMemoryExportText lists notes without secrets', () => {
  const text = formatMemoryExportText(['Likes tea', 'Name is Sam'], {
    personaName: 'Mika',
    exportedAt: new Date('2026-10-11T12:00:00Z'),
  });
  assert.match(text, /Active companion: Mika/);
  assert.match(text, /1\. Likes tea/);
  assert.match(text, /2\. Name is Sam/);
});
