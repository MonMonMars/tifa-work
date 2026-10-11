import type { ChatCompletionRequest, ChatCompletionResult, LlmConfig, LlmProvider } from './types';
import { completeWithOpenAiOrOffline, isLlmConfigured } from './openAiCompatible';

/** BYO OpenAI-compatible provider (Settings → AsyncStorage). Falls back to offline banter. */
export const openAiCompatibleProvider: LlmProvider = {
  id: 'openai-compatible',

  isConfigured(config: LlmConfig): boolean {
    return isLlmConfigured(config);
  },

  async complete(request: ChatCompletionRequest, config: LlmConfig): Promise<ChatCompletionResult> {
    return completeWithOpenAiOrOffline(request, config);
  },
};

/** @deprecated alias — use openAiCompatibleProvider */
export const llmProviderStub = openAiCompatibleProvider;
