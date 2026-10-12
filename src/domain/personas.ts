export type PersonaId = 'mika' | 'ren' | 'luna';

export interface Persona {
  id: PersonaId;
  name: string;
  role: string;
  tagline: string;
  emoji: string;
  greet: string;
  colors: { primary: string; secondary: string };
}

export const PERSONAS: Persona[] = [
  {
    id: 'mika',
    name: 'Mika',
    role: 'Companion · warm',
    tagline: 'Warm, curious, remembers the little things.',
    emoji: '🌸',
    greet: "Hey — I'm Mika. I'm glad you're here. What's on your mind?",
    colors: { primary: '#FF6B9D', secondary: '#FFB8D0' },
  },
  {
    id: 'ren',
    name: 'Ren',
    role: 'Partner · steady',
    tagline: 'Steady, playful, good at listening.',
    emoji: '🌙',
    greet: "Ren here. No rush — tell me how your day's going.",
    colors: { primary: '#6B8CFF', secondary: '#B8C8FF' },
  },
  {
    id: 'luna',
    name: 'Luna',
    role: 'Guide · focus',
    tagline: 'Calm focus for work and life balance.',
    emoji: '✨',
    greet: "Hi, I'm Luna. Want to chat, vent, or plan something together?",
    colors: { primary: '#9B6BFF', secondary: '#D4B8FF' },
  },
];

export function getPersona(id: PersonaId): Persona {
  const p = PERSONAS.find((x) => x.id === id);
  if (!p) {
    throw new Error(`Unknown persona: ${id}`);
  }
  return p;
}
