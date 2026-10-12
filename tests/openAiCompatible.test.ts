import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveChatCompletionsUrl } from '../src/services/ai/urls.ts';
import { PROMPT_HISTORY_CAP, trimHistoryForPrompt } from '../src/services/ai/historyCap.ts';
import type { ChatMessage } from '../src/domain/messages.ts';

test('resolveChatCompletionsUrl normalizes base', () => {
  assert.equal(resolveChatCompletionsUrl('https://api.openai.com/v1'), 'https://api.openai.com/v1/chat/completions');
  assert.equal(
    resolveChatCompletionsUrl('https://api.openai.com/v1/'),
    'https://api.openai.com/v1/chat/completions',
  );
  assert.equal(
    resolveChatCompletionsUrl('https://x.com/v1/chat/completions'),
    'https://x.com/v1/chat/completions',
  );
  assert.equal(resolveChatCompletionsUrl('  '), null);
});

test('trimHistoryForPrompt caps length', () => {
  const msgs: ChatMessage[] = Array.from({ length: 20 }, (_, i) => ({
    id: `m${i}`,
    role: i % 2 === 0 ? 'user' : 'assistant',
    content: `line ${i}`,
    ts: i,
  }));
  const trimmed = trimHistoryForPrompt(msgs);
  assert.equal(trimmed.length, PROMPT_HISTORY_CAP);
  assert.equal(trimmed[0]?.content, 'line 12');
});
