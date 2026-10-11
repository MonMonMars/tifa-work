import assert from 'node:assert/strict';
import test from 'node:test';
import { buildFocusLast7Days, previousDayKey } from '../src/services/focus/focusHistory.ts';

test('buildFocusLast7Days returns seven entries ending today', () => {
  const days = buildFocusLast7Days({ '2026-10-11': 30, '2026-10-09': 10 }, '2026-10-11');
  assert.equal(days.length, 7);
  assert.equal(days[6]?.dayKey, '2026-10-11');
  assert.equal(days[6]?.minutes, 30);
  assert.equal(days[4]?.minutes, 10);
});

test('previousDayKey crosses month', () => {
  assert.equal(previousDayKey('2026-03-01'), '2026-02-28');
});
