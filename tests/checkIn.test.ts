import assert from 'node:assert/strict';
import test from 'node:test';
import { applyCheckIn, localDateKey, previousDayKey } from '../src/services/checkIn/streak.ts';

test('applyCheckIn starts streak at 1', () => {
  const today = '2026-10-11';
  const r = applyCheckIn({ lastCheckInKey: null, currentStreak: 0, longestStreak: 0 }, today);
  assert.equal(r.state.currentStreak, 1);
  assert.equal(r.state.lastCheckInKey, today);
  assert.equal(r.alreadyCheckedIn, false);
});

test('applyCheckIn increments consecutive days', () => {
  const r = applyCheckIn(
    { lastCheckInKey: '2026-10-10', currentStreak: 3, longestStreak: 5 },
    '2026-10-11',
  );
  assert.equal(r.state.currentStreak, 4);
  assert.equal(r.state.longestStreak, 5);
});

test('applyCheckIn resets after gap', () => {
  const r = applyCheckIn(
    { lastCheckInKey: '2026-10-08', currentStreak: 9, longestStreak: 9 },
    '2026-10-11',
  );
  assert.equal(r.state.currentStreak, 1);
});

test('applyCheckIn idempotent same day', () => {
  const state = { lastCheckInKey: '2026-10-11', currentStreak: 2, longestStreak: 2 };
  const r = applyCheckIn(state, '2026-10-11');
  assert.equal(r.alreadyCheckedIn, true);
  assert.deepEqual(r.state, state);
});

test('localDateKey format', () => {
  const key = localDateKey(new Date(2026, 9, 11));
  assert.equal(key, '2026-10-11');
});

test('previousDayKey crosses month boundary', () => {
  assert.equal(previousDayKey('2026-10-01'), '2026-09-30');
});

test('applyCheckIn consecutive across month boundary', () => {
  const r = applyCheckIn(
    { lastCheckInKey: '2026-09-30', currentStreak: 5, longestStreak: 5 },
    '2026-10-01',
  );
  assert.equal(r.state.currentStreak, 6);
});

test('applyCheckIn same calendar day different times is idempotent', () => {
  const morning = localDateKey(new Date(2026, 9, 11, 8, 0, 0));
  const evening = localDateKey(new Date(2026, 9, 11, 23, 59, 0));
  assert.equal(morning, evening);
  const first = applyCheckIn(
    { lastCheckInKey: null, currentStreak: 0, longestStreak: 0 },
    morning,
  );
  const second = applyCheckIn(first.state, evening);
  assert.equal(second.alreadyCheckedIn, true);
});
