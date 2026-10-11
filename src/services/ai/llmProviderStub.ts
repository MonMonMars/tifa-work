import type {
  ChatCompletionRequest,
  ChatCompletionResult,
  CompletionOptions,
  LlmConfig,
  LlmProvider,
} from './types';
import { completeWithOpenAiOrOffline, isLlmConfigured } from './openAiCompatible';

/** BYO OpenAI-compatible provider (Settings → AsyncStorage). Falls back to offline banter. */
export const openAiCompatibleProvider: LlmProvider = {
  id: 'openai-compatible',

  isConfigured(config: LlmConfig): boolean {
    return isLlmConfigured(config);
  },

  async complete(
    request: ChatCompletionRequest,
    config: LlmConfig,
    options?: CompletionOptions,
  ): Promise<ChatCompletionResult> {
    return completeWithOpenAiOrOffline(request, config, options);
  },
};

/** @deprecated alias — use openAiCompatibleProvider */
export const llmProviderStub = openAiCompatibleProvider;
