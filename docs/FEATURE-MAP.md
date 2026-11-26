# Cute Bunny feature map

This is the navigation map for developers. Keep it updated when a feature is added, renamed or moved.

| Feature | User-facing purpose | Current implementation |
| --- | --- | --- |
| App shell and navigation | Entry screen, page switching and shared overlays | `index.html`, `app.js` |
| Home | Shared feed and recent memories | `app.js` |
| Photos | Photo garden, previews and photo actions | `app.js` |
| Notes | Private-feeling chat, typing and read states, photo sharing | `app.js` |
| Music | Song library, playback and persistent player | `app.js`, `index.html` |
| Friends | Find and connect with people | `app.js` |
| Profiles and settings | Account identity, preferences and themes | `app.js`, `index.html` |
| Streak Garden | Daily streaks, quests and Petal Points | `app.js` |
| Bearfriend | Shared bear care, progression and rewards | `bear-hugs-progression.js`, `bear-hugs-progression.css`, integration in `app.js` |
| Notifications | Activity updates and notification settings | `app.js`, `sw.js` |
| PWA and offline shell | Installability, caching and notification clicks | `manifest.webmanifest`, `sw.js` |
| Android | Native wrapper and updater | `capacitor.config.json`, `scripts/`, Android project |
| Backend | Auth, profiles, memories, media, realtime and rewards | `supabase/` |

## Dependency boundaries

- UI features call shared app services; they should not each create unrelated Supabase clients.
- Supabase access belongs behind service functions, not duplicated in click handlers.
- Feature styles should be scoped to a feature root to avoid cross-tab regressions.
- The service worker owns caching and notification-click routing, not application business rules.
- Build scripts generate `dist/`; the app must not depend on files that only exist on a developer machine.
