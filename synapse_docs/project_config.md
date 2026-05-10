# project_config.md
# Synapse v2.0 — AI Email Intelligence Platform
# READ-ONLY. Never modify during build.
# ─────────────────────────────────────────────────────────────────────────────

## 0. SESSION START PROTOCOL

Every session, in order:
1. Read project_config.md (this file)
2. Read lessons_learned.md
3. Read rules.md
4. Read workflow_state.md → find first ⬜ task
5. Execute → update workflow_state.md before ending session

Stop and use Intervention Format (Section 9) ONLY for: blockers that cannot
be self-resolved, irreversible actions, tasks marked ❓.
Proceed automatically for everything else. Never skip tasks.

**Never:** hardcode colors outside styles.css · use inline styles · add
framework libraries without asking · commit untested code · modify this file

---

## 1. PROJECT

| Field | Value |
|---|---|
| Name | Synapse v2.0 |
| Type | Full-stack PWA — Node/Express backend + Vanilla JS frontend |
| Purpose | AI email intelligence — connects to real inbox via OAuth, reads emails, extracts actions, auto-implements |
| Current MVP | synapse-mvp.surge.sh (demo-only, simulated data) |
| Target | Real Gmail + Outlook inbox integration, Claude AI backend, Supabase persistence |
| Deploy | Railway (backend + static frontend served together) |
| Repo | GitHub (private) |
| Future | Native iOS/Android app (same design language) |

---

## 2. WHAT SYNAPSE DOES

```
User connects Gmail or Outlook (one OAuth click)
  → Backend fetches real inbox via Gmail API / Microsoft Graph
  → Claude AI (backend) classifies: meeting | urgent | deadline | followup | info
  → Extracts: time, location, urgency, confidence score
  → Generates action: Schedule Meeting / Escalate / Draft Reply / Submit Report
  → Auto-implements low-risk items (calendar entry, reminder, reply draft)
  → Stores everything in Supabase
  → Frontend polls backend for updates (SSE for real-time feel)
  → Surfaces high-stakes items for one human tap (IMPLEMENT / DISMISS / SNOOZE)
  → Logs all actions with timestamps → Done tab history
```

User sees: only their email address. All AI, all OAuth tokens, all API keys → backend only.

---

## 3. TECH STACK

| Layer | Choice | Reason |
|---|---|---|
| Backend | Node.js + Express | Simple, fast, widely supported on Railway |
| Database | Supabase (PostgreSQL) | Managed Postgres, generous free tier, great JS client |
| Auth | Google OAuth2 + Microsoft OAuth + JWT | Industry standard; tokens stored server-side only |
| Email (Gmail) | Google Gmail API v1 | Reads real inbox after user grants permission |
| Email (Outlook) | Microsoft Graph API v1.0 | Same for Outlook / Office365 |
| AI | Anthropic Claude API (server-side) | claude-haiku for speed, claude-sonnet for quality |
| Frontend language | Vanilla JS (ES Modules) | No build step; deploys as static from Express |
| Frontend styling | CSS Custom Properties | Existing design system; zero overhead |
| State | Custom observer pattern (store.js) | No Redux/Zustand dependency |
| Routing | Hash-based router (router.js) | No library needed |
| Persistence | Supabase (server) + localStorage (UI state) | No sensitive data in localStorage |
| PWA | manifest.json + sw.js | Installable, offline shell |
| Deploy | Railway | `railway up` — handles HTTPS, env vars, restarts |
| Token encryption | AES-256-GCM (Node crypto) | OAuth tokens encrypted at rest in Supabase |

**No npm on frontend. No node_modules in public/. No build step for frontend.**
**Backend uses npm normally.**

---

## 4. DESIGN SYSTEM

All design tokens live in `public/styles.css :root`. **Never hardcode values elsewhere.**

| Category | Key tokens |
|---|---|
| Backgrounds | `--bg-app` `--bg-panel` `--bg-card` `--bg-glass` `--bg-nav` `--bg-input` |
| Brand | `--gold` `--gold-hover` `--blue` `--blue-hover` |
| State | `--green` `--red` `--amber` `--purple` `--silver` |
| Text | `--text-primary` `--text-secondary` `--text-muted` |
| Gradients | `--grad-brand` `--grad-hero` `--grad-card-top` `--grad-gold-glow` |
| Shadows | `--shadow-card` `--shadow-modal` `--shadow-btn-gold` `--shadow-btn-blue` |
| Motion | `--ease-spring` `--ease-smooth` `--ease-exit` `--dur-fast` `--dur-normal` `--dur-slow` `--dur-page` |
| Layout | `--nav-h` `--safe-bottom` `--sidebar-w` `--content-max` |
| Z-index | `--z-base` `--z-card` `--z-sticky` `--z-nav` `--z-modal` `--z-toast` `--z-loading` |

