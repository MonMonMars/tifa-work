import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PERSONA_ARCHETYPE,
  PERSONA_PROMPT_FLAVOR,
} from '../src/domain/personaFlavor.ts';

test('persona flavor tables cover all personas', () => {
  const ids = ['mika', 'ren', 'luna'] as const;
  for (const id of ids) {
    assert.ok(PERSONA_ARCHETYPE[id].length > 10);
    assert.ok(PERSONA_PROMPT_FLAVOR[id].length >= 3);
  }
  assert.match(PERSONA_ARCHETYPE.mika, /girlfriend/i);
  assert.match(PERSONA_ARCHETYPE.ren, /boyfriend/i);
  assert.match(PERSONA_ARCHETYPE.luna, /secretary|planner/i);
});
