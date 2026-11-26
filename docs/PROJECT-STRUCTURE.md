# Cute Bunny project structure

## Current source layout

```text
/
├── index.html
├── app.js                         # Legacy app coordinator; split incrementally
├── style.css                      # Legacy global styles
├── polish.css                     # Remaining visual refinements
├── src/
│   ├── core/dom.js                # DOM query and HTML escaping helpers
│   ├── features/notes/chat-events.js # Notes composer keyboard and submit events
│   ├── services/
│   │   ├── supabase-client.js     # Supabase client construction
│   │   ├── media-optimizer.js     # Safe image upload optimization
│   │   └── api.js                 # Supabase data access facade
│   └── styles/tokens.css         # Shared design tokens
├── bear-hugs-progression.js      # Bearfriend behaviour
├── bear-hugs-progression.css     # Bearfriend styles
├── swipe-gestures.js             # Gesture behaviour
├── swipe-gestures.css            # Gesture styles
├── scripts/                      # Build and maintenance scripts
├── tests/                        # Regression tests
├── docs/                          # Developer documentation
└── supabase/                      # Database schema, migrations and functions
```

## Target feature-first layout

```text
src/
├── app/                           # Startup and navigation coordinator
├── core/                          # DOM, events, state and shared helpers
├── features/
│   ├── home/  photos/  notes/  music/
│   ├── friends/  notifications/  profile/
│   ├── streak-garden/  bearfriend/
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
