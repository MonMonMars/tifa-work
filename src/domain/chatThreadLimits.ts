import type { ChatMessage } from './messages';

/** Max messages kept per persona in AsyncStorage (older messages drop off). */
export const THREAD_STORAGE_CAP = 400;

export function trimThreadForStorage(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length <= THREAD_STORAGE_CAP) return messages;
  return messages.slice(-THREAD_STORAGE_CAP);
}
