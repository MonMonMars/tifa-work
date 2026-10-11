import type { ChatCompletionRequest, ChatCompletionResult, LlmConfig, LlmProvider } from './types';
import { offlineReply } from './offlineBanter';

/**
 * BYO OpenAI-compatible LLM — not wired to network in M1.
 * Settings UI collects baseUrl/apiKey/model; M3 will implement fetch here.
 */
export const llmProviderStub: LlmProvider = {
  id: 'openai-compatible',

  isConfigured(config: LlmConfig): boolean {
    return config.enabled && config.baseUrl.trim().length > 0 && config.apiKey.trim().length > 0;
  },

  async complete(request: ChatCompletionRequest, config: LlmConfig): Promise<ChatCompletionResult> {
    if (!this.isConfigured(config)) {
      return offlineReply(request);
    }

    // Stub: never call external APIs without explicit M3 implementation + user keys on device.
    void config;
    return {
      reply:
        `[LLM stub] Keys are saved locally but network chat is not enabled in v0.1. ` +
        `Your message was: "${request.userText.slice(0, 120)}"\n\n` +
        `(Next: wire fetch to ${config.baseUrl} with model ${config.model || 'default'}.)`,
      provider: 'stub',
    };
  },
};
