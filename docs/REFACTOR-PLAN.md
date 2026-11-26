# Stability and architecture refactor plan

## Phase 1 — Establish safe conventions

- [x] Document current layout and feature ownership.
- [x] Define simple, consistent filename rules.
- [x] Add a repeatable project-structure check.
- [ ] Record a baseline for all existing tests and builds.

## Phase 2 — Separate feature code

- [ ] Extract one feature at a time from `app.js`, starting with isolated UI features.
- [ ] Keep a small app entry point responsible for startup and navigation.
- [ ] Move feature styles into scoped feature stylesheets.
- [ ] Preserve existing DOM IDs and data attributes until tests cover replacements.

## Phase 3 — Simplify shared services

- [ ] Centralise Supabase client access and shared data operations.
- [ ] Separate media URL/cache handling from feature rendering.
- [ ] Separate realtime/presence lifecycle from Notes and Friends UI.
- [ ] Add explicit error handling and cleanup for timers, observers and channels.

## Phase 4 — CSS cleanup

- [ ] Inventory duplicate selectors and override chains.
- [ ] Introduce shared design tokens for colour, spacing, radius and shadows.
- [ ] Move feature selectors into feature stylesheets.
- [ ] Remove a legacy rule only after checking all screen sizes and themes.

## Phase 5 — Verify every migration

Run these checks before merging each refactor:
- `npm run check`
- `npm test`
- `npm run build` with the required Supabase build variables
- GitHub Pages workflow
- Android APK workflow
- Browser regression checks for Home, Photos, Notes, Music, Friends, Streak Garden and Bearfriend

## Non-negotiable constraints

- No feature redesign during structural-only changes.
- No database/API contract changes during file moves.
- No deleting a file until every import, script tag, build asset, service-worker cache entry, test and workflow reference is updated.
- Keep each change small enough to revert independently.
