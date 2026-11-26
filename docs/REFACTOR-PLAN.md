# Stability and architecture refactor

## Completed foundation
- [x] Define lowercase kebab-case naming rules and feature ownership.
- [x] Extract DOM query and HTML escaping helpers to `src/core/dom.js`.
- [x] Extract Supabase client construction to `src/services/supabase-client.js`.
- [x] Extract image upload optimization to `src/services/media-optimizer.js`.
- [x] Move Supabase-backed data access into `src/services/api.js` with injected app dependencies.
- [x] Extract shared visual tokens to `src/styles/tokens.css`.
- [x] Move Notes composer submit and desktop Enter handling to `src/features/notes/chat-events.js`.
- [x] Update browser loading, GitHub Pages publishing, production build and service-worker precache for nested source paths.
- [x] Add regression checks for the extracted boundaries and production asset copying.

## Remaining feature migrations
1. Extract Notes chat into `src/features/notes/`, preserving DOM IDs, typing/read receipts and realtime event contracts.
2. Extract Photos/feed rendering into `src/features/photos/` and `src/features/home/`.
3. Extract Music, Friends, Notifications, Profile and Streak Garden one at a time.
4. Move Bearfriend and gesture modules into the feature tree after checking all script, cache and packaging paths.
5. Move Supabase data access into domain services without changing the database contract.
6. Split remaining legacy CSS by feature and remove duplicate selectors only after visual regression checks.

## Required checks per migration
- `npm run check`
- `npm test`
- `npm run build` with repository Supabase build variables
- GitHub Pages workflow
- Browser regression checks across tabs and themes
- Android APK build and install/upgrade check

## Constraints
No feature redesign during structural-only changes. No schema/API changes during file moves. Do not remove a legacy file until every script tag, build asset, workflow, service-worker entry, test and native packaging reference is updated.
