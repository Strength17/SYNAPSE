# PLAN.md
# Synapse v2.0 — AI Email Intelligence Platform
# Complete UI Rebuild & Feature Implementation Plan
# For: Gemini 2.5 Flash via Gemini CLI
# ─────────────────────────────────────────────────────────────────────────────

## WHAT SYNAPSE IS & WHAT IT SOLVES

Synapse is an autonomous AI email agent. It monitors an inbox, classifies every
incoming email (meeting, urgent, deadline, follow-up), extracts actionable data
(time, location, urgency), auto-implements low-risk actions (calendar entries,
reminders, reply drafts), and surfaces high-stakes decisions for one human click.

Problem: Professionals spend 28% of their workday on email (McKinsey, 2025).
The cognitive cost isn't reading — it's deciding what to do next with each email.
Synapse removes that decision layer entirely.

The MVP at synapse-mvp.surge.sh is a working demo with simulated data.
v2.0 upgrades it to a real, installable PWA with live Claude AI classification,
persistent state, and a professional mobile-first interface.

---

## CURRENT STATE (MVP AUDIT)

**What works:**
- Solid design system (CSS custom properties — keep and extend)
- Two-panel layout (desktop)
- Email row + action card rendering
- Scan bar animations
- Toast notifications
- Cross-linking: email ↔ action card highlighting
- Modal system (email detail, settings, modify)
- Alarm system (Web Audio API)

**What is broken or missing:**
- Mobile layout is an afterthought (panels just stack; no navigation)
- No real email integration (all data is hardcoded in engine.js)
- No real AI (regex pattern matching only)
- No persistent state (refresh = everything gone)
- No onboarding / first-run experience
- No search or filtering
- No reply composition
- Settings modal saves nothing
- "Logout" button goes nowhere
- No PWA manifest (not installable)
- No service worker (not offline-capable)
- No push notifications
- Alarm fires on every "High urgency" action — no user consent

---

## PART 1 — DESIGN SYSTEM UPGRADE

Keep the existing CSS custom properties. Add the following:

### 1.1 New Tokens (append to :root in styles.css)

```css
:root {
  /* ── Extended backgrounds ── */
  --bg-glass:         rgba(21, 32, 56, 0.72);   /* frosted glass cards */
  --bg-overlay:       rgba(5, 10, 20, 0.82);     /* modal backdrops */
  --bg-nav:           rgba(10, 17, 32, 0.96);    /* bottom nav */
  --bg-input:         rgba(255, 255, 255, 0.05); /* search / input fields */

  /* ── Gradients ── */
  --grad-brand:       linear-gradient(135deg, #2f6fed 0%, #F5A623 100%);
  --grad-card-top:    linear-gradient(180deg, rgba(47,111,237,0.12) 0%, transparent 100%);
  --grad-gold-glow:   radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%);
  --grad-hero:        linear-gradient(160deg, #0a1525 0%, #0d1830 50%, #081422 100%);

  /* ── Shadows ── */
  --shadow-card:      0 4px 24px rgba(0, 0, 0, 0.45);
  --shadow-card-hover:0 8px 32px rgba(0, 0, 0, 0.6);
  --shadow-modal:     0 24px 64px rgba(0, 0, 0, 0.7);
  --shadow-btn-gold:  0 4px 20px rgba(245, 166, 35, 0.35);
  --shadow-btn-blue:  0 4px 20px rgba(47, 111, 237, 0.35);
  --shadow-glow-green:0 0 20px rgba(34, 197, 94, 0.25);

  /* ── Motion ── */
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth:  cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-exit:    cubic-bezier(0.55, 0, 1, 0.45);
  --dur-fast:     140ms;
  --dur-normal:   240ms;
  --dur-slow:     400ms;
  --dur-page:     320ms;

  /* ── Layout ── */
  --nav-h:        64px;   /* bottom nav height */
  --safe-bottom:  env(safe-area-inset-bottom, 0px); /* iOS home bar */
  --content-max:  480px;  /* max-width for mobile content */
  --sidebar-w:    64px;   /* desktop sidebar icon width */

  /* ── Z-index scale ── */
  --z-base:     1;
  --z-card:     10;
  --z-sticky:   50;
  --z-nav:      100;
  --z-modal:    200;
  --z-toast:    300;
  --z-loading:  400;
}
```

### 1.2 Typography Scale (append to styles.css)

```css
/* Heading styles */
.t-display  { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1.2; }
.t-title    { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1.3; }
.t-heading  { font-size: 1.00rem; font-weight: 700; letter-spacing: -0.01em; }
.t-body     { font-size: 0.875rem; font-weight: 400; line-height: 1.6; }
.t-caption  { font-size: 0.75rem; font-weight: 500; color: var(--text-secondary); }
.t-micro    { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
```

### 1.3 Reusable Component Classes

```css
/* Glass card */
.card-glass {
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-soft);
  border-radius: 16px;
  box-shadow: var(--shadow-card);
}

/* Pill badge */
.badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 0.68rem; font-weight: 700; letter-spacing: 0.04em;
  padding: 3px 10px; border-radius: 20px; white-space: nowrap;
}
.badge-blue   { background: var(--blue-subtle);   color: #6fa3ff; border: 1px solid var(--blue-border); }
.badge-gold   { background: var(--gold-subtle);   color: var(--gold);   border: 1px solid var(--gold-border); }
.badge-green  { background: var(--green-subtle);  color: var(--green);  border: 1px solid var(--green-border); }
.badge-red    { background: var(--red-subtle);    color: var(--red);    border: 1px solid var(--red-border); }
.badge-amber  { background: var(--amber-subtle);  color: var(--amber);  border: 1px solid var(--amber-border); }
.badge-purple { background: var(--purple-subtle); color: var(--purple); border: 1px solid var(--purple-border); }

/* Priority dot */
.dot-live   { width: 8px; height: 8px; border-radius: 50%; background: var(--green);  animation: dot-pulse 2s infinite; }
.dot-scan   { width: 8px; height: 8px; border-radius: 50%; background: var(--blue);   animation: dot-pulse 0.5s infinite; }
.dot-idle   { width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); }

/* Skeleton loader */
.skeleton {
  background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
  border-radius: var(--radius);
}
@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Divider */
.divider { height: 1px; background: var(--border-soft); margin: 12px 0; }
```

---

## PART 2 — FILE ARCHITECTURE

The v2.0 rebuild uses a clean module structure. All JS uses ES modules.
No framework. No build step required. Files served directly.

```
synapse/
├── index.html              ← App shell (all screens rendered by JS)
├── manifest.json           ← PWA manifest
├── sw.js                   ← Service worker
├── styles.css              ← Full design system (extended from MVP)
├── logo.png                ← Existing asset
├── settings.png            ← Existing asset
│
├── js/
│   ├── main.js             ← Entry point; imports all modules; boots app
│   ├── router.js           ← Hash-based client-side routing (no library)
│   ├── store.js            ← Centralized state (observer pattern)
│   ├── api.js              ← Claude API + localStorage persistence layer
│   │
│   ├── engine/
│   │   ├── classifier.js   ← Email type detection (Claude AI + regex fallback)
│   │   ├── extractor.js    ← Time / urgency / location extraction
│   │   ├── actions.js      ← Action generation logic
│   │   └── demo-data.js    ← Demo email dataset (from MVP engine.js)
│   │
│   └── ui/
│       ├── components.js   ← Pure render functions (no DOM side-effects)
│       ├── inbox.js        ← Inbox tab — email list, filters, search
│       ├── actions-tab.js  ← Actions tab — AI analysis cards
│       ├── done.js         ← Done tab — completed actions history
│       ├── settings.js     ← Settings tab — API key, preferences
│       ├── onboarding.js   ← First-run 3-screen flow
│       ├── modals.js       ← Email detail, action detail, modify modals
│       └── toast.js        ← Toast notification system
│
└── icons/                  ← PWA icons (192x192, 512x512)
    ├── icon-192.png
    └── icon-512.png
```

---

## PART 3 — COMPLETE SCREEN SPECIFICATIONS

### 3.1 ONBOARDING (first-run, shown once)

Three swipeable screens before the app. Stored flag: `localStorage.getItem('synapse_onboarded')`.

**Screen 1 — Hook:**
```
[Full screen gradient bg: var(--grad-hero)]
[Animated logo: slow pulse glow, 120px]
[Headline]: "Your inbox,\nautomated."
[Sub]: "Synapse reads every email and takes action — so you don't have to."
[Progress dots]: ● ○ ○
[Button]: "Next →" (blue)
```

**Screen 2 — How it works:**
```
[3 animated step cards, staggered fade-in, 400ms each]
  [1] 📧 Emails arrive → Synapse reads them instantly
  [2] 🧠 AI detects meetings, deadlines, follow-ups
  [3] ⚡ Actions auto-implemented in seconds
[Progress dots]: ○ ● ○
[Button]: "Next →"
```

**Screen 3 — Connect:**
```
[Icon: large email illustration]
[Headline]: "Connect your inbox"
[Sub]: "Use Demo Mode to explore, or paste your Claude API key to enable real AI."
[Input]: "Claude API key (optional)" — password type, stored in localStorage
[Button]: "Start with Demo" (gold, primary)
[Link below]: "I have an API key — set it up →"
```

### 3.2 MAIN APP SHELL (index.html body structure)

```html
<body>
  <div id="app">
    <!-- Screens swap here -->
    <div id="screen" class="screen-active"></div>

    <!-- Bottom nav (hidden on desktop, visible on mobile) -->
    <nav id="bottom-nav" class="bottom-nav" role="navigation">
      <button class="nav-item active" data-tab="inbox"   aria-label="Inbox">
        <svg>...</svg><span>Inbox</span>
        <span class="nav-badge" id="nav-badge-inbox"></span>
      </button>
      <button class="nav-item" data-tab="actions" aria-label="Actions">
        <svg>...</svg><span>Actions</span>
        <span class="nav-badge" id="nav-badge-actions"></span>
      </button>
      <button class="nav-item" data-tab="done"    aria-label="Done">
        <svg>...</svg><span>Done</span>
      </button>
      <button class="nav-item" data-tab="settings" aria-label="Settings">
        <svg>...</svg><span>Settings</span>
      </button>
    </nav>
  </div>
</body>
```

### 3.3 HEADER (shared across all tabs)

```
Height: 56px (mobile) / 64px (desktop)
Background: var(--bg-header) with blur on scroll (backdrop-filter: blur(16px))
Position: sticky top: 0; z-index: var(--z-sticky);

Left:   [Logo 36px] [Synapse wordmark]
Center: [Tab title — updates on nav]
Right:  [Status dot + label] [Avatar/settings icon]

On scroll down: header shrinks to 48px, title fades, only logo + status visible.
On scroll up: full header restores. (IntersectionObserver on sentinel div)
```

### 3.4 INBOX TAB

**Layout:**
```
[Header — "Inbox" + email count badge]
[Filter chips: scrollable horizontal] All | 📅 Meeting | 🔴 Urgent | ⏰ Deadline | 💬 Follow-up
[Search bar: sticky, 40px, icon left, clear button right]
[Email list: virtualized, scrollable]
  ↓ Each item: EmailCard component
[FAB (mobile only): + Compose (bottom-right, 56px gold circle)]
```

**EmailCard Component:**
```
┌─────────────────────────────────────────┐
│ [colored left strip 3px, type-based]    │
│ ┌────┐  Subject (bold, 0.875rem)        │
│ │ AV │  Sender name · time ago          │
│ │ AT │  Preview (2 lines, text-muted)   │
│ └────┘  [type badge]  [urgency dot]     │
└─────────────────────────────────────────┘

Avatar: circle, 40px, gradient bg, sender initials (2 chars)
Left strip: blue=meeting, red=urgent, amber=deadline, purple=followup, silver=info
Type badge: small pill, bottom-right
On tap: opens EmailDetailModal
Swipe left (mobile): reveals "Dismiss" button (red)
Swipe right (mobile): reveals "Quick Action" button (gold)
```

**Empty state (no emails / no search results):**
```
[Centered SVG illustration — inbox with sparkles]
[Headline]: "All caught up"  OR  "No results for '[query]'"
[Sub]: "Start Demo to see Synapse in action"
[Button]: "Start Demo" (if no emails ever)
```

**Loading state (when fetching / processing):**
3 skeleton EmailCard shapes (shimmer animation)

### 3.5 ACTIONS TAB

**Layout:**
```
[Header — "Actions" + pending count]
[Priority queue bar: "3 pending · 1 urgent" — gold text, tap to sort]
[Actions list: sorted by urgency (high first)]
  ↓ Each item: ActionCard component
```

**ActionCard Component (redesigned from MVP):**
```
┌──────────────────────────────────────────────┐  ← border 1px border-soft
│ [top accent gradient line 2px, type-based]   │
│                                              │
│  #3  ·  [MEETING badge]  ·  ⚡ High         │
│  Detected: Project Launch Sync               │
│                                              │
│  ─────────────────────────────────          │
│  📅 Tomorrow at 10:00 AM                    │
│  📍 Conference Room B                        │
│                                              │
│  [──────────────────────────────────]        │
│  │ → Suggested: Schedule Meeting    │  ←── gold btn
│  [──────────────────────────────────]        │
│                                              │
│  ✓ Calendar event created    auto-calendar   │
│  ✓ Reminder set (1hr)        auto-reminder   │
│                                              │
│  [AI confidence: ████████░░ 84%]            │
└──────────────────────────────────────────────┘

Tap anywhere: expands to ActionDetailView
Tap gold button: marks as implemented, moves to Done tab
Long press: shows context menu (Edit / Dismiss / Snooze)
```

**AI confidence bar:**
```css
.confidence-bar {
  height: 3px; border-radius: 2px;
  background: var(--border-soft);
}
.confidence-fill {
  height: 100%; border-radius: 2px;
  background: var(--grad-brand);
  transition: width 0.6s var(--ease-spring);
}
```

### 3.6 DONE TAB

```
[Header — "Done" + today's count]
[Stats row: "7 today · 23 this week · 91 this month" — tappable, shows breakdown]
[Filter: Today | This Week | All Time]
[Completed action list — dimmed, green checkmark, smaller cards]
  Each item shows: email subject + action taken + timestamp + "Undo" link
[Empty state: "Nothing done yet today." + motivational micro-copy]
```

### 3.7 SETTINGS TAB

```
[Header — "Settings"]

Section: AI Engine
  ├── API Key: [input, password type, show/hide toggle] [Test] [Save]
  ├── Model: Claude 3 Haiku (fast) ● / Sonnet (smart)
  └── Mode: Demo Mode toggle (if ON, ignores API key)

Section: Notifications
  ├── Enable push notifications [toggle]
  ├── High urgency alerts [toggle]
  └── Daily digest [toggle]

Section: Email Behavior
  ├── Auto-implement low-risk actions [toggle]
  ├── Check interval: [5s · 10s · 30s · 1min] segmented control
  └── Alarm frequency: [15min · 30min · 1hr] segmented control

Section: Display
  ├── Theme: Dark ● / Light (future)
  └── Compact mode [toggle]

Section: Account
  ├── Connect Gmail [button — future]
  ├── Connect Outlook [button — future]
  └── Export data [button]

Section: About
  ├── Version: 2.0.0
  ├── Privacy Policy [link]
  └── Feedback [link → mailto]
```

### 3.8 EMAIL DETAIL MODAL

Slides up from bottom on mobile (sheet), centered on desktop.

```
[Drag handle at top (mobile)]
[Sender avatar 56px + name + email]
[Subject — bold, 1.1rem]
[Timestamp + type badge]
[─────────────────────────]
[Full email body — scrollable]
[─────────────────────────]
[AI SUMMARY (if API key set)]:
  "Quick summary:" [1–2 sentence Claude-generated summary in italic, gold left border]

[─────────────────────────]
[SUGGESTED REPLY (if API key set)]:
  [Draft text, editable QTextEdit-equivalent — contenteditable div]
  [Edit] [Copy] [Send Draft ▶] buttons

[─────────────────────────]
[LINKED ACTION]: taps → scrolls Actions tab to matching card
```

### 3.9 BOTTOM NAVIGATION (mobile, < 1024px)

```css
.bottom-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: calc(var(--nav-h) + var(--safe-bottom));
  padding-bottom: var(--safe-bottom);
  background: var(--bg-nav);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--border-soft);
  display: flex;
  align-items: flex-start;
  padding-top: 8px;
  z-index: var(--z-nav);
}

.nav-item {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 4px;
  font-size: 0.65rem; font-weight: 600; color: var(--text-muted);
  background: none; border: none; cursor: pointer;
  padding: 6px 4px; position: relative;
  transition: color var(--dur-fast) ease;
}

.nav-item.active { color: var(--gold); }
.nav-item.active svg { filter: drop-shadow(0 0 8px rgba(245,166,35,0.5)); }

.nav-item svg {
  width: 22px; height: 22px;
  transition: transform var(--dur-fast) var(--ease-spring);
}
.nav-item:active svg { transform: scale(0.85); }

.nav-badge {
  position: absolute; top: 2px; right: 20%;
  min-width: 16px; height: 16px; padding: 0 4px;
  background: var(--red); color: #fff;
  font-size: 0.60rem; font-weight: 800;
  border-radius: 8px; border: 2px solid var(--bg-app);
  display: none; align-items: center; justify-content: center;
}
.nav-badge:not(:empty) { display: flex; }
```

### 3.10 DESKTOP SIDEBAR (> 1024px)

Replace bottom nav with a 64px vertical sidebar on the left:

```
┌────┐
│    │  Logo (36px icon)
├────┤
│ 📥 │  Inbox (active: left accent bar 3px gold)
│ ⚡ │  Actions
│ ✅ │  Done
│    │
│    │  (spacer, flex: 1)
│    │
│ ⚙  │  Settings (pinned bottom)
└────┘
```

---

## PART 4 — AI ENGINE (Claude API Integration)

### 4.1 API Module (js/api.js)

```javascript
/**
 * api.js — Claude API + persistence layer
 */

const CLAUDE_API = 'https://api.anthropic.com/v1/messages';
const MODEL_HAIKU  = 'claude-haiku-4-5-20251001';
const MODEL_SONNET = 'claude-sonnet-4-6';

export async function classifyEmail(email, apiKey, model = MODEL_HAIKU) {
  /**
   * Classifies an email and extracts structured action data.
   * Falls back to regex engine if no API key.
   * Returns: { type, detected, time, urgency, location, actionLabel,
   *            summary, confidence, impl[] }
   */
  if (!apiKey) return legacyClassify(email); // regex fallback

  const prompt = `You are an email intelligence AI. Analyze this email and return ONLY valid JSON.

Email Subject: ${email.subject}
Sender: ${email.sender}
Body: ${email.preview}

Return this exact JSON structure (no markdown, no explanation):
{
  "type": "meeting|urgent|deadline|followup|info",
  "detected": "Brief label of what was detected",
  "time": "Extracted time/date or null",
  "urgency": "High|Normal|Low",
  "location": "Extracted location or null",
  "actionLabel": "Specific recommended action",
  "summary": "One sentence summary of this email",
  "confidence": 0.0_to_1.0,
  "impl": [
    {"badge": "done|queued|alert|info", "label": "Action taken or pending", "source": "system-name"}
  ]
}`;

  const response = await fetch(CLAUDE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`);

  const data = await response.json();
  const text = data.content[0].text.trim();
  return JSON.parse(text);
}

export async function draftReply(email, apiKey, model = MODEL_HAIKU) {
  /**
   * Generates a professional reply draft for an email.
   * Returns: string (the draft reply text)
   */
  if (!apiKey) return null;

  const prompt = `Draft a brief, professional reply to this email.
Subject: ${email.subject}
From: ${email.sender}
Body: ${email.preview}

Write ONLY the reply body text. No subject line. No sign-off placeholder. 
Keep it under 80 words. Professional but warm tone.`;

  const response = await fetch(CLAUDE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.content[0].text.trim();
}
```

**IMPORTANT — API key security note:**
The API key is stored in `localStorage` only. It is sent directly from the browser
to Anthropic's API (using the `anthropic-dangerous-direct-browser-access` header
which Anthropic requires for browser-direct calls). This is acceptable for a
personal tool / MVP. Document this clearly in the README and settings UI.

### 4.2 Store (js/store.js)

```javascript
/**
 * store.js — Observable state store
 * Simple pub/sub pattern. No libraries.
 */

const _state = {
  // Emails
  emails: [],           // All received emails
  emailsFiltered: [],   // After filter/search applied

  // Actions
  actions: [],          // All generated action objects
  done: [],             // Completed/implemented actions

  // App status
  status: 'idle',       // 'idle' | 'listening' | 'scanning' | 'processing'
  activeTab: 'inbox',   // 'inbox' | 'actions' | 'done' | 'settings'
  filter: 'all',        // 'all' | 'meeting' | 'urgent' | 'deadline' | 'followup'
  search: '',           // Current search query

  // Settings
  apiKey: localStorage.getItem('synapse_api_key') || '',
  demoMode: !localStorage.getItem('synapse_api_key'),
  model: localStorage.getItem('synapse_model') || 'haiku',
  autoImplement: localStorage.getItem('synapse_auto_impl') !== 'false',
  checkInterval: parseInt(localStorage.getItem('synapse_interval') || '10'),

  // UI
  isRunning: false,
  onboarded: !!localStorage.getItem('synapse_onboarded'),
};

const _listeners = new Map();

export const store = {
  get: (key) => _state[key],
  getAll: () => ({ ..._state }),

  set(key, value) {
    _state[key] = value;
    (_listeners.get(key) || []).forEach(fn => fn(value));
    (_listeners.get('*') || []).forEach(fn => fn({ key, value }));
  },

  on(key, fn) {
    if (!_listeners.has(key)) _listeners.set(key, []);
    _listeners.get(key).push(fn);
    return () => { // returns unsubscribe
      const arr = _listeners.get(key);
      const i = arr.indexOf(fn);
      if (i > -1) arr.splice(i, 1);
    };
  },

  persist(key, value) {
    this.set(key, value);
    const persistMap = {
      apiKey: 'synapse_api_key',
      model: 'synapse_model',
      autoImplement: 'synapse_auto_impl',
      checkInterval: 'synapse_interval',
    };
    if (persistMap[key]) localStorage.setItem(persistMap[key], String(value));
  },
};
```

---

## PART 5 — ANIMATIONS & INTERACTIONS

### 5.1 Page Transitions

All tab switches must animate. Use CSS classes + JS to trigger:

```javascript
function navigateTo(tab) {
  const screen = document.getElementById('screen');
  const current = store.get('activeTab');
  const tabs = ['inbox', 'actions', 'done', 'settings'];
  const direction = tabs.indexOf(tab) > tabs.indexOf(current) ? 'forward' : 'back';

  screen.classList.add(`exit-${direction}`);
  setTimeout(() => {
    renderTab(tab);
    screen.className = 'screen-active';
    screen.classList.add(`enter-${direction}`);
    setTimeout(() => screen.classList.remove(`enter-${direction}`), 320);
  }, 160);
}
```

```css
/* Forward: current slides left, new slides in from right */
.exit-forward  { animation: slide-out-left  160ms var(--ease-exit) forwards; }
.enter-forward { animation: slide-in-right  320ms var(--ease-spring) forwards; }
/* Back: current slides right, new slides in from left */
.exit-back     { animation: slide-out-right 160ms var(--ease-exit) forwards; }
.enter-back    { animation: slide-in-left   320ms var(--ease-spring) forwards; }

@keyframes slide-out-left  { to { opacity: 0; transform: translateX(-24px); } }
@keyframes slide-out-right { to { opacity: 0; transform: translateX(24px); } }
@keyframes slide-in-right  { from { opacity: 0; transform: translateX(32px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slide-in-left   { from { opacity: 0; transform: translateX(-32px); } to { opacity: 1; transform: translateX(0); } }
```

### 5.2 Card Entrance Animations

Stagger email rows and action cards:
```css
.email-card, .action-card {
  opacity: 0;
  animation: card-enter var(--dur-normal) var(--ease-spring) forwards;
}
/* Each card gets animation-delay via JS: el.style.animationDelay = `${index * 60}ms` */

@keyframes card-enter {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```

### 5.3 Swipe Actions (mobile email rows)

```javascript
function addSwipeHandlers(el, onSwipeLeft, onSwipeRight) {
  let startX, startY, isDragging = false;
  const THRESHOLD = 72; // px to trigger action

  el.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = true;
  }, { passive: true });

  el.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (Math.abs(dy) > Math.abs(dx)) { isDragging = false; return; }
    e.preventDefault();
    el.style.transform = `translateX(${dx}px)`;
    el.style.transition = 'none';
    // Reveal action buttons behind card
    if (dx < -20) showSwipeAction(el, 'left', Math.abs(dx));
    if (dx > 20)  showSwipeAction(el, 'right', dx);
  }, { passive: false });

  el.addEventListener('touchend', e => {
    isDragging = false;
    const dx = e.changedTouches[0].clientX - startX;
    el.style.transition = 'transform 0.3s var(--ease-spring)';
    el.style.transform = 'translateX(0)';
    if (dx < -THRESHOLD) onSwipeLeft();
    if (dx > THRESHOLD)  onSwipeRight();
    hideSwipeActions(el);
  });
}
```

### 5.4 Haptic Feedback

```javascript
function haptic(type = 'light') {
  if (!navigator.vibrate) return;
  const patterns = {
    light:   [10],
    medium:  [20],
    success: [10, 30, 10],
    error:   [50, 20, 50],
  };
  navigator.vibrate(patterns[type] || patterns.light);
}
```
Call `haptic('success')` on SEND/approve, `haptic('error')` on dismiss.

---

## PART 6 — PWA (Progressive Web App)

### 6.1 manifest.json

```json
{
  "name": "Synapse — Email Intelligence",
  "short_name": "Synapse",
  "description": "Autonomous AI email action engine",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0d1830",
  "theme_color": "#0d1830",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "shortcuts": [
    { "name": "View Actions", "url": "/#actions", "icons": [{"src": "icons/icon-192.png", "sizes": "192x192"}] },
    { "name": "Start Demo",   "url": "/#demo",    "icons": [{"src": "icons/icon-192.png", "sizes": "192x192"}] }
  ],
  "categories": ["productivity", "utilities"],
  "screenshots": []
}
```

### 6.2 sw.js (Service Worker)

```javascript
const CACHE = 'synapse-v2';
const SHELL = ['/', '/index.html', '/styles.css', '/js/main.js',
               '/logo.png', '/manifest.json', '/icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network-first for API calls, cache-first for shell
  if (e.request.url.includes('anthropic.com')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
```

---

## PART 7 — LIVE LISTENING FEATURE (Enhanced Demo)

The "Start Listening" button triggers an enhanced demo that feels real:

1. Status changes to `listening` with animated green dot
2. Shows "Waiting for emails…" in header
3. After `checkInterval` seconds, first email "arrives" with:
   - Toast notification: "📧 New email from Sarah Chen"
   - Header scan animation
   - If API key set: calls Claude API to classify → real confidence score
   - If demo mode: uses legacy engine with slight random delay (feels less robotic)
4. Action card appears 1.1s after email card (shows "AI processing...")
5. Continues until all demo emails shown OR user presses Stop

**Demo enhancement — random delays:**
Instead of fixed 10s intervals, use:
```javascript
const jitter = () => Math.random() * 3000 - 1500; // ±1.5 seconds
const delay = (base) => base + jitter();
```

---

## PART 8 — SEARCH & FILTER SYSTEM

### 8.1 Filter Chips

Horizontal scrollable row of chips. Only one active at a time.
On select: filters `store.emails` → `store.emailsFiltered` → re-renders inbox list.

```javascript
function applyFilter(emails, filter, search) {
  let result = [...emails];
  if (filter !== 'all') result = result.filter(e => e.type === filter);
  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(e =>
      e.subject.toLowerCase().includes(q) ||
      e.sender.toLowerCase().includes(q) ||
      e.preview.toLowerCase().includes(q)
    );
  }
  return result;
}
```

### 8.2 Search UX

- Search input is always visible (sticky below header on Inbox tab)
- Results update on every keystroke (no debounce needed — local data)
- If search is active, show "X results for '[query]'" above list
- Clear button (×) appears when input is non-empty
- Pressing Escape clears search
- Highlight matching text in subject with `<mark>` tags

---

## PART 9 — RESPONSIVE LAYOUT

### 9.1 Breakpoints

```css
/* Mobile-first base styles — all screens < 640px use these */

/* Tablet */
@media (min-width: 640px) { ... }

/* Desktop */
@media (min-width: 1024px) {
  body { overflow: hidden; } /* prevent body scroll; panels scroll individually */
  #bottom-nav { display: none; }
  #app { display: grid; grid-template-columns: var(--sidebar-w) 1fr 1fr; height: 100vh; }
  #screen { grid-column: 2 / 4; display: grid; grid-template-columns: 1fr 1fr; }
  /* Inbox tab on left, Actions on right simultaneously */
}
```

### 9.2 Mobile-Specific Patterns

- **Tap targets**: minimum 44×44px (WCAG AA)
- **Safe areas**: all fixed elements use `padding-bottom: env(safe-area-inset-bottom)`
- **Overscroll**: `overscroll-behavior: contain` on scroll containers
- **Text size**: never below 14px (prevents iOS auto-zoom on inputs)
- **Inputs**: `font-size: 16px` minimum (prevents iOS zoom on focus)
- **Images**: always `max-width: 100%`
- **Long press**: context menus on action cards (700ms timer)

---

## PART 10 — TASK TABLE

Execute in exact order. No bundling. No skipping.

| ID | Task | File(s) | Agent | Notes |
|----|------|---------|-------|-------|
| S-01 | Read all docs; audit existing synapse/ files | — | @build | Note all existing files vs new structure |
| S-02 | Write extended CSS design system tokens (Part 1) | styles.css | @build | Append to existing — do NOT delete old tokens |
| S-03 | Write reusable component CSS classes (Part 1.3) | styles.css | @build | skeleton, badge, card-glass, divider, etc. |
| S-04 | Write page transition + animation CSS (Part 5.1, 5.2) | styles.css | @build | All keyframes in one place |
| S-05 | Write bottom nav CSS + desktop sidebar CSS (Part 3.9, 3.10) | styles.css | @architect | Responsive breakpoints, active states, badges |
| S-06 | Write mobile card + swipe action CSS | styles.css | @build | Email card, action card v2 redesign |
| S-07 | Write manifest.json (Part 6.1) | manifest.json | @build | |
| S-08 | Write sw.js (Part 6.2) | sw.js | @build | |
| S-09 | Write js/store.js (Part 4.2) | js/store.js | @build | Pure JS, no dependencies |
| S-10 | Write js/api.js (Part 4.1) | js/api.js | @build | Claude API + legacy fallback |
| S-11 | Write js/router.js — hash-based navigation | js/router.js | @build | Tab switching + history |
| S-12 | Write js/engine/demo-data.js — dataset from MVP | js/engine/demo-data.js | @build | Extract EMAIL_DATA from engine.js verbatim |
| S-13 | Write js/engine/classifier.js — Claude + regex hybrid | js/engine/classifier.js | @architect | Calls api.js; falls back to legacy patterns |
| S-14 | Write js/engine/extractor.js — time/location/urgency | js/engine/extractor.js | @build | Extract from MVP engine.js |
| S-15 | Write js/engine/actions.js — action generation | js/engine/actions.js | @build | Enhanced ACTION_MAP + confidence scoring |
| S-16 | Write js/ui/toast.js — notification system | js/ui/toast.js | @build | Stacked toasts, icons, auto-dismiss |
| S-17 | Write js/ui/components.js — pure render functions | js/ui/components.js | @architect | EmailCard, ActionCard, SkeletonCard, EmptyState |
| S-18 | Write js/ui/onboarding.js — 3-screen first-run flow | js/ui/onboarding.js | @architect | Swipeable, localStorage flag |
| S-19 | Write js/ui/inbox.js — Inbox tab (full feature) | js/ui/inbox.js | @architect | Filter chips, search, list, swipe handlers |
| S-20 | Write js/ui/actions-tab.js — Actions tab | js/ui/actions-tab.js | @architect | Priority queue, confidence bars, long press |
| S-21 | Write js/ui/done.js — Done tab | js/ui/done.js | @build | Stats, history list, undo |
| S-22 | Write js/ui/settings.js — Settings tab | js/ui/settings.js | @build | API key input, toggles, test button |
| S-23 | Write js/ui/modals.js — all modals | js/ui/modals.js | @architect | Email detail, action detail, modify — slide-up on mobile |
| S-24 | Write index.html — app shell with PWA meta | index.html | @build | Minimal HTML; JS renders everything |
| S-25 | Write js/main.js — entry point; boot sequence | js/main.js | @architect | Store init, SW register, onboarding check, router |
| S-26 | Smoke test: open in browser, all tabs navigate | — | @build | No JS errors in console |
| S-27 | Test mobile layout: resize to 375px, all elements correct | — | @build | Bottom nav visible, no overflow |
| S-28 | Test demo mode: Start Listening → all 6 emails + actions appear | — | @architect | Timing, animations, cross-linking correct |
| S-29 | Test API mode: add a test API key → classify one email | — | @architect | Real Claude response parses correctly |
| S-30 | Test search: type in search box → results filter live | — | @build | Case-insensitive, clears correctly |
| S-31 | Test onboarding: clear localStorage, reload → onboarding appears | — | @build | 3 screens, swipeable, flag set on complete |
| S-32 | Test PWA: install to home screen on mobile → launches standalone | — | @build | manifest.json valid, icons present |
| S-33 | Test offline: go offline → app loads from cache | — | @build | SW caches shell correctly |
| S-34 | Cross-browser: Chrome, Safari, Firefox (mobile + desktop) | — | @architect | Fix any vendor prefix issues |
| S-35 | Final audit: no console errors, no accessibility violations | — | @build | Check aria-labels on all interactive elements |
| S-36 | Deploy to surge.sh: `surge . synapse-mvp.surge.sh` | — | @build | Verify live URL loads correctly |
| S-37 | Phase commit: `feat(v2): complete UI rebuild and core feature implementation` | — | @build | Push to GitHub |

---

## PART 11 — WHAT "DONE" LOOKS LIKE

All of the following must be true simultaneously:

- [ ] App opens to onboarding on first run; main app on return visits
- [ ] Bottom nav switches tabs with slide animation (< 300ms)
- [ ] Header adapts on scroll (shrinks, backdrop blur)
- [ ] Inbox tab: filter chips and search work correctly
- [ ] EmailCard swipe left = dismiss animation; swipe right = quick action
- [ ] Actions tab: cards sorted by urgency, confidence bars filled correctly
- [ ] Done tab: completed actions with timestamps and undo
- [ ] Settings: API key saves, Test button verifies key, toggles persist
- [ ] Demo mode: 6 emails + 6 action cards appear with correct animations
- [ ] API mode: real Claude JSON response rendered correctly
- [ ] Email detail modal: slides up, shows summary + reply draft
- [ ] Desktop layout: sidebar + two-panel view, no bottom nav
- [ ] PWA: installable, offline shell works
- [ ] Zero layout breaks at 320px, 375px, 430px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on any screen size
- [ ] All tap targets ≥ 44×44px

---

*End of PLAN.md*
