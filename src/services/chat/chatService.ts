import type { ChatMessage } from '../../domain/messages';
import { createMessage } from '../../domain/messages';
import type { PersonaId } from '../../domain/personas';
import { parseEmotionTagFromReply } from '../../expression/emotionAdapter';
import { pickEmotionTag } from '../../expression/stageMotion';
import type { ExpressionSnapshot } from '../../expression/types';
import type { CompletionOptions, LlmConfig } from '../ai/types';
import { openAiCompatibleProvider } from '../ai/llmProviderStub';

export interface SendMessageInput {
  personaId: PersonaId;
  userText: string;
  history: ChatMessage[];
  llmConfig: LlmConfig;
  memorySnippet?: string;
  completionOptions?: CompletionOptions;
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
    input.completionOptions,
  );

  const parsed = parseEmotionTagFromReply(result.reply);
  const emotionTag = pickEmotionTag(parsed.weights);
  const assistantMessage = createMessage('assistant', parsed.cleanText, { emotionTag });

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

/** Build assistant shell for streaming UI (content filled via onPartial). */
export function createStreamingAssistantShell(): ChatMessage {
  return createMessage('assistant', '…');
}

export function applyReplyToAssistant(
  shell: ChatMessage,
  reply: string,
): { message: ChatMessage; expression: ExpressionSnapshot } {
  const parsed = parseEmotionTagFromReply(reply);
  const emotionTag = pickEmotionTag(parsed.weights);
  const message: ChatMessage = {
    ...shell,
    content: parsed.cleanText,
    emotionTag,
    ts: Date.now(),
  };
  const expression: ExpressionSnapshot = {
    weights: parsed.weights,
    label: parsed.label,
    source: 'reply',
    updatedAt: Date.now(),
  };
  return { message, expression };
}
