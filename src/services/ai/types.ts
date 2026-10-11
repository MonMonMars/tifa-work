import type { BanterPack } from '../../domain/banterLocale';
import type { ChatMessage } from '../../domain/messages';
import type { PersonaId } from '../../domain/personas';

export interface LlmConfig {
  /** When false, only offline banter is used. */
  enabled: boolean;
  baseUrl: string;
  apiKey: string;
  model: string;
  /** Try SSE streaming for LLM replies when supported (M3.5). */
  streamEnabled: boolean;
}

export interface CompletionOptions {
  onPartial?: (accumulated: string) => void;
  preferStream?: boolean;
}

export interface ChatCompletionRequest {
  personaId: PersonaId;
  messages: ChatMessage[];
  userText: string;
  memorySnippet?: string;
  banterPack?: BanterPack;
}

export interface ChatCompletionResult {
  reply: string;
  provider: 'offline' | 'llm';
  /** Set when LLM was configured but failed and offline fallback was used. */
  llmError?: string;
}

export interface LlmProvider {
  readonly id: string;
  isConfigured(config: LlmConfig): boolean;
  complete(
    request: ChatCompletionRequest,
    config: LlmConfig,
    options?: CompletionOptions,
  ): Promise<ChatCompletionResult>;
}
