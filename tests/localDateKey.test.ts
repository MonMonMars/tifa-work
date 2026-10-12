import assert from 'node:assert/strict';
import test from 'node:test';
import { localDateKey, previousDayKey } from '../src/domain/localDateKey.ts';
import { localDateKey as streakKey } from '../src/services/checkIn/streak.ts';
import { endFocusSession, startFocusSession } from '../src/services/focus/focusSession.ts';
import { DEFAULT_PERSISTED } from '../src/store/persistedMerge.ts';

test('streak re-exports same localDateKey as domain', () => {
  const d = new Date(2026, 9, 11, 15, 30, 0);
  assert.equal(streakKey(d), localDateKey(d));
  assert.equal(streakKey(d), '2026-10-11');
});

test('focus session credits minutes under same localDateKey as check-in', () => {
  const t0 = Date.parse('2026-10-11T23:50:00');
  const t1 = Date.parse('2026-10-12T00:10:00');
  let focus = startFocusSession(DEFAULT_PERSISTED.focus, t0, 25, 'p25');
  const result = endFocusSession(focus, t1, 'complete');
  const dayKey = localDateKey(new Date(t1));
  assert.equal(result.focus.daily.dayKey, dayKey);
  assert.equal(result.focus.minutesByDay[dayKey], 25);
  assert.equal(previousDayKey('2026-10-12'), '2026-10-11');
});
