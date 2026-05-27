# @upcj/demo — interactive PWA

A static React + Vite single-page app that walks a visitor through a patient's health-insurance claim, event by event, with everything visible driven live by `@upcj/engine`'s pure functions.

**Live:** [s1dd4rth.github.io/upcj/pwa/](https://s1dd4rth.github.io/upcj/pwa/)

**Design spec:** [`docs/superpowers/specs/2026-05-13-upcj-demo-pwa-design.md`](../docs/superpowers/specs/2026-05-13-upcj-demo-pwa-design.md) at the repo root.

## What it shows

Five seeded scenarios cover the lifecycle the engine models:

1. **Cashless · planned · happy path** — clean baseline, every party meets every SLA, claim settles in full.
2. **Cashless · emergency · TPA query → resolved** — the in-query/waiting state and how the claim re-enters the main flow.
3. **Reimbursement · deduction · grievance** — partial settlement with itemised deductions; patient files a grievance, level 1 acknowledges and resolves.
4. **Cashless · pre-auth rejected · SLA breach + grievance escalation** — TPA misses the response deadline and rejects; patient escalates through the grievance ladder.
5. **Claim withdrawn before admission** — withdrawal is a first-class lifecycle state.

The journey covers all 15 lifecycle states across the 5 scenarios.

## Routes (the same components, three audiences)

- **`/product`** — zero chrome. No scenario picker, no lens toggle, no engine view. "Imagine this were real."
- **`/demo`** — auto-plays scenarios with a picker, presenter controls (manual/auto, 0.5×/1×/2×), and the inline "Design lens" toggle. The default landing for demos.
- **`/dev`** — engine internals: validate / replay / SLA evaluation with precise countdowns, spec hash, "verify replay determinism" check.
- **`/design`** — catalog of the design principles the demo embodies, with deep links to where each principle is visible in the demo.

## Localisation

English (`en`) and हिन्दी (`hi`) are first-class. Indian numerals (₹1,23,456) and Indian-format dates throughout. The `LanguageSwitcher` in the header is available in all modes; the choice is persisted to `localStorage`.

## Architecture

- **`@upcj/engine`** is consumed via `src/engine-adapter.ts` — the only file that imports the engine. Everything else uses the adapter.
- **Scenarios** are pure data — a seed `Claim` and an `Event[]`. The `playbackReducer` tracks `{ scenarioId, cursor, mode, speed }`; selectors derive view-models by calling `adapter.replay(seedClaim, steps.slice(0, cursor))` and the engine's evaluators.
- **Layout** is mobile-first. At ≥900px the shell reflows into a 3-column "cockpit" (journey rail · state screen · activity/docs/engine-view) — the same components, re-arranged. No separate desktop component tree.
- **Theme** uses OKLCH custom properties; no `#000`, no `#fff`. Owner-color system: five hues for the five parties (patient/hospital/tpa/insurer/regulator) used semantically, not decoratively.
- **Design lens** is data-driven (`src/components/lens/annotations.ts`). Capped at 4 annotations per screen. Mobile renders badges + a stacked list; desktop renders margin callouts in the gutter. Never dims surrounding content.

## Quick start

```bash
# from the repo root, build the engine first (file: dep)
cd engine && npm ci && npm run build && cd ..

# install + run the pwa
cd pwa && npm ci && npm run dev
```

Then open the printed URL (with `#/demo` appended) to enter the demo.

## Scripts

- `npm run dev` — Vite dev server
- `npm test` — Vitest (the conformance loop iterates every scenario)
- `npm run build` — TS build + Vite build to `pwa/dist/` with base `/upcj/pwa/`
- `npm run preview` — serve the built `dist/` locally

## Deploy

Two CI workflows touch the PWA:

- **`.github/workflows/pwa.yml`** — the PR gate. On PRs touching `pwa/**`, `engine/**`, `spec/**`, or `framework/**`, runs the engine build + the PWA test suite + the Vite build.
- **`.github/workflows/pages.yml`** — the unified GitHub Pages deploy. On every push to `main`, bundles the landing page + `assets/` + the built `pwa/dist/` into one Pages artifact (concurrency group `pages`) and deploys to `s1dd4rth.github.io/upcj/pwa/`.

Pages source is configured to "GitHub Actions" at the repo level. The `pages` workflow rebuilds on any push to main; a change anywhere in the site (root HTML, assets, or PWA) refreshes the whole deploy.
