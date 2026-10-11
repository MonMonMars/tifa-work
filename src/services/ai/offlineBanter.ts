import type { PersonaId } from '../../domain/personas';
import { getPersona } from '../../domain/personas';
import type { ChatCompletionRequest, ChatCompletionResult } from './types';

const FOLLOW_UPS = [
  'What would feel most helpful right now — venting or planning?',
  'Tell me one small thing that went okay today.',
  'Want to keep going, or switch topics?',
];

const REPLY_TEMPLATES: Record<PersonaId, string[]> = {
  mika: [
    "I hear you. [emotion:joy=0.5] That sounds like a lot to carry.",
    "Thanks for sharing that with me — I'm right here.",
    "Mmm, interesting. What part of it bothers you most?",
  ],
  ren: [
    "Got it. No judgment — just us talking.",
    "That makes sense. What do you wish had gone differently?",
    "I'm listening. Take your time.",
  ],
  luna: [
    "Let's slow down for a second. What's the core worry?",
    "We can break it into one next step if you want.",
    "Noted. What would 'good enough' look like today?",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export async function offlineReply(request: ChatCompletionRequest): Promise<ChatCompletionResult> {
  const persona = getPersona(request.personaId);
  const pool = REPLY_TEMPLATES[request.personaId];
  const line = pick(pool);
  const follow = pick(FOLLOW_UPS);

  await delay(350 + Math.random() * 400);

  const memoryNote =
    request.memorySnippet && request.memorySnippet.length > 0
      ? ` (I remember: ${request.memorySnippet.slice(0, 80)}…)`
      : '';

  return {
    reply: `${persona.emoji} ${line}${memoryNote}\n\n${follow}`,
    provider: 'offline',
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
