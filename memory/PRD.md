# Architect 2.0 — PRD & Build Log

## Original Problem Statement
Build "Architect 2.0": a vibe-coding platform where users describe an app or AI agent in plain language and get a working, deployable product. Serves both non-technical users and developers via "one workspace, two depths" (Simple / Pro). Design quality and UX flow matter more than backend depth. Delivered in 3 phases; each phase pauses for review.

## User Choices (locked)
- Auth: Emergent-managed Google Auth (real). Email/password + GitHub are polished dummy flows.
- AI: fully scripted/mocked (no real LLM).
- Rollout: Phase 1 only, then pause.
- Theme: dark workspace default, system-aware; light/dark toggle in user menu.

## Architecture
- Frontend: React 19 (CRA/craco), react-router 7, framer-motion, lucide-react, sonner, shadcn/ui. Design tokens via CSS variables (`--ac-*`) + Tailwind `ac.*` colors. Inter + JetBrains Mono.
- Backend: FastAPI, Motor (MongoDB). All routes under `/api`. Auth via Emergent OAuth session exchange; session_token stored in Mongo + httpOnly cookie (Bearer fallback).
- DB collections: `users` (user_id, email, name, picture, onboarding_completed, onboarding_prefs, mode, theme), `user_sessions`, `projects`.

## User Personas
- Non-technical founder/PM/designer → Simple mode (chat, preview, publish).
- Developer → Pro mode (files, terminal, logs, diffs, traces).

## Core Requirements (static)
1. Real Google sign-in, sessions, protected routes, logout. ✅ (Phase 1)
2. DB persistence: users, projects, onboarding prefs; projects persist across reload. ✅
3. Project CRUD: create, rename, duplicate, archive, delete. ✅
4. Simple/Pro mode + theme persist per user. ✅
5. Progressive-disclosure workspace, build timeline, preview, data tab, agents, git, deploy. → Phase 2/3.

## Implemented (2026-06 / Phase 1)
- Design system: tokens (dark+light), Button/Badge/StatusChip/Segmented/Kbd/EmptyState, custom scrollbars, grid/noise bg, skeletons, motion, reduced-motion support.
- Landing (/): hero, looping build demo, how-it-works, Simple/Pro compare toggle, framework logos, templates, pricing, FAQ, footer, theme toggle.
- Auth: /login, /signup (split layout, Google/GitHub, inline validation, password strength, magic link), /forgot-password (dummy sent screen), AuthCallback (session_id exchange), protected routing + return-to.
- Onboarding (3 steps, skippable, progress dots) → persists goals/work-style/mode.
- App shell: collapsible sidebar (240↔64, persisted), workspace switcher, notifications bell, user menu (theme + logout), Cmd/Ctrl+K command palette (search projects + actions).
- Home: greeting, hero prompt box (Type/Framework/Model selectors, attach, Plan-first toggle, send), suggestion chips, entry cards, recent-projects grid/list with search + status filter, empty state + Load sample data.
- Projects page (Active/Archived tabs, restore), Templates page (Use template creates project), Settings (mode/theme/profile/connected/shortcuts/danger zone), ComingSoon placeholders (Agents/Integrations/Usage), custom 404.
- Seed: POST /api/projects/load-sample → 4 sample projects (live/draft/building/failed), idempotent.

## Verification
- testing_agent iteration_1: backend 100% (18/18 pytest), frontend 100%. Cookie auth confirmed. Fixed minor dialog a11y descriptions.

## Implemented (2026-06 / Phase 2)
- Project Workspace (`/project/:id`, full-screen): top bar (back, inline rename, status chip, centered Simple/Pro toggle, Share/GitHub branch/Checkpoints/Deploy), resizable chat + canvas panes (react-resizable-panels, persisted sizes).
- Chat pane: persisted messages, editable Plan card (expand/toggle/add-item), streaming caret replies, Composer (attach, Build/Ask/Debug mode, model selector, slash commands, stop), suggested next-step chips, element-edit context chip.
- Signature Live Build Timeline: scripted vertical stepper (pending→running→done) with elapsed time + expandable subtasks; right Preview fills in section-by-section (skeleton→real crossfade) with a progress bar; "Files changed" chip; success toast; project flips to Live. Reconstructs on reload.
- Preview tab: route switcher, device toggle (desktop/tablet/mobile frame resize), Select element (crosshair → popover quick actions + chat chip), rendered MiniApp variants (SaaS dashboard/landing/support agent) with recharts.
- Simple/Pro instant panel-reveal toggle: reveals Code/Terminal/Logs/Git tabs + Pro status bar with animation, no reload.
- Pro tabs: Code (file tree + light-highlighted editor), Terminal (scripted commands + history), Logs (streaming + level filters + pause), Git (Simple friendly card / Pro branch+commits+diff).
- **Data tab — REAL persisted CRUD** on a per-project `customers` demo table (auto-seed 4 rows; add/edit-cell/delete persist to MongoDB; verified across reload).
- Checkpoints drawer (list + Restore with Undo toast). Scripted AI engine in `src/lib/aiEngine.js` (keyword-picked build scripts + trace scripts + mock files/logs).
- Agents Studio: `/agents` list (auto-seeded 2 demo agents, success sparkline), 4-step New-agent wizard (POST persists), Agent detail with **Playground** (streaming answer + live step-by-step Trace: LLM/retrieval/tool/handoff with tokens/latency/cost + totals bar + Replay/Save-as-test), Blueprint node canvas (view-as-code), and Tools/Evals/Versions/Deploy&API/Monitoring tabs.
- testing_agent iteration_2: backend 100% (38/38 pytest incl. Data CRUD), frontend 100% on workspace + build timeline + Simple/Pro toggle + agents playground + Data persistence.

## Phase 2 Status: COMPLETE

## Backlog (next phases)
### P0 — Phase 2 (workspace)
- Project workspace shell (top bar, resizable chat + tabbed canvas), Simple/Pro panel-reveal toggle.
- Chat (plan card, streaming caret, slash/@commands, suggested next steps), scripted Build Timeline, progressive skeleton preview, element-select edit, device toggle.
- Data tab with REAL CRUD on a demo table. Checkpoints drawer. Code/Terminal/Logs (Pro).
### P1 — Phase 3
- Agents section (list, wizard, blueprint canvas, playground+trace, tools, evals, versions, deploy&API, monitoring).
- GitHub flow (connect, branch/diff/PR), Import 3-step flow, Deploy drawer + deployments + domains + secrets.
- Integrations hub, Share/comments, Usage & billing, notifications center.
### P2
- Command palette actions for deploy/import; keyboard-shortcut cheatsheet modal (?); offline banner; 500 page.

## Next Tasks
- Await user review of Phase 1, then start Phase 2 (workspace).
