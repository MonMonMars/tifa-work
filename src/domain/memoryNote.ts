export interface MemoryNote {
  text: string;
  pinned: boolean;
}

export function normalizeMemoryNotes(input: unknown): MemoryNote[] {
  if (!Array.isArray(input)) return [];
  const out: MemoryNote[] = [];
  for (const item of input) {
    if (typeof item === 'string') {
      const text = item.trim();
      if (text) out.push({ text, pinned: false });
      continue;
    }
    if (item && typeof item === 'object' && 'text' in item) {
      const text = String((item as MemoryNote).text).trim();
      if (text) {
        out.push({ text, pinned: Boolean((item as MemoryNote).pinned) });
      }
    }
  }
  return out.slice(-12);
}

/** Pinned notes first, then original order within each group. */
export function sortMemoryNotesForDisplay(notes: MemoryNote[]): MemoryNote[] {
  const pinned = notes.filter((n) => n.pinned);
  const rest = notes.filter((n) => !n.pinned);
  return [...pinned, ...rest];
}

/** Text snippets for LLM system prompt — pinned first, max count. */
export function memoryTextsForPrompt(notes: MemoryNote[], max = 5): string[] {
  return sortMemoryNotesForDisplay(notes)
    .map((n) => n.text)
    .slice(0, max);
}
