import assert from 'node:assert/strict';
import test from 'node:test';
import { lipSyncAmountFromPhase } from '../src/expression/lipSyncStub.ts';

test('lipSyncAmountFromPhase is zero when not speaking', () => {
  assert.equal(lipSyncAmountFromPhase(1.5, false), 0);
});

test('lipSyncAmountFromPhase oscillates when speaking', () => {
  const a = lipSyncAmountFromPhase(0, true);
  const b = lipSyncAmountFromPhase(0.12, true);
  assert.ok(a >= 0.25 && a <= 0.85);
  assert.notEqual(a, b);
});
