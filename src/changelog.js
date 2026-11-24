// Zoo Toss — membaca CHANGELOG.md (wajib diisi tiap update yang di-merge ke main) untuk menu Changelog.
import raw from '../CHANGELOG.md?raw';
import { parseChangelog } from './changelogParse.js';

export const CHANGELOG = parseChangelog(raw);
export const LATEST_VERSION = CHANGELOG[0]?.version || '0.0.0';
