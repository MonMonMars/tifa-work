import type { LlmConfig } from './types';
import { buildOpenAiMessages } from './prompt';
import type { ChatCompletionRequest } from './types';
import { parseSseChatDelta } from './sseParse';
import { resolveChatCompletionsUrl } from './urls';

const LLM_STREAM_TIMEOUT_MS = 50_000;

export interface StreamCallbacks {
  onPartial: (accumulated: string) => void;
}

export { parseSseChatDelta } from './sseParse';

/**
 * OpenAI-compatible SSE streaming. Falls back to null when the runtime cannot stream.
 */
export async function fetchChatCompletionStreaming(
  config: LlmConfig,
  request: ChatCompletionRequest,
  callbacks: StreamCallbacks,
): Promise<{ ok: true; content: string } | { ok: false; error: string; partial?: string }> {
  const url = resolveChatCompletionsUrl(config.baseUrl);
  const apiKey = config.apiKey.trim();
  if (!url || !apiKey) {
    return { ok: false, error: 'missing-config' };
  }

  const messages = buildOpenAiMessages(
    request.personaId,
    request.messages,
    request.userText,
    request.memorySnippet,
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LLM_STREAM_TIMEOUT_MS);

  let accumulated = '';

  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        model: config.model.trim() || 'gpt-4o-mini',
        messages,
        temperature: 0.85,
        max_tokens: 320,
        stream: true,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }

    const body = res.body;
    if (!body || typeof body.getReader !== 'function') {
      return { ok: false, error: 'streaming-unavailable' };
    }

    const reader = body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const delta = parseSseChatDelta(line);
        if (delta) {
          accumulated += delta;
          callbacks.onPartial(accumulated);
        }
      }
    }

    const trimmed = accumulated.trim();
    if (!trimmed) {
      return { ok: false, error: 'Empty streamed completion', partial: accumulated };
    }
    return { ok: true, content: trimmed };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message, partial: accumulated || undefined };
  } finally {
    clearTimeout(timeout);
  }
}
