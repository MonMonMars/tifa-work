import type { CompletionOptions, LlmConfig } from './types';

export type ReplyRoute = 'offline' | 'llm-buffered' | 'llm-stream';

function hasValidBaseUrl(baseUrl: string): boolean {
  return baseUrl.trim().replace(/\/+$/, '').length > 0;
}

export function isLlmConfigured(config: LlmConfig): boolean {
  return config.enabled && hasValidBaseUrl(config.baseUrl) && config.apiKey.trim().length > 0;
}

export function pickReplyRoute(config: LlmConfig, options?: CompletionOptions): ReplyRoute {
  if (!isLlmConfigured(config)) {
    return 'offline';
  }
  const wantStream = (options?.preferStream ?? config.streamEnabled) && Boolean(options?.onPartial);
  return wantStream ? 'llm-stream' : 'llm-buffered';
}
