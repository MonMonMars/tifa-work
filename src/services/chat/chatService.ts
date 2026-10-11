import type { ChatMessage } from '../../domain/messages';
import { createMessage } from '../../domain/messages';
import type { PersonaId } from '../../domain/personas';
import { parseEmotionTagFromReply } from '../../expression/emotionAdapter';
import type { ExpressionSnapshot } from '../../expression/types';
import { openAiCompatibleProvider } from '../ai/llmProviderStub';
import type { LlmConfig } from '../ai/types';

export interface SendMessageInput {
  personaId: PersonaId;
  userText: string;
  history: ChatMessage[];
  llmConfig: LlmConfig;
  memorySnippet?: string;
}

export interface SendMessageOutput {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  expression: ExpressionSnapshot;
  provider: 'offline' | 'llm';
  llmError?: string;
}

export async function sendCompanionMessage(input: SendMessageInput): Promise<SendMessageOutput> {
  const userMessage = createMessage('user', input.userText.trim());

  const result = await openAiCompatibleProvider.complete(
    {
      personaId: input.personaId,
      messages: input.history,
      userText: input.userText,
      memorySnippet: input.memorySnippet,
    },
    input.llmConfig,
  );

  const parsed = parseEmotionTagFromReply(result.reply);
  const assistantMessage = createMessage('assistant', parsed.cleanText, {
    emotionTag: Object.keys(parsed.weights)[0],
  });

  const expression: ExpressionSnapshot = {
    weights: parsed.weights,
    label: parsed.label,
    source: 'reply',
    updatedAt: Date.now(),
  };

  return {
    userMessage,
    assistantMessage,
    expression,
    provider: result.provider,
    llmError: result.llmError,
  };
}
