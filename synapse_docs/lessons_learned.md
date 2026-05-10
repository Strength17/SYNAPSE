# lessons_learned.md
# Synapse — Cross-Session Learning Log
# Agent reads at start of every session and applies every relevant lesson.
# Owner adds entries after each session. Agent never edits this file directly.
# ─────────────────────────────────────────────────────────────────────────────

## FRONTEND LESSONS

## L-001 — ES Modules require a server (no file://)
Opening index.html directly via file:// breaks ES module imports (CORS).
Always test on a local server. With Express backend, this is handled
automatically since Express serves public/ over HTTP.
Apply to: P-06-T12, all frontend testing tasks

## L-002 — Service Worker only registers on HTTPS (or localhost)
`navigator.serviceWorker.register()` silently fails on plain HTTP.
Test SW locally on localhost; verify on Railway (HTTPS). Never assume
SW is active based on the register() call alone — check DevTools → Application.
Apply to: P-06-T08, P-09-T12, P-09-T13

## L-003 — iOS Safari and backdrop-filter
`backdrop-filter: blur()` requires `-webkit-backdrop-filter` prefix on iOS Safari.
Always add both. Test glassmorphism cards on an actual iPhone or iOS simulator.
Apply to: P-06-T02 (card-glass), P-06-T04 (bottom nav), P-07-T09 (modals)

## L-004 — iOS input zoom prevention
Any `<input>` or `<textarea>` with `font-size` below 16px triggers auto-zoom on iOS.
Always set `font-size: 16px` minimum on inputs, even if they look smaller via transform.
Apply to: P-07-T08 (settings inputs), P-07-T09 (modal inputs)

## L-005 — CSS env() safe area for iPhone home bar
`padding-bottom: env(safe-area-inset-bottom, 0px)` is required on all fixed bottom elements.
Also requires `<meta name="viewport" content="viewport-fit=cover">` in index.html.
Apply to: P-06-T04 (bottom nav), P-07-T09 (slide-up modals)

## L-006 — localStorage and private browsing
localStorage.setItem() throws a SecurityError in private browsing.
Always wrap in try/catch. Fail gracefully — don't crash if unavailable.
Apply to: P-06-T09 (store.js), P-06-T11 (api.js)

## L-007 — CSS animation on dynamically added elements
When JS appends an element with a CSS animation class, the animation
sometimes doesn't trigger because the class is added before paint.
Fix: use `requestAnimationFrame` after append, then add the animation class.
Apply to: P-07-T02 (card-enter animation), P-07-T05, P-07-T06

## L-008 — Touch event passive listeners and preventDefault
`touchmove` listeners calling `e.preventDefault()` must NOT be registered as
`{ passive: true }`. Set passive:false only on touchmove; touchstart can be passive.
Apply to: P-07-T05 (swipe handlers in inbox.js)

## L-009 — Hash routing and browser back button
`window.onpopstate` does not fire for hash changes in all browsers.
Use `window.addEventListener('hashchange', handler)`.
Also: `history.replaceState(null, '', '#inbox')` on init to normalize the hash.
Apply to: P-06-T10 (router.js)

## L-010 — overflow-x hidden on body breaks position: sticky
Setting `overflow-x: hidden` on `body` or `html` kills `position: sticky` in Safari.
Use `overflow-x: clip` on the specific container instead.
Apply to: P-06-T04 (sticky header), P-07-T05 (filter chips sticky row)

## L-011 — Vibration API is Android-only
`navigator.vibrate()` is not supported on iOS Safari. Always guard:
`if (navigator.vibrate) navigator.vibrate([10]);`
Apply to: any haptic() calls

## L-012 — ES module circular imports
If store.js and api.js import from each other, initialization order creates
`undefined` references. Keep store.js and api.js fully independent;
wire them together only in main.js.
Apply to: P-08-T01 (main.js)

---

## BACKEND LESSONS

## L-013 — HttpOnly cookies and CORS
When the frontend and backend share the same origin (Express serves public/),
`credentials: 'include'` on fetch is unnecessary — same-origin requests
include cookies by default. Use it anyway to be future-proof if origins split.
Set `{ sameSite: 'lax', httpOnly: true, secure: process.env.NODE_ENV === 'production' }`.
Apply to: P-02-T01, P-02-T02, P-06-T11 (api.js)

