# workflow_state.md
# Synapse v2.0 — Dynamic State File
# Update after every task. Never end a session without updating this.
# ─────────────────────────────────────────────────────────────────────────────

## CURRENT STATE

```
┌──────────────────────────────────────────────────────────────────────┐
│  Project      : Synapse v2.0                                         │
│  Phase        : P-09 — TESTING & DEPLOY                              │
│  Current Task : P-09-T01                                             │
│  Status       : IN PROGRESS                                          │
│  Last Updated : May 2026                                             │
│  Stack        : Node/Express + Supabase + MS OAuth + Claude         │
│  Deploy       : Railway                                              │
└──────────────────────────────────────────────────────────────────────┘
```

## CONTEXT

Full-stack rebuild of Synapse. The MVP at synapse-mvp.surge.sh used demo data
and no real email. v2.0 connects to real Outlook via OAuth (Google removed per user),
classifies emails with Claude AI (server-side), stores everything in Supabase,
and serves a mobile-first PWA from Express.

---

## STATUS LEGEND

| Symbol | Meaning |
|--------|---------|
| ⬜ | PENDING |
| 🔄 | IN PROGRESS |
| ✅ | COMPLETE |
| 🚫 | BLOCKED |
| ❓ | AWAITING INPUT |
| 🔜 | DEFERRED |

---

## PHASE 0 — ENVIRONMENT SETUP

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P-00-T01 | Create .env + output ENV SETUP GUIDE | ✅ | Google OAuth removed per user request |
| P-00-T02 | Create .env.example | ✅ | |
| P-00-T03 | Create .gitignore | ✅ | |
| P-00-T04 | Create package.json | ✅ | |
| P-00-T05 | Create railway.toml | ✅ | |
| P-00-T06 | Create README.md | ✅ | |
| P-00-T07 | npm install + verify | ✅ | |
| P-00-T08 | Instruct user to run supabase_schema.sql | ✅ | |

## PHASE 1 — BACKEND FOUNDATION

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P-01-T01 | services/supabase.js | ✅ | |
| P-01-T02 | services/crypto.js | ✅ | |
| P-01-T03 | middleware/auth.js | ✅ | |
| P-01-T04 | middleware/rateLimit.js | ✅ | |
| P-01-T05 | routes/user.js | ✅ | |
| P-01-T06 | /api/health endpoint | ✅ | |
| P-01-T07 | server.js (full) | ✅ | |
| P-01-T08 | Test health endpoint | ❓ | Waiting for valid SUPABASE_SERVICE_ROLE_KEY in .env |

## PHASE 2 — OAUTH & AUTH

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P-02-T01 | Google OAuth routes | ✅ | Unified in routes/auth.js |
| P-02-T02 | Microsoft OAuth routes | ✅ | Unified in routes/auth.js |
| P-02-T03 | POST /auth/logout | ✅ | Blacklists JTI in Supabase |
| P-02-T04 | GET /auth/me | ✅ | Returns user info from JWT |
| P-02-T05 | Token refresh logic | ✅ | Initialized in services/tokens.js |
| P-02-T06 | Test Google OAuth | ⬜ | Waiting for valid creds |
| P-02-T07 | Test JWT / /me | ⬜ | |

## PHASE 3 — EMAIL SERVICES

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P-03-T01 | services/gmail.js — fetchEmails | ✅ | |
| P-03-T02 | services/gmail.js — detectCategory | ✅ | |
| P-03-T03 | services/gmail.js — getEmailBody | ✅ | |
| P-03-T04 | services/outlook.js | 🔜 | Removed per user request |
| P-03-T05 | services/outlook.js — cleanup | 🔜 | Removed |
| P-03-T06 | routes/emails.js — GET /emails | ✅ | |
| P-03-T07 | routes/emails.js — GET /emails/:id | ✅ | |
| P-03-T08 | routes/emails.js — POST /emails/sync | ✅ | |
| P-03-T09 | routes/emails.js — DELETE /emails/:id | ✅ | |
| P-03-T10 | Test real email sync | ⬜ | |

## PHASE 4 — AI ENGINE

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P-04-T01 | services/claude.js — classifyEmail | ✅ | |
| P-04-T02 | services/claude.js — draftReply | ✅ | |
| P-04-T03 | services/claude.js — summarize | ✅ | |
| P-04-T04 | engine/extractor.js | ✅ | |
| P-04-T05 | engine/classifier.js | ✅ | |
| P-04-T06 | engine/actions.js | ✅ | |
| P-04-T07 | routes/actions.js — GET /actions | ✅ | |
| P-04-T08 | routes/actions.js — GET /actions/done | ✅ | |
| P-04-T09 | routes/actions.js — implement | ✅ | |
| P-04-T10 | routes/actions.js — dismiss | ✅ | |
| P-04-T11 | routes/actions.js — snooze | ✅ | |
| P-04-T12 | routes/actions.js — update | ✅ | |
| P-04-T13 | Test AI classification | ⬜ | |

## PHASE 5 — REAL-TIME STREAM

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P-05-T01 | routes/stream.js — SSE endpoint | ✅ | |
| P-05-T02 | Background sync scheduler | ✅ | Unified in services/sync.js |
| P-05-T03 | SSE disconnect cleanup | ✅ | Stops sync loop on close |
| P-05-T04 | Test SSE in browser | ⬜ | |

## PHASE 6 — FRONTEND FOUNDATION

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P-06-T01 | styles.css — new design tokens | ✅ | |
| P-06-T02 | styles.css — typography + components | ✅ | |
| P-06-T03 | styles.css — animations | ✅ | |
| P-06-T04 | styles.css — nav + sidebar | ✅ | |
| P-06-T05 | styles.css — cards | ✅ | |
| P-06-T06 | styles.css — screens (loading/onboarding/modal) | ✅ | |
| P-06-T07 | manifest.json | ✅ | |
| P-06-T08 | sw.js | ✅ | |
| P-06-T09 | store.js | ✅ | |
| P-06-T10 | router.js | ✅ | |
| P-06-T11 | api.js | ✅ | |
| P-06-T12 | index.html | ✅ | |

## PHASE 7 — FRONTEND UI

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P-07-T01 | toast.js | ✅ | |
| P-07-T02 | components.js | ✅ | |
| P-07-T03 | loading.js | ✅ | |
| P-07-T04 | onboarding.js | ✅ | OAuth buttons only; NO API key input |
| P-07-T05 | inbox.js | ✅ | |
| P-07-T06 | actions-tab.js | ✅ | |
| P-07-T07 | done.js | ✅ | |
| P-07-T08 | settings.js | ✅ | |
| P-07-T09 | modals.js | ✅ | |
| P-07-T10 | reconnect flow | ✅ | |


## PHASE 8 — WIRING

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P-08-T01 | main.js (boot + wiring) | ✅ | |
| P-08-T02 | SSE → store + UI | ✅ | |
| P-08-T03 | Swipe → API calls | ✅ | |
| P-08-T04 | Implement + undo | ✅ | |
| P-08-T05 | Sync indicator wiring | ✅ | |
| P-08-T06 | Demo mode wiring | ✅ | |
| P-08-T07 | demo-data.js | ✅ | |
| P-08-T08 | End-to-end test | ⬜ | |

## PHASE 9 — TESTING & DEPLOY

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P-09-T01 | Smoke test | ⬜ | |
| P-09-T02 | Mobile layout | ⬜ | |
| P-09-T03 | Demo mode | ⬜ | |
| P-09-T04 | Gmail E2E | ⬜ | |
| P-09-T05 | Outlook E2E | ⬜ | |
| P-09-T06 | SSE real-time | ⬜ | |
| P-09-T07 | Undo flow | ⬜ | |
| P-09-T08 | Search/filter | ⬜ | |
| P-09-T09 | Onboarding | ⬜ | |
| P-09-T10 | Token expiry / reconnect | ⬜ | |
| P-09-T11 | Desktop layout | ⬜ | |
| P-09-T12 | PWA install | ⬜ | |
| P-09-T13 | Offline SW | ⬜ | |
| P-09-T14 | Accessibility | ⬜ | |
| P-09-T15 | Rate limit | ⬜ | |
| P-09-T16 | Update .env for production | ⬜ | |
| P-09-T17 | Railway deploy | ⬜ | |
| P-09-T18 | Update Google OAuth redirect | ⬜ | |
| P-09-T19 | Update Microsoft OAuth redirect | ⬜ | |
| P-09-T20 | Smoke test production | ⬜ | |
| P-09-T21 | Final commit + push | ⬜ | |

---

## AUDIT LOG (filled at P-00-T01)

| File | Exists | Keep/Replace | Notes |
|------|--------|-------------|-------|
| index.html | ? | Replace | New app shell |
| styles.css | ? | Extend | Keep all existing rules |
| engine.js | ? | Split → engine/ | |
| app.js | ? | Split → public/js/ui/ | |
| logo.png | ? | Keep | |
| settings.png | ? | Keep | |

---

## ASSUMPTIONS LOG

| Date | Task | Assumption | Impact |
|------|------|-----------|--------|
| May 2026 | All | Railway provides HTTPS by default | Required for OAuth redirects and PWA service worker |
| May 2026 | P-02 | Google OAuth allows localhost redirect URI for development | Required; add production URI after deploy |
| May 2026 | P-03 | Gmail API returns up to 500 messages per page; we fetch 50 per sync | Keeps sync fast; add pagination later |
| May 2026 | P-04 | Claude Haiku handles JSON reliably with JSON-fence stripping | If not, switch to Sonnet for classification |
| May 2026 | P-05 | Railway does not terminate long-lived SSE connections | If it does, fall back to 30s polling |

---

## BLOCKERS LOG

*No active blockers.*

---

## USER DECISIONS LOG

| Date | Decision |
|------|----------|
| May 2026 | Backend: Node/Express on Railway |
| May 2026 | Database: Supabase (PostgreSQL) |
| May 2026 | Auth: Google OAuth + Microsoft OAuth (real inbox access) |
| May 2026 | AI: Claude API on backend only — users never see API keys |
| May 2026 | Frontend: Vanilla JS PWA, no framework, served as static from Express |
| May 2026 | UX: OAuth-first onboarding; no API key input for users; smart email categories |
| May 2026 | After each phase: commit + push + lessons + summary + await "next phase" |e" |