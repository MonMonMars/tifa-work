import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clampFocusDurationMinutes,
  endFocusSession,
  getRemainingSeconds,
  isSessionComplete,
  reconcileFocusOnLoad,
  startFocusSession,
} from '../src/services/focus/focusSession.ts';
import { DEFAULT_PERSISTED } from '../src/store/persistedMerge.ts';

const DEFAULT_FOCUS = DEFAULT_PERSISTED.focus;

const T0 = new Date('2026-10-11T10:00:00').getTime();

test('startFocusSession sets active timer', () => {
  const next = startFocusSession(DEFAULT_FOCUS, T0, 25, 'p25');
  assert.ok(next.active);
  assert.equal(next.active?.durationMinutes, 25);
  assert.equal(getRemainingSeconds(next.active!, T0 + 60_000), 24 * 60);
});

test('isSessionComplete when time elapsed', () => {
  const focus = startFocusSession(DEFAULT_FOCUS, T0, 25, 'p25');
  const session = focus.active!;
  assert.equal(isSessionComplete(session, T0 + 25 * 60_000), true);
  assert.equal(isSessionComplete(session, T0 + 24 * 60_000), false);
});

test('endFocusSession complete credits full duration', () => {
  const focus = startFocusSession(DEFAULT_FOCUS, T0, 25, 'p25');
  const result = endFocusSession(focus, T0 + 25 * 60_000, 'complete');
  assert.equal(result.minutesLogged, 25);
  assert.equal(result.focus.active, null);
  assert.equal(result.focus.daily.minutesToday, 25);
});

test('endFocusSession stop credits elapsed whole minutes', () => {
  const focus = startFocusSession(DEFAULT_FOCUS, T0, 50, 'p50');
  const result = endFocusSession(focus, T0 + 18 * 60_000, 'stop');
  assert.equal(result.minutesLogged, 18);
  assert.equal(result.focus.daily.minutesToday, 18);
});

test('reconcileFocusOnLoad completes expired session', () => {
  const focus = startFocusSession(DEFAULT_FOCUS, T0, 25, 'p25');
  const result = reconcileFocusOnLoad(focus, T0 + 30 * 60_000);
  assert.ok(result);
  assert.equal(result!.minutesLogged, 25);
  assert.equal(result!.focus.active, null);
});

test('clampFocusDurationMinutes bounds input', () => {
  assert.equal(clampFocusDurationMinutes(3), 5);
  assert.equal(clampFocusDurationMinutes(999), 180);
  assert.equal(clampFocusDurationMinutes(42.7), 43);
});
