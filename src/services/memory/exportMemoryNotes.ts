import type { MemoryNote } from '../../domain/memoryNote.ts';
import { sortMemoryNotesForDisplay } from '../../domain/memoryNote.ts';

/**
 * Plain-text export for Share sheet — never includes API keys or LLM config.
 */
export function formatMemoryExportText(
  notes: MemoryNote[],
  options?: { personaName?: string; exportedAt?: Date },
): string {
  const at = options?.exportedAt ?? new Date();
  const dateLine = at.toISOString().slice(0, 10);
  const header = ['Weepo · memory notes (device only)', `Exported ${dateLine}`];
  if (options?.personaName) {
    header.push(`Active companion: ${options.personaName}`);
  }
  header.push('', '---', '');

  if (notes.length === 0) {
    return [...header, '(No saved notes yet.)', '', '---', 'Not professional advice · AI companion app'].join(
      '\n',
    );
  }

  const ordered = sortMemoryNotesForDisplay(notes);
  const body = ordered.map((n, i) => `${i + 1}. ${n.pinned ? '📌 ' : ''}${n.text}`);
  return [...header, ...body, '', '---', 'Not professional advice · AI companion app'].join('\n');
}
