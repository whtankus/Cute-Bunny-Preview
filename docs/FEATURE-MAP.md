# Cute Bunny feature map

| Feature | Current implementation | Planned module |
|---|---|---|
| App shell and navigation | `index.html`, `app.js` | `src/app/` |
| Home/feed | `app.js` | `src/features/home/` |
| Photos | `app.js`, `src/services/media-optimizer.js` | `src/features/photos/` |
| Notes chat | `app.js` | `src/features/notes/` |
| Music | `app.js` | `src/features/music/` |
| Friends | `app.js` | `src/features/friends/` |
| Notifications | `app.js`, `sw.js` | `src/features/notifications/` |
| Profiles | `app.js` | `src/features/profile/` |
| Streak Garden | `app.js` | `src/features/streak-garden/` |
| Bearfriend | `bear-hugs-progression.js`, `bear-hugs-progression.css` | `src/features/bearfriend/` |
| Shared DOM helpers | `src/core/dom.js` | `src/core/` |
| Supabase client | `src/services/supabase-client.js` | `src/services/` |
| Image preparation | `src/services/media-optimizer.js` | `src/services/` |
| Design tokens | `src/styles/tokens.css` | `src/styles/` |

Feature modules should own rendering and event handlers. Services own network/storage operations. Core owns reusable browser primitives. The app coordinator owns startup and navigation. The service worker owns caching and notification-click routing.


## Extracted feature scripts
- home: `src/features/home/home.js`
- photos: `src/features/photos/photos.js`
- notes: `src/features/notes/notes.js`
- music: `src/features/music/music.js`
- friends: `src/features/friends/friends.js`
- notifications: `src/features/notifications/notifications.js`
- profile: `src/features/profile/profile.js`
- streak: `src/features/streak/streak.js`
