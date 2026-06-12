# World Explorer — Reactor LingBot demo

A kids' world-exploration game built on [Reactor](https://reactor.inc)'s real-time
**LingBot** world model. Pick a world and a hero (or type your own), and a single
combined seed image is generated on the fly. You then walk around the live,
AI-generated world with WASD for **30 seconds**, and the whole run is recorded so you
can preview and download it as an MP4.

The app is intentionally built to exercise the full Reactor + LingBot API surface.

## How it works

```
Landing (env + hero + free text)
  -> POST /api/seed-image    (OpenAI gpt-image-1 -> combined seed frame)
  -> POST /api/reactor/token (mint short-lived JWT from REACTOR_API_KEY)
  -> LingbotProvider (autoConnect)
       uploadFile -> setImage -> await image_accepted -> setSeed -> setPrompt -> start
       drive with WASD / arrows for 30s
  -> requestRecording() -> ClipPlayer + ClipDownloadButton
```

LingBot needs a single seed image plus a single text prompt. The environment and
character selections are fused into one generated seed frame (via OpenAI), and the
LingBot scene prompt is assembled to stay aligned with that frame
(`src/lib/prompt.ts`), following Reactor's Prompt Guide.

## Reactor / LingBot APIs exercised

- **Auth broker:** `POST https://api.reactor.inc/tokens` in `src/app/api/reactor/token/route.ts`; client uses a lazy `getJwt` resolver.
- **Connection lifecycle + session id:** `StatusBadge` (`disconnected → connecting → waiting → ready`).
- **Recoverable disconnect / reconnect:** "Pause link" / "Resume link" in `StatusBadge`.
- **Launch:** `uploadFile`, `set_image`, `set_seed`, `set_prompt`, `start` (with the `image_accepted` wait).
- **Drive:** `set_movement`, `set_look_horizontal`, `set_look_vertical`, `set_rotation_speed_deg` (persistent-state axes, keydown/keyup → `idle`).
- **Transport:** `pause`, `resume`, `reset`.
- **Recording:** `requestRecording()` (full 30s) and `requestClip(10)` (snap), previewed/saved with `ClipPlayer` / `ClipDownloadButton`.
- **Messages (typed hooks):** `state`, `command_error`, `image_accepted`, `generation_complete`.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add your keys:

   ```bash
   cp .env.example .env.local
   # then edit .env.local
   ```

   - `REACTOR_API_KEY` — your `rk_...` key from the [Reactor dashboard](https://reactor.inc/dashboard).
   - `OPENAI_API_KEY` — used server-side to generate the seed image with `gpt-image-1`.

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Deploying

This is a standard Next.js app and runs on any Node host or platform (Vercel,
Netlify, Render, Fly, a container, etc.). Both keys are read **server-side only**,
so set them as environment variables in your deploy platform — never commit them.

Required environment variables (see `.env.example`):

| Variable | Used by | Purpose |
|---|---|---|
| `REACTOR_API_KEY` | `src/app/api/reactor/token/route.ts` | Mints the short-lived Reactor JWT (rk_… key). |
| `OPENAI_API_KEY` | `src/app/api/seed-image/route.ts` | Generates the seed image via `gpt-image-1`. |

Locally these live in `.env.local` (gitignored). On a platform, add them in its
"Environment Variables" settings, then build/start with `npm run build` /
`npm run start`. No other configuration is required.

## Notes

- The `rk_...` key never reaches the browser; the client only ever receives a
  short-lived JWT minted by the server route.
- The 30-second cap is enforced client-side (well within LingBot's 300-chunk
  retention). When time is up, movement is idled, generation is paused, and the
  recording is captured.
- Clip preview uses HLS; `hls.js` is included for Chromium/Firefox. Reactor only
  hosts clips for 24h, so download immediately to keep them.
- Preset landing thumbnails live in `public/presets/`.

## Tech

Next.js (App Router) · TypeScript · Tailwind CSS · `@reactor-team/js-sdk` ·
`@reactor-models/lingbot` · `openai`.
