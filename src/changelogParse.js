// Pembaca format CHANGELOG.md. Dipakai game (src/changelog.js) dan pengecek CI (scripts/check-changelog.mjs).

/**
 * Format yang dibaca:
 *   ## 0.4.0 — 2026-11-24
 *   ### Added
 *   - kalimat
 * Bagian sebelum entri pertama (penjelasan + contoh format) diabaikan.
 */
export function parseChangelog(text) {
  const entries = [];
  let entry = null;
  let section = null;
  let inFence = false;
  for (const line of text.split(/\r?\n/)) {
    if (line.trim().startsWith('```')) { inFence = !inFence; continue; }
    if (inFence) continue;
    const head = line.match(/^##\s+(\d+\.\d+\.\d+)\s*[—–-]\s*(\d{4}-\d{2}-\d{2})\s*$/);
    if (head) {
      entry = { version: head[1], date: head[2], sections: [] };
      entries.push(entry);
      section = null;
      continue;
    }
    if (!entry) continue;
    const sec = line.match(/^###\s+(.+?)\s*$/);
    if (sec) { section = { name: sec[1], items: [] }; entry.sections.push(section); continue; }
    const item = line.match(/^\s*[-*]\s+(.+)$/);
    if (item && section) section.items.push(item[1]);
  }
  return entries;
}
