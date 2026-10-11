import assert from 'node:assert/strict';
import test from 'node:test';
import { extractMemoryNote } from '../src/services/ai/memoryExtract.ts';

test('extractMemoryNote catches name', () => {
  const note = extractMemoryNote('Hi! My name is Mon and I work in design.');
  assert.ok(note?.includes('Mon'));
});
