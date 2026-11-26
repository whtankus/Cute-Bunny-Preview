# Cute Bunny project structure

This document describes the current, working layout and the intended direction for the codebase. The first refactor rule is **preserve runtime paths until every consumer has been migrated and tested**.

## Current layout

```text
/
├── index.html                    # Browser entry point and app shell
├── app.js                        # Main app runtime (legacy monolith; split gradually)
├── style.css                     # Main styles and theme foundation
├── polish.css                    # Visual refinements and component overrides
├── button-interactions.css       # Button interaction states
├── swipe-gestures.css            # Swipe interaction styles
├── swipe-gestures.js             # Swipe interaction behaviour
├── bear-hugs-progression.js      # Bearfriend feature behaviour
├── bear-hugs-progression.css     # Bearfriend feature styles
├── sw.js                         # PWA service worker and offline shell
├── manifest.webmanifest          # PWA metadata
├── capacitor.config.json         # Android/Capacitor configuration
├── scripts/                      # Build and maintenance scripts
├── tests/                        # Automated regression tests
├── docs/                          # Developer documentation
└── supabase/                      # Database schema, migrations and functions
```

## Responsibilities

| Area | Responsibility |
| --- | --- |
| App shell | HTML landmarks, global overlays, script/style loading |
| App runtime | Navigation, authentication, data access and feature coordination |
| Feature files | Feature-specific behaviour and styles |
| Scripts | Build, validation and release helpers; never browser UI code |
| Tests | Source, build and feature regression checks |
| Supabase | SQL schema, ordered migrations and Edge Functions |
| Docs | Setup, architecture, feature map and maintenance notes |

## Target layout (incremental)

The target is to group code by responsibility without changing how the app is hosted:

```text
src/
├── app/                 # App startup and shared lifecycle
├── core/                # DOM helpers, state, events and shared utilities
├── features/
│   ├── home/
│   ├── photos/
│   ├── notes/
│   ├── music/
│   ├── friends/
│   ├── notifications/
│   ├── profile/
│   ├── streak-garden/
│   └── bearfriend/
├── services/            # Supabase, storage and realtime adapters
└── styles/              # Tokens, base, layout and feature styles
scripts/
tests/
docs/
supabase/
```

This target is a migration destination, not a claim that the current runtime has already been moved there. Each module should have a clear public entry point and explicit dependencies. Avoid introducing a framework or build-system change as part of a file move.

## Safe migration rules

1. Move one feature or stylesheet group at a time.
2. Keep a compatibility entry point while old script paths are still referenced.
3. Update `index.html`, build asset lists, service-worker precache entries, tests and Android packaging together.
4. Keep generated files (for example `dist/` and generated Supabase config) out of source control.
5. Run `npm run check`, `npm test`, `npm run build`, browser checks and the Android build after each meaningful migration.
6. Do not rename database tables, columns, RPCs, storage buckets or Edge Function names as part of frontend file cleanup.
