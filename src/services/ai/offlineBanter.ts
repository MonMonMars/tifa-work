import type { BanterPack } from '../../domain/banterLocale';
import type { PersonaId } from '../../domain/personas';
import { getPersona } from '../../domain/personas';
import type { ChatCompletionRequest, ChatCompletionResult } from './types';
import { buildOfflineLine } from './offlineBanterPacks';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function seedFromRequest(request: ChatCompletionRequest): number {
  const base = request.userText.length + request.personaId.charCodeAt(0);
  return base + (request.messages.length % 7);
}

export async function offlineReply(
  request: ChatCompletionRequest,
  banterPack: BanterPack = 'en',
): Promise<ChatCompletionResult> {
  const persona = getPersona(request.personaId);
  const seed = seedFromRequest(request);
  const { line, followUp } = buildOfflineLine(request.personaId, banterPack, seed);

  await delay(350 + (seed % 400));

  const memoryNote =
    request.memorySnippet && request.memorySnippet.length > 0
      ? ` (I remember: ${request.memorySnippet.slice(0, 80)}…)`
      : '';

  return {
    reply: `${persona.emoji} ${line}${memoryNote}\n\n${followUp}`,
    provider: 'offline',
  };
}