---

## 5. FEATURES

### v2.0 MVP Scope

| ID | Feature |
|---|---|
| F-01 | Onboarding — 3-screen flow: Hero → How it works → Connect inbox (OAuth buttons) |
| F-02 | Post-auth loading screen — "Synapse is reading your inbox..." with progress steps |
| F-03 | Bottom navigation — 4 tabs: Inbox, Actions, Done, Settings |
| F-04 | Desktop sidebar — 64px icon nav replacing bottom nav at >1024px |
| F-05 | Page transitions — slide animations between all tabs |
| F-06 | Inbox tab — real emails from Gmail/Outlook + filter chips + live search |
| F-07 | EmailCard v2 — sender avatar, type strip, swipe actions, AI badge |
| F-08 | Actions tab — priority-sorted AI action cards with confidence bars |
| F-09 | ActionCard v2 — confidence gauge, long-press context menu, undo |
| F-10 | Done tab — history with timestamps, stats, undo (30s window) |
| F-11 | Settings tab — account connection status, sync interval, AI behavior toggles |
| F-12 | Email detail modal — slide-up, full body, AI summary, reply draft |
| F-13 | Action detail view — full implementation status, modify |
| F-14 | Demo mode — simulated 6-email stream when no account connected |
| F-15 | Live search — filters emails by subject/sender/body instantly |
| F-16 | Filter chips — by email type (All/Meeting/Urgent/Deadline/Followup) |
| F-17 | Haptic feedback — vibrate on key actions (Vibration API, Android only) |
| F-18 | Swipe actions — left=dismiss, right=implement on mobile |
| F-19 | Skeleton loaders — while emails/actions are loading |
| F-20 | PWA manifest — installable to home screen |
| F-21 | Service worker — offline shell caching |
| F-22 | Toast system — stacked, typed (success/error/info/warning) with undo |
| F-23 | Header scroll behavior — shrinks and blurs on scroll |
| F-24 | Responsive layout — mobile (bottom nav) + desktop (sidebar + 2-panel) |
| F-25 | Real-time sync — SSE endpoint pushes new emails/actions to frontend |
| F-26 | Connection health indicator — "Synced 2m ago" in header |
| F-27 | Reconnect flow — if token expires, prompt user to reconnect in-app |
| F-28 | Smart categories — Inbox shows People / Newsletters / Notifications sections |

### Out of scope (v2.0)
- Reply sending (OAuth read-only scope for MVP)
- Push notifications (requires service worker push + VAPID keys)
- Light mode
- Team shared inbox
- Calendar API integration (actions generate drafts only)
- Multi-account support

---

## 6. FILE STRUCTURE

```
synapse/
├── .env                        ← Created at P-00-T01; NEVER commit
├── .env.example                ← Committed; shows all var names with descriptions
├── .gitignore                  ← node_modules, .env, dist
├── package.json                ← Backend dependencies
├── server.js                   ← Express entry point
├── railway.toml                ← Railway deploy config
├── README.md                   ← Setup instructions + env guide
│
├── middleware/
│   ├── auth.js                 ← JWT verify middleware
│   └── rateLimit.js            ← Per-user rate limiting
│
├── routes/
│   ├── auth.js                 ← Google + Microsoft OAuth routes
│   ├── emails.js               ← Email fetch, sync, delete routes
│   ├── actions.js              ← Action CRUD routes
│   ├── user.js                 ← User profile + settings
│   └── stream.js               ← SSE real-time endpoint
│
├── services/
│   ├── supabase.js             ← Supabase client (service role)
│   ├── gmail.js                ← Gmail API: fetch, poll, parse
│   ├── outlook.js              ← Microsoft Graph: fetch, poll, parse
│   ├── claude.js               ← Anthropic API: classify, summarize, draft
│   └── crypto.js               ← AES-256 encrypt/decrypt for tokens
│
├── engine/
│   ├── classifier.js           ← Email classification (Claude + regex fallback)
│   ├── extractor.js            ← Time/urgency/location extraction
│   └── actions.js              ← Action generation + confidence scoring
│
└── public/                     ← Static frontend (served by Express)
    ├── index.html              ← App shell
    ├── styles.css              ← Complete design system
    ├── manifest.json           ← PWA manifest
    ├── sw.js                   ← Service worker
    ├── logo.png                ← Brand asset
    ├── settings.png            ← Settings icon
    ├── icons/
    │   ├── icon-192.png
    │   └── icon-512.png
    └── js/
        ├── main.js             ← Entry point; boot sequence
        ├── router.js           ← Hash-based routing
        ├── store.js            ← Observable state
        ├── api.js              ← Calls backend REST API (not Anthropic directly)
        └── ui/
            ├── components.js   ← Pure render functions
            ├── onboarding.js   ← 3-screen first-run flow
            ├── loading.js      ← Post-auth "reading inbox" screen
            ├── inbox.js        ← Inbox tab
            ├── actions-tab.js  ← Actions tab
            ├── done.js         ← Done tab
            ├── settings.js     ← Settings tab
            ├── modals.js       ← All modals
            └── toast.js        ← Notification system
```

