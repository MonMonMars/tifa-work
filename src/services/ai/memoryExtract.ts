/** Lightweight on-device memory snippets (no cloud). */

const PATTERNS: Array<{ re: RegExp; format: (match: RegExpMatchArray) => string }> = [
  {
    re: /\bmy name is ([\w\s'-]{2,32})/i,
    format: (m) => `User's name: ${m[1]?.trim()}`,
  },
  {
    re: /\b(?:i'?m|i am) ([\w\s'-]{2,32})(?:\.|,|$)/i,
    format: (m) => {
      const word = m[1]?.trim() ?? '';
      if (/^(happy|sad|fine|ok|good|tired)$/i.test(word)) return '';
      return `User said they are: ${word}`;
    },
  },
  {
    re: /\bi work (?:as|at|on) (.+?)(?:\.|$)/i,
    format: (m) => `User work: ${m[1]?.trim()}`,
  },
  {
    re: /\bi live in ([\w\s,'-]{2,40})/i,
    format: (m) => `User lives in: ${m[1]?.trim()}`,
  },
];

export function extractMemoryNote(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  for (const { re, format } of PATTERNS) {
    const match = trimmed.match(re);
    if (match) {
      const note = format(match).trim();
      if (note.length > 4) return note.slice(0, 200);
    }
  }
  return null;
}
