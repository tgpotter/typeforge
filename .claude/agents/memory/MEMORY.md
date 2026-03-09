# TypeForge — Software Architect Memory

## Project
Science-backed speed typing trainer. React + Vite frontend, PocketBase backend (self-hosted, MIT licensed). Early development stage.

## Stack
- **Frontend**: React 19, Vite 7, react-router-dom — no CSS framework, all inline styles
- **Backend**: PocketBase v0.36.6 (single binary, `pocketbase/pocketbase serve`)
- **Package manager**: npm (via fnm)
- **Fonts**: Syne (headings) + DM Mono (mono/labels) via Google Fonts

## Architecture Decisions Made
- **No CSS framework** — all styling via inline style objects; consistent with the design system
- **PocketBase over Supabase/Firebase** — chosen for zero vendor lock-in, MIT license, self-hostable, no payment scaling issues
- **Separate `profiles` collection** instead of extending PocketBase's built-in `users` auth collection — avoids migration complexity with system collections
- **Refs for typing state** in TypingEngine — `startTimeRef`, `typedRef`, `keystrokesRef` etc. bypass React's async state for synchronous keystroke handling; only `typed` (string) goes into state to drive re-renders
- **Segment-based text rendering** in TypingEngine — groups consecutive same-state characters into 3–4 spans instead of N individual spans; `useMemo` on segments; `useCallback` on handler

## Schema (pocketbase/pb_migrations/1741478400_init.js)
- `users` — PocketBase built-in auth (untouched)
- `profiles` — display_name, current_module, streak, last_practice_date, total_practice_min
- `sessions` — user, module_id, wpm, accuracy, duration_sec, error_keys (json)
- `module_progress` — user, module_id, lessons_completed, best_wpm, best_accuracy, last_practiced

## Design System
- BG: `#0A0A0A`, accent: `#E8FF47` (yellow-green)
- Per-module accent colors (foundation=#E8FF47, fingers=#47C8FF, accuracy=#FF6B47, frequency=#B347FF, speed=#47FFB3, weakness=#FFB347, stamina=#FF47A3, ergonomics=#47FFF0)
- Glass UI: `rgba(255,255,255,0.03–0.07)` backgrounds, `rgba(255,255,255,0.08)` borders
- Text hierarchy: `#fff` > `rgba(255,255,255,0.5)` > `0.4` > `0.3`

## 8-Module Training System
01 Home Row Foundation → 02 10-Finger Mastery → 03 Accuracy Clinic → 04 High-Frequency Words → 05 Speed Laddering → 06 Weakness Forge (AI-targeted) → 07 Stamina & Flow → 08 Posture & Ergonomics

## Key Files
- `src/components/TypingEngine.jsx` — core typing component, used by all modules
- `src/pages/ModulePage.jsx` — lesson runner, saves sessions to PocketBase
- `src/data/lessons.js` — all lesson content keyed by module id
- `src/lib/pb.js` — PocketBase client singleton
- `src/TypeForgeHome.jsx` — home page with module cards
