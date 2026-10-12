/** True when query is empty or matches any keyword (case-insensitive substring). */
export function settingsMatches(query: string, keywords: string[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return keywords.some((k) => k.toLowerCase().includes(q));
}
