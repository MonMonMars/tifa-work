export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  ts: number;
  /** Optional emotion tag from assistant (for avatar). */
  emotionTag?: string;
}

export function createMessage(
  role: ChatRole,
  content: string,
  extra?: Pick<ChatMessage, 'emotionTag'>,
): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    ts: Date.now(),
    ...extra,
  };
}
