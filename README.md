# Cute Bunny Preview

A cozy scrapbook-style web app for sharing a few small happy things with a friend.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add your Supabase values in `supabase-config.js` or export them before building:
   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_PUBLISHABLE_KEY="your-anon-or-publishable-key"
   ```
3. Start the app locally:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:4173`

## Useful scripts

```bash
npm run build
npm run check
npm run check:config
```

## What this repo is for

This repository is a preview/testing deployment for Cute Bunny. It is separate from the production repo and is intended for testing, preview builds, and local app validation.

## Improvements included

- safer default Supabase config for graceful startup
- startup config validation with friendly instructions
- more reliable build behavior when env values are missing
- clearer local setup guidance
