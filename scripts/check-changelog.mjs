#!/usr/bin/env node
// Pengecek CHANGELOG.md — wajib lolos sebelum update di-merge ke main (lihat CONTRIBUTING.md).
//
//   npm run check:changelog                 cek format + versi cocok dengan package.json
//   npm run check:changelog -- --base main  juga cek: CHANGELOG.md diubah dan versinya naik dibanding <base>
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseChangelog } from '../src/changelogParse.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (msg) => errors.push(msg);

const text = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');
const entries = parseChangelog(text);
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const cmp = (a, b) => {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
};

if (!entries.length) fail('CHANGELOG.md has no entries. Add one like "## 0.5.0 — 2026-12-01".');
const SECTIONS = ['Added', 'Changed', 'Fixed', 'Removed'];
entries.forEach((e, i) => {
  if (Number.isNaN(Date.parse(e.date))) fail(`v${e.version}: date "${e.date}" is not a valid YYYY-MM-DD date.`);
  if (!e.sections.length || !e.sections.some(s => s.items.length)) fail(`v${e.version}: needs at least one "- item" under Added / Changed / Fixed / Removed.`);
  e.sections.forEach(s => { if (!SECTIONS.includes(s.name)) fail(`v${e.version}: unknown section "### ${s.name}" (use ${SECTIONS.join(', ')}).`); });
  if (i > 0 && cmp(entries[i - 1].version, e.version) <= 0) fail(`v${entries[i - 1].version} must be newer than the entry below it (v${e.version}). Newest goes on top.`);
});
if (entries[0] && entries[0].version !== pkg.version) {
  fail(`Top changelog entry is v${entries[0].version} but package.json version is ${pkg.version}. Make them match.`);
}

const baseIdx = process.argv.indexOf('--base');
const base = baseIdx > -1 ? process.argv[baseIdx + 1] : null;
if (base && entries[0]) {
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  let changed = '';
  try { changed = git('diff', '--name-only', `${base}...HEAD`); }
  catch { try { changed = git('diff', '--name-only', base, 'HEAD'); } catch { fail(`Cannot compare with "${base}".`); } }
  const prefix = git('rev-parse', '--show-prefix').trim();
  if (changed && !changed.split('\n').includes(`${prefix}CHANGELOG.md`)) {
    fail(`This update does not touch CHANGELOG.md. Every update merged into main needs a changelog entry.`);
  }
  let baseText = null;
  try { baseText = git('show', `${base}:${prefix}CHANGELOG.md`); } catch { /* belum ada changelog di base */ }
  const baseTop = baseText ? parseChangelog(baseText)[0] : null;
  if (baseTop && cmp(entries[0].version, baseTop.version) <= 0) {
    fail(`Top entry v${entries[0].version} is not newer than v${baseTop.version} on ${base}. Add a new version on top.`);
  }
}

if (errors.length) {
  console.error('Changelog check failed:\n' + errors.map(e => `  - ${e}`).join('\n'));
  console.error('\nSee CONTRIBUTING.md for the format.');
  process.exit(1);
}
console.log(`Changelog OK: v${entries[0].version} (${entries.length} entries).`);