## L-014 — OAuth state parameter (CSRF protection)
Always generate a random state value before redirecting to OAuth.
Store it in a short-lived HttpOnly cookie. Verify it matches on callback.
If not: reject the callback — someone may be attempting CSRF.
Apply to: P-02-T01 (Google), P-02-T02 (Microsoft)

## L-015 — Google OAuth refresh_token is only returned once
Google sends `refresh_token` only on the FIRST consent screen authorization.
If the user has already consented, subsequent OAuth flows return no refresh_token.
Fix: add `prompt=consent&access_type=offline` to the authorization URL.
Apply to: P-02-T01

## L-016 — Gmail API: messages.list returns IDs only
`GET /gmail/v1/users/me/messages` returns only `{id, threadId}` per message.
You must call `GET /messages/:id?format=full` for each one to get headers + body.
Batch these requests or use `batchGet` to avoid N individual API calls.
Apply to: P-03-T01

## L-017 — Gmail MIME: base64url encoding
Gmail body parts use base64url encoding (uses `-` and `_` instead of `+` and `/`).
Node's `Buffer.from(data, 'base64')` handles this, but always use
`data.replace(/-/g, '+').replace(/_/g, '/')` before decoding to be safe.
Apply to: P-03-T03

## L-018 — Microsoft Graph: token endpoint uses client credentials
Microsoft token endpoint requires `client_id`, `client_secret`, `grant_type`,
`code`, and `redirect_uri` in `application/x-www-form-urlencoded` body (not JSON).
Use URLSearchParams to build the body.
Apply to: P-02-T02

## L-019 — Supabase service role key bypasses RLS
Using `SUPABASE_SERVICE_ROLE_KEY` in the backend client bypasses all Row Level
Security policies. This is correct — the backend is trusted. But NEVER expose
this key to the frontend. The frontend uses the anon key in any direct Supabase
calls (none in this architecture).
Apply to: P-01-T01

## L-020 — AES-256-GCM: unique IV per encryption
Never reuse an IV. Generate `crypto.randomBytes(12)` for each encrypt call
(12 bytes = 96 bits is standard for GCM). Store the IV alongside the ciphertext
in the DB. Attempting to decrypt without the correct IV returns garbled data,
not an error — test this explicitly.
Apply to: P-01-T02

## L-021 — JWT: include jti claim for logout
Standard JWTs cannot be invalidated before expiry. Include a `jti` (JWT ID)
claim as a UUID. On logout: insert the jti into `session_blacklist`.
In auth middleware: check if jti exists in blacklist — if so, reject with 401.
Apply to: P-01-T03, P-02-T03

## L-022 — SSE and Railway's request timeout
Railway (and most reverse proxies) time out connections after ~30-60s of
inactivity. Keep SSE alive with a heartbeat:
`setInterval(() => res.write(':heartbeat\n\n'), 20000)`
This is a comment line (starts with `:`) that EventSource ignores.
Apply to: P-05-T01

## L-023 — Claude API JSON: always strip fences
Even with "return ONLY valid JSON" in the prompt, Claude occasionally wraps
the response in ```json ... ``` fences. Always:
`text.replace(/```json\n?|\n?```/g, '').trim()` before JSON.parse().
Apply to: P-04-T01, P-04-T02, P-04-T03

## L-024 — Claude API rate limits (Haiku)
Haiku has rate limits on tier-1 keys. On 429: fall back to regex classifier,
show warning in SSE stream, do not crash the sync. Implement exponential
backoff: 1s, 2s, 4s, then fail.
Apply to: P-04-T05

## L-025 — Express and ESM
If package.json has `"type": "module"`, all `.js` files use ESM.
`__dirname` and `__filename` are not available — use:
`const __dirname = dirname(fileURLToPath(import.meta.url));`
Apply to: P-01-T07 (server.js) and all backend files

## L-026 — Railway environment variables
Railway sets PORT automatically. Always use `process.env.PORT || 3000`.
Never hardcode a port. Railway also injects NODE_ENV=production on deploy.
Apply to: P-01-T07, P-00-T05 (railway.toml)

---

*End of lessons_learned.md*