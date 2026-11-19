# Cute Bunny 1.0 — Stability and Production Readiness Audit

Audit date: 2026-11-19  
Scope: `whtankus/Cute-Bunny` production repository and `whtankus/Cute-Bunny-Preview` preview repository. This is a source/CI review; no live Supabase project, production user account, or real-device session was accessed.

## Executive status

**Do not treat the current preview deployment as proof of production readiness.** The latest preview deployment is green, but its browser tests use a mocked Supabase client. The production repository's latest browser-smoke workflow failed in five authenticated-app tests. The most important environment question is whether the preview repository's GitHub Pages secrets point to a separate staging Supabase project.

## Findings

### P0 — Confirm preview uses an isolated Supabase project

The preview build reads `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` from the preview repository's Actions secrets and writes them into generated `dist/supabase-config.js`. The workflow describes these as existing Supabase credentials. The repository contents do not establish whether those values point to staging or production.

**Required action:** confirm that the preview repository secrets point to a separate staging Supabase project with non-production users/data and matching migrations. Do not use the preview app for destructive testing until this is confirmed. Never copy a service-role key into the browser build; only a publishable/anon key belongs there, with RLS enforcing access.

### P1 — Production browser-smoke suite is failing

Production run `44339094524` failed in the Chromium interaction suite. Three public welcome/auth tests passed; five authenticated tests timed out waiting for `#app` to become visible:
- sending a Notes message
- recording a Notes seen receipt
- saving profile edits
- rendering notifications
- uploading a photo

The failure is in the shared test setup path `waitForSignedInApp()`, before those feature assertions run. This currently indicates a broken/stale authenticated test fixture or session bootstrap contract; it does **not** yet prove that all five production features are broken. Fix the fixture/session bootstrap and keep the tests exercising the real UI event handlers.

### P1 — Current green preview E2E coverage is mock-backed

The preview workflow's Playwright tests run against a mocked Supabase fixture. They are useful for UI regression coverage, but cannot prove real authentication, RLS, storage policies, cross-account visibility, or Supabase Realtime behavior. In particular, the earlier typing-indicator issue needs a real two-account integration test.

**Required action:** add a separately gated staging integration suite using two disposable test accounts. Cover sign-in/session restore, two-way messages, typing start/stop, online/last-active presence, read receipts, friend relationship changes, private media upload/read/delete, and cross-user access denial.

### P1 — Database changes need migration-to-environment verification

Production contains timestamped migrations for note read cursors, profile permissions, storage/data API grants, timezone-aware streaks, and profile collections. The preview repository does not contain the Supabase migration directory or schema, so its deployment pipeline alone cannot verify that the connected database has the expected schema.

**Required action:** apply and verify migrations in staging first, then production. Track the deployed migration version and test RLS policies against at least two accounts. Do not run schema changes directly from an unreviewed browser session.

### P2 — Preview CI dependency installation is not reproducible

The preview workflow uses `npm install`; the repository tree does not contain a lockfile. The production quality workflow uses `npm ci` with a lockfile. This means preview dependency resolution can drift between runs.

**Required action:** commit the appropriate npm lockfile and use `npm ci --no-audit --no-fund` in CI.

### P2 — CI failures should remain visible, not be hidden by successful deployment

The latest preview Pages run completed successfully after its tests passed. Earlier preview runs included browser-test failures. Production's most recent Pages deployment and quality checks passed, while the browser-smoke workflow failed. Keep deployment, quality, and browser-smoke status visible as separate release gates; a successful static-site deployment is not equivalent to a passed release.

## Verified positives

- Production has separate quality, browser-smoke, Pages deployment, Android build, and preview-validation workflows.
- Production migration `20261117110000_tighten_data_api_and_storage_grants.sql` explicitly revokes broad table grants and restores column/action-specific grants.
- The note read-cursor migration validates that a reader follows the note owner and that the cursor references that owner's note.
- The latest preview workflow run `44462405501` passed its app-shell tests, build, desktop/mobile browser tests, and GitHub Pages deployment.
- The production quality workflow and Android APK workflow both passed in the latest inspected run.

## Execution order

1. Verify and isolate the preview Supabase project.
2. Repair the production browser test authentication fixture; rerun all browser tests.
3. Add two-account staging Realtime and authorization tests, especially typing/presence.
4. Verify all production migrations and RLS/storage policies in staging.
5. Make preview dependency installation deterministic.
6. Run a complete release gate before promoting changes to production.

## Not performed

No production code, database schema, production data, or secrets were changed during this audit. No live-account or live-Realtime test was attempted. Those steps require an isolated staging project and disposable test accounts.
