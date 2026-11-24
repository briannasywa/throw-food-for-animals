# Contributing to Zoo Toss

## Changelog is mandatory

Every update merged into `main` **must** add an entry at the top of [CHANGELOG.md](CHANGELOG.md). Players see it in the in-game **Changelog** menu (key `C`, or Menu → Changelog on phones), with a dot until they open it.

1. Add a new version on top, newer than the one below it:

   ```
   ## 0.5.0 — 2026-12-01
   ### Added
   - Short, player-facing sentence about what is new.
   ### Changed
   - …
   ### Fixed
   - …
   ```

   - Sections: `Added`, `Changed`, `Fixed`, `Removed`. Use only the ones you need.
   - Version: bump the last number for small fixes (0.4.0 → 0.4.1), the middle number for new features (0.4.0 → 0.5.0).
   - Write for players: what they will notice, not file names.
   - Several commits in one merge share one entry.
2. Set the same version in `package.json`.
3. Check it locally before merging or pushing:

   ```
   npm run check:changelog -- --base origin/main
   ```

## What enforces it

- `.github/workflows/changelog.yml` runs the same check on every pull request into `main` and every push to `main`. It fails when CHANGELOG.md was not changed, the new version is not higher, the format is wrong, or `package.json` does not match.
- To block merging on a failed check, a repo admin turns on **Settings → Branches → main → Require status checks → Changelog**.
