import type { ChatMessage } from '../../domain/messages';
import type { PersonaId } from '../../domain/personas';
import { PERSONA_ARCHETYPE, PERSONA_PROMPT_FLAVOR } from '../../domain/personaFlavor';
import { getPersona } from '../../domain/personas';
import { PROMPT_HISTORY_CAP, trimHistoryForPrompt } from './historyCap';

export { PROMPT_HISTORY_CAP, trimHistoryForPrompt } from './historyCap';

export function buildSystemPrompt(personaId: PersonaId, memorySnippet?: string): string {
  const persona = getPersona(personaId);
  const memoryBlock =
    memorySnippet && memorySnippet.trim().length > 0
      ? `\n【Device memory — facts the user shared before】\n${memorySnippet}\n`
      : '';

  return [
    `You are ${persona.name} (${persona.role}) in the Weepo companion app.`,
    PERSONA_ARCHETYPE[personaId],
    persona.tagline,
    PERSONA_PROMPT_FLAVOR[personaId].join(' '),
    'Reply in 1–3 short sentences unless the user asks for depth. Be warm, present, and conversational.',
    'End with a gentle question when it fits natural continuity.',
    'Optional: include one emotion tag in the form [emotion:joy=0.6] (0–1) so the avatar face can react.',
    memoryBlock,
  ]
    .filter(Boolean)
    .join('\n');
}

export type OpenAiChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export function buildOpenAiMessages(
  personaId: PersonaId,
  history: ChatMessage[],
  userText: string,
  memorySnippet?: string,
): OpenAiChatMessage[] {
  const trimmed = trimHistoryForPrompt(history);
  return [
    { role: 'system', content: buildSystemPrompt(personaId, memorySnippet) },
    ...trimmed.map((m) => ({ role: m.role, content: m.content }) as OpenAiChatMessage),
    { role: 'user', content: userText },
  ];
}
