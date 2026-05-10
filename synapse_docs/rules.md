# rules.md
# Synapse — Global Agent Rules
# Applied across all sessions
# ─────────────────────────────────────────────────────────────────────────────

## Code Quality
- ES2022+ only — no `var`, no legacy patterns
- `const` always; `let` only when reassignment is needed
- Arrow functions for callbacks; named functions for module exports
- All async operations use `async/await` — no raw Promise chains
- All fetch calls wrapped in try/catch with typed error handling
- All functions have JSDoc: `/** @param {type} name @returns {type} */`
- No `console.log` in production; `console.error` for caught errors only

## CSS Architecture
- Every color, spacing, radius, shadow, duration = CSS custom property from `:root`
- No hardcoded hex values, pixel values, or easing functions outside `:root`
- No inline `style=""` attributes (exception: JS-driven animation transforms)
- Class names: lowercase, hyphenated, descriptive (`.email-card`, `.nav-item--active`)
- One CSS file (`styles.css`) — no separate files, no CSS-in-JS
- Animations must degrade gracefully: `@media (prefers-reduced-motion: reduce)` block required

## JavaScript Architecture
- Strict module separation:
  - `engine/` = pure logic, zero DOM
  - `ui/` = DOM only, imports from store.js and components.js
  - `store.js` = state only, zero DOM and zero API calls
  - `api.js` = network only, zero DOM and zero state
  - `main.js` = wiring only, imports all modules
- No circular imports between modules
- All DOM queries cached in module-level constants — never re-query inside loops

## Security
- Never embed an API key in source code
- API keys stored in localStorage only, retrieved via `store.get('apiKey')`
- All user-provided text sanitized with `escHtml()` before `innerHTML`
- CSP-friendly: no `eval()`, no `new Function()`, no dynamic `<script>` injection

## Mobile / UX Rules
- Minimum tap target: 44×44px (WCAG 2.1 AA)
- Minimum font size in inputs: 16px (prevents iOS auto-zoom)
- All fixed/sticky bottom elements include `padding-bottom: env(safe-area-inset-bottom)`
- `overscroll-behavior: contain` on all scroll containers
- Touch swipe handlers: touchstart passive=true, touchmove passive=false
- Haptic feedback: always guard with `if (navigator.vibrate)`
- Page transitions complete in ≤ 320ms (don't block perceived interaction)

## Accessibility
- All interactive elements have `aria-label` or visible text label
- Icon-only buttons must have `aria-label="Description"`
- Color is never the only indicator (always pair with icon or text)
- Focus ring visible on keyboard navigation (don't remove outline without custom style)
- `role="navigation"` on `<nav>` elements
- `aria-current="page"` on active nav item

## Deployment
- No build step — all files served as-is
- Test on local HTTP server before deploying: `python -m http.server 8080`
- Deploy command: `surge . synapse-mvp.surge.sh`
- Verify at https://synapse-mvp.surge.sh within 60 seconds of deploy

## Communication (every task response)
- First line: `▶ S-XX — [Task Name] — @agent`
- Second line: "Lessons applied: L-XXX, L-XXX" (or "None applicable")
- List all files created or modified at end of response
- State assumptions explicitly; log in workflow_state.md ASSUMPTIONS LOG
- Update workflow_state.md before ending every response
