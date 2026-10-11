import type { ChatCompletionRequest, ChatCompletionResult, LlmConfig } from './types';
import { buildOpenAiMessages } from './prompt';
import { offlineReply } from './offlineBanter';
import { resolveChatCompletionsUrl } from './urls';

export { resolveChatCompletionsUrl } from './urls';

const LLM_TIMEOUT_MS = 45_000;
const MAX_TOKENS = 320;

export interface FetchCompletionResult {
  ok: boolean;
  content?: string;
  error?: string;
}

export async function fetchChatCompletion(
  config: LlmConfig,
  messages: ReturnType<typeof buildOpenAiMessages>,
): Promise<FetchCompletionResult> {
  const url = resolveChatCompletionsUrl(config.baseUrl);
  const apiKey = config.apiKey.trim();
  if (!url || !apiKey) {
    return { ok: false, error: 'missing-config' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model.trim() || 'gpt-4o-mini',
        messages,
        temperature: 0.85,
        max_tokens: MAX_TOKENS,
        stream: false,
      }),
    });

    const text = await res.text();
    if (!res.ok) {
      let detail = text.slice(0, 240);
      try {
        const j = JSON.parse(text) as { error?: { message?: string } };
        detail = j.error?.message ?? detail;
      } catch {
        /* keep raw slice */
      }
      return { ok: false, error: `HTTP ${res.status}: ${detail}` };
    }

    let json: { choices?: Array<{ message?: { content?: string } }> };
    try {
      json = JSON.parse(text) as { choices?: Array<{ message?: { content?: string } }> };
    } catch {
      return { ok: false, error: 'Response was not valid JSON — check base URL' };
    }

    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return { ok: false, error: 'Empty completion content' };
    }
    return { ok: true, content };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('abort')) {
      return { ok: false, error: 'Request timed out' };
    }
    return { ok: false, error: message };
  } finally {
    clearTimeout(timeout);
  }
}

export function isLlmConfigured(config: LlmConfig): boolean {
  return (
    config.enabled &&
    resolveChatCompletionsUrl(config.baseUrl) !== null &&
    config.apiKey.trim().length > 0
  );
}

export async function completeWithOpenAiOrOffline(
  request: ChatCompletionRequest,
  config: LlmConfig,
): Promise<ChatCompletionResult & { llmError?: string }> {
  if (!isLlmConfigured(config)) {
    return offlineReply(request);
  }

  const messages = buildOpenAiMessages(
    request.personaId,
    request.messages,
    request.userText,
    request.memorySnippet,
  );

  const fetched = await fetchChatCompletion(config, messages);
  if (fetched.ok && fetched.content) {
    return { reply: fetched.content, provider: 'llm' };
  }

  const offline = await offlineReply(request);
  const err = fetched.error ?? 'unknown error';
  return {
    reply: `${offline.reply}\n\n_(LLM unavailable: ${err.slice(0, 120)} — offline reply above.)_`,
    provider: 'offline',
    llmError: err,
  };
}
