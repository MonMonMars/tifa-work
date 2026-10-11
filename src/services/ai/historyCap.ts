import type { ChatMessage } from '../../domain/messages';

export const PROMPT_HISTORY_CAP = 8;

export function trimHistoryForPrompt(messages: ChatMessage[]): ChatMessage[] {
  const conversational = messages.filter((m) => m.role === 'user' || m.role === 'assistant');
  return conversational.slice(-PROMPT_HISTORY_CAP);
}
