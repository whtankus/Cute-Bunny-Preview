# Cute Bunny project structure

## Current source layout

```text
/
├── index.html
├── app.js                         # Startup, shared state and navigation coordinator
├── style.css                      # Shared legacy/base styles
├── polish.css                     # Shared refinements and unclassified legacy rules
├── src/
│   ├── core/dom.js
│   ├── services/
│   │   ├── supabase-client.js
│   │   ├── media-optimizer.js
│   │   └── api.js
│   ├── features/
│   │   ├── home/home.js
│   │   ├── photos/photos.js
│   │   ├── notes/notes.js
│   │   ├── notes/chat-events.js
│   │   ├── music/music.js
│   │   ├── friends/friends.js
│   │   ├── notifications/notifications.js
│   │   ├── profile/profile.js
│   │   └── streak/streak.js
│   └── styles/
│       ├── tokens.css
│       └── features/{home,photos,notes,music,friends,notifications,profile,streak}.css
├── bear-hugs-progression.js
├── bear-hugs-progression.css
├── swipe-gestures.js
├── swipe-gestures.css
├── scripts/
├── tests/
├── docs/
└── supabase/
```

## Target feature-first layout

```text
src/
├── app/                           # Startup and navigation coordinator
├── core/                          # DOM, events, state and shared helpers
├── features/
│   ├── home/home.js
│   ├── photos/photos.js
│   ├── notes/notes.js
│   ├── music/music.js
│   ├── friends/friends.js
│   ├── notifications/notifications.js
│   ├── profile/profile.js
│   ├── streak/streak.js
│   └── bearfriend/
├── services/                      # Supabase, media, storage and realtime
└── styles/
    ├── tokens.css
    ├── base.css
    ├── layout.css
    └── features/
```

The feature-first tree is a migration destination; not every feature has been moved yet. New classic-script modules attach a small, explicit API to `window.CuteBunnyCore` or `window.CuteBunnyServices` to preserve compatibility with the current app and feature scripts. Update HTML load order, Pages copy rules, build assets, service-worker precache and tests together for every extraction.

## Migration safety
- Keep public runtime paths stable until every consumer is migrated.
- Do not rename database tables, columns, RPCs, buckets or Edge Functions during frontend cleanup.
- Move one cohesive behaviour at a time and preserve DOM IDs and event contracts.
- Preserve nested `src/` paths in production output.
- Run syntax checks, source tests, production build, Pages deployment, browser regression checks and Android packaging before merging.


## Feature extraction status
Eight feature scripts now own 154 extracted function declarations and load before `app.js` as classic scripts. This preserves access to the existing app-level lexical state during the staged migration. It is not yet full dependency injection or isolated feature state. Streak garden illustration data and feature-specific CSS remain in legacy files pending safe extraction and cascade review.


## Current feature extraction
Eight feature scripts now own 154 function declarations. Feature CSS has been split into eight stylesheets. The scripts load before `app.js` as classic scripts to preserve access to app-level lexical state; dependency injection and isolated feature state remain future work. The shared base stylesheet remains intact.
