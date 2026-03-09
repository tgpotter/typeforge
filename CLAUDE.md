# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Dev Commands

```bash
# Start frontend (from project root)
npm run dev               # http://localhost:5173

# Start PocketBase backend (separate terminal)
./pocketbase/pocketbase serve   # http://localhost:8090
# Admin UI: http://localhost:8090/_/
```

First run of PocketBase will prompt you to create an admin account at `http://localhost:8090/_/`.

## Project Status

TypeForge is in early development — currently a UI prototype (`typeforge-home.jsx`) with no framework scaffold yet. No `package.json`, build system, or test suite exists. The next step is to scaffold a proper React project around the existing JSX.

## What TypeForge Is

A science-backed speed typing trainer built around 8 progressive training modules. The research foundation (in `initialContext.txt/intitialContext.txt`) informs the entire program structure:

- Accuracy must reach 95% before speed is pursued
- Touch typing with home row anchoring is the core skill
- Deliberate practice targeting weak keys/bigrams accelerates growth
- +5 WPM increments with stabilization before climbing further
- 15–30 min/day sessions with progress tracking

## The 8-Module Architecture

Each module is a self-contained training track with structured lesson phases:

| # | Module | Core Skill |
|---|--------|-----------|
| 01 | Home Row Foundation | ASDF JKL; anchor, muscle memory |
| 02 | 10-Finger Mastery | Finger-key ownership, eliminate hunt-and-peck |
| 03 | Accuracy Clinic | 95% accuracy staircase method |
| 04 | High-Frequency Words | Top 1,000 words (85% of real writing) |
| 05 | Speed Laddering | +5 WPM per rung, stabilize before climbing |
| 06 | Weakness Forge | AI-targeted bigram/missed-key custom drills |
| 07 | Stamina & Flow | Long-form sessions (5→15→30 min) |
| 08 | Posture & Ergonomics | Posture, wrist angle, break cadence |

The module data model (defined in `typeforge-home.jsx`):
```js
{ id, number, title, subtitle, description, icon, color, lessons, duration, difficulty, locked, progress, keyFocus[] }
```

Each module has an inline training plan (week/phase → focus → goal) stored in `SelectedModulePanel`'s `phases` object — this will need to move to a data layer as modules become interactive.

## Design System

**Color palette:**
- Background: `#0A0A0A`
- Primary accent: `#E8FF47` (yellow-green — used for CTAs, highlights, brand)
- Per-module accent colors: each module has its own color (e.g., `#47C8FF`, `#FF6B47`, `#B347FF`, `#47FFB3`, `#FFB347`, `#FF47A3`, `#47FFF0`)
- Text hierarchy: `#fff` → `rgba(255,255,255,0.5)` → `rgba(255,255,255,0.4)` → `rgba(255,255,255,0.3)`

**Typography:**
- Headings/CTAs: `Syne` (weights 700–900, Google Fonts) — tight tracking (`-0.02em` to `-0.03em`)
- Labels/data/mono: `DM Mono` (weights 300–500) — wide tracking (`0.1em`–`0.12em`), uppercase for labels

**UI patterns:**
- Glassmorphism-lite: `rgba(255,255,255,0.03–0.07)` backgrounds with `rgba(255,255,255,0.08)` borders
- Hover state: `translateY(-3px)`, border adopts module color at 60% opacity, colored box-shadow
- Module color is applied at full, 18% (background fill), 30–40% (border), and 60% (hover border) opacity
- Noise texture overlay + subtle 40px grid as fixed background layers
- Top glow: radial gradient in `#E8FF47` from top-center

**Nav behavior:** Transparent until scroll > 20px, then `rgba(10,10,10,0.9)` + `blur(20px)` + bottom border.

## Backend (PocketBase)

Binary lives at `pocketbase/pocketbase`, data at `pocketbase/pb_data/` (both gitignored). The JS client singleton is at `src/lib/pb.js` — import it anywhere with `import pb from '../lib/pb'`.

Schema (defined in `pocketbase/pb_migrations/1741478400_init.js`):
- `users` — built-in PocketBase auth collection (untouched)
- `profiles` — app-specific user data (display_name, current_module, streak, last_practice_date, total_practice_min); one per user, cascades on user delete
- `sessions` — one record per completed typing session (user, module_id, wpm, accuracy, duration_sec, error_keys)
- `module_progress` — one record per user per module (lessons_completed, best_wpm, best_accuracy, last_practiced); cascades on user delete

Migrations (when created) go in `pocketbase/pb_migrations/` and are committed to git.

**Migration gotcha**: `new Collection({fields: [...]})` accepts plain JS objects (JSON unmarshaling). But `existingCollection.fields.add()` requires typed field constructors — use `new NumberField({...})`, `new TextField({...})`, `new RelationField({...})` etc. Plain objects passed to `fields.add()` will throw `could not convert [object Object] to core.Field`.

## Planned Features (not yet built)

From the initial context and home UI nav items:
- **Program** — the 8-module training system (home page exists)
- **Progress** — WPM/accuracy charts, streak calendar, historical data
- **Leaderboard** — gamification, competitive element to push through plateaus
- **Settings** — user preferences
- **Quick Test** — standalone WPM/accuracy speed test
- **Weakness Forge engine** — session data analysis to identify slow bigrams and missed keys, generate custom drill content
