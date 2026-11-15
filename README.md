# VOXURN

A minimal, anonymous audio-first social space.

## Product principles

- Strict black and white visual identity.
- Listen to a feed of audio posts.
- Publish audio.
- Reply to posts with audio.
- Explore hashtags.
- No profiles, followers, likes, direct messages, or complex moderation in the MVP.

## Stack

- React
- TypeScript
- Vite
- Supabase (planned for persistence and audio storage)

## Development

```bash
npm install
npm run dev
```

## Current status

Initial frontend foundation. Feed content and waveform visuals are placeholders; recording, playback, replies, persistence, and hashtag data still need to be connected.

## Supabase setup

The app uses Supabase for anonymous audio posts, replies, and public audio storage.

1. In the Supabase SQL Editor, run `supabase/migrations/0001_voxurn_audio.sql`.
2. In the GitHub repository, open **Settings → Secrets and variables → Actions → Variables** and add:
   - `VITE_SUPABASE_URL`: `https://qkxuasszurxilglgrawv.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: your project's publishable key (`sb_publishable_...`)
3. Re-run the GitHub Pages workflow.

The publishable key is intended for browser use. Never put a `service_role` key in frontend code. Row Level Security is enabled; the migration permits anonymous reads and inserts and does not permit public updates or deletes.