---

## 7. API ENDPOINTS

### Auth
```
GET  /api/auth/google                → Redirect to Google consent screen
GET  /api/auth/google/callback       → Handle code, issue JWT, redirect to /#loading
GET  /api/auth/microsoft             → Redirect to Microsoft consent screen
GET  /api/auth/microsoft/callback    → Handle code, issue JWT, redirect to /#loading
POST /api/auth/logout                → Clear session (JWT blacklist in Supabase)
GET  /api/auth/me                    → Returns { user } from JWT (used by frontend to verify session)
```

### User
```
GET  /api/user/profile               → { email, provider, displayName, avatarUrl, lastSyncAt, connectionStatus }
PUT  /api/user/settings              → Update { syncInterval, autoImplement, notifyHigh }
```

### Emails
```
GET  /api/emails                     → { emails[], total } — paginated, filterable (?type=meeting&search=q&page=1)
GET  /api/emails/:id                 → Single email with full body + aiSummary + replyDraft
POST /api/emails/sync                → Trigger manual inbox sync (returns { synced: N, newActions: N })
DELETE /api/emails/:id               → Dismiss email
```

### Actions
```
GET  /api/actions                    → { actions[] } pending — sorted by urgency
GET  /api/actions/done               → { done[] } — paginated history
POST /api/actions/:id/implement      → Mark implemented → moves to done_log
POST /api/actions/:id/dismiss        → Dismiss action
POST /api/actions/:id/snooze         → { until: ISO_DATE } — snooze action
PUT  /api/actions/:id                → Modify action label/time/location
```

### Stream (SSE)
```
GET  /api/stream                     → EventSource endpoint; pushes { type: 'email'|'action'|'sync'|'error', data }
```

---

## 8. LAYOUT BREAKPOINTS

| Name | Width | Layout |
|---|---|---|
| Mobile S | < 375px | Single column, compact spacing |
| Mobile M | 375–640px | Single column, standard spacing |
| Tablet | 640–1024px | Single column, wider cards |
| Desktop | > 1024px | Sidebar + two-panel (inbox left, actions right) |

---

## 9. INTERVENTION FORMAT

Use only for blockers, irreversible actions, ❓ tasks:

```
⚠️ INTERVENTION REQUIRED
Task: P-XX-TXX  |  Blocked by: [reason]
Details: [exact issue]
Option A: [path]
Option B: [path]
Impact: [what breaks if wrong]
```

---

## 10. VERIFICATION CHECKLIST (before marking any task ✅)

- [ ] Feature matches spec in Section 5
- [ ] No hardcoded color/spacing/font values — all from styles.css :root
- [ ] No horizontal scroll at 375px viewport width
- [ ] All tap targets ≥ 44×44px
- [ ] No inline `style=""` attributes (exceptions: JS-driven transforms/opacity)
- [ ] ES modules only — no `var`, no global pollution
- [ ] All functions have JSDoc comments
- [ ] No `console.log` in production code (use `console.error` for real errors)
- [ ] API routes: auth middleware applied, input validated, errors handled with typed JSON
- [ ] No secrets in frontend code or localStorage (tokens live in backend only)
- [ ] No `.env` values in committed code

---

## 11. PHASE END PROTOCOL

After completing ALL tasks in a phase:

1. **Run verification**: Smoke test the features added in this phase
2. **Commit**: `git add -A && git commit -m "feat(phase-X): [summary of what was built]"`
3. **Push**: `git push origin main`
4. **Output phase summary** in this format:

```
╔══════════════════════════════════════════════════════════╗
║  PHASE X COMPLETE — [Phase Name]
╠══════════════════════════════════════════════════════════╣
║  Built:
║    • [item 1]
║    • [item 2]
║    • [item 3]
║
║  Files created/modified: [list]
║
║  SUGGESTED LESSONS FOR OWNER REVIEW:
║    L-NEW-01 — [Title]: [body]. Apply to: [task IDs]
║    L-NEW-02 — [Title]: [body]. Apply to: [task IDs]
║
║  Committed: feat(phase-X): [message]
║  Pushed: ✓
╚══════════════════════════════════════════════════════════╝

Ready for Phase X+1: [Phase Name].
Type "next phase" or "resume" to continue.
```

5. **Wait** — do not begin the next phase until the user says "next phase", "resume", or "continue".

---

*End of project_config.md — READ-ONLY*