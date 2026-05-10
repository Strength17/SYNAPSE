# GEMINI.md
# Synapse v2.0 — Gemini CLI Agent Instructions
# Static cache content — always load first
# ─────────────────────────────────────────────────────────────────────────────

## Session Start (Every Time)
Before writing a single line of code, read ALL of the following documents in this exact order:
1. `synapse_docs/project_config.md` — architecture, stack, file structure, design system
2. `synapse_docs/lessons_learned.md` — hard-won lessons; apply every relevant one
3. `synapse_docs/rules.md` — non-negotiable coding, CSS, and UX rules
4. `synapse_docs/workflow_state.md` — find the first ⬜ task and start there
5. `synapse_docs/supabase_schema.sql` — database schema reference

Announce: `▶ [Task ID] — [Task Name] — @agent`

## Operating Mode
- **Autonomous**: Do not stop to ask questions unless you hit a ❓ task or a genuine blocker you cannot resolve.
- **Sequential**: Complete tasks in exact order. Never skip. Never bundle phases.
- **Phase-aware**: At the end of every phase, follow the PHASE END PROTOCOL in `project_config.md` Section 11 before moving on.
- **Verified**: Before marking any task ✅, run through the VERIFICATION CHECKLIST in `project_config.md` Section 10.

## Request Efficiency
- Batch ALL file reads into one tool call.
- Never re-read a file already in context this session.
- Think completely before making any tool call.
- If already know the answer from context, do not make a tool call to confirm.

## Agent Selection
- Check AGENT column in `workflow_state.md` before every task.
- `@build` → proceed directly (CSS, data files, simple modules).
- `@architect` → switch to pro/advanced model before writing code (complex wiring, state management, routing, API integration, animations).
- Switch back to `@build` immediately after each `@architect` task completes.

## Key Rules
- **Never hardcode colors, spacing, or font sizes** — all values from `styles.css :root`.
- **No inline `style=""` attributes** except JS-set transforms/opacity for animation.
- **No `var` keyword** — use `const`/`let` only.
- **No global namespace pollution** — use ES modules exclusively.
- **All `innerHTML` with untrusted data** must go through `escHtml()`.
- **All functions need JSDoc** — at minimum `/** description */`.
- **No `console.log`** in production code — use `console.error` for real errors.

## CSS Rules
- All new CSS classes must use the existing token variables.
- Test every CSS change at 375px, 768px, and 1024px viewport widths.
- Never use `!important` (only allowed in reset).
- Animations on dynamically added elements: add class after `requestAnimationFrame`.

## Testing After Every Task
Before marking ✅, manually verify:
1. No console errors.
2. No horizontal scroll at 375px.
3. Feature works on both mobile layout and desktop layout.
4. Tap targets ≥ 44px where interactive.

## Git Rules
- Commit after every successful deploy test or Phase completion.
- Commit message: `feat(phase-X): [summary of what was built]`
- Never commit with visible console errors.
- Never commit API keys (they live in `.env` only, never in code).

## Deploy Command
```
railway up
```
Verify at the provided Railway domain after each deploy.

## Resume Trigger
If user says "resume", "continue", or "next phase":
→ Read all docs → find first ⬜ task → begin immediately. No questions.

## Lessons Duty (end of session)
After updating `workflow_state.md`, list any new patterns discovered as:
"SUGGESTED LESSONS FOR OWNER REVIEW: L-XXX — [title]"
Format: Lesson body + "Apply to: [task IDs]"
Never add to `lessons_learned.md` yourself.

## Hard Lines
- Never modify `project_config.md`.
- Never add npm/node_modules to `public/` — no build step for frontend.
- Never use a CSS framework (Tailwind, Bootstrap, etc.).
- Never use a JS framework (React, Vue, etc.).
- The design system in `styles.css` is the single source of truth for all visual decisions.
