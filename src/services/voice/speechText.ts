/** Remove markdown-ish noise before reading aloud. */
export function stripForSpeech(text: string): string {
  return text
    .replace(/\[emotion:[^\]]+\]/gi, '')
    .replace(/_\([^)]+\)_/g, '')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
