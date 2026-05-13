# UPCJ Demo PWA — Design Spec

**Status:** Draft for approval
**Date:** 2026-05-13
**Target:** UPCJ roadmap item "sample app demonstrating the framework." Sub-project #1 of two; sub-project #2 (a Remotion explainer video) gets its own spec later and is expected to reuse this app's screens and flows.
**License:** CC BY-SA 4.0 (inherited)

## 1. Purpose

UPCJ today ships a printable patient starter kit, a machine-readable spec, and a reference engine (`@upcj/engine`). What it does not ship is a thing you can *click through*. This spec defines `@upcj/demo` — a static, seeded single-page web app that walks a visitor through a patient's health-insurance claim, event by event, with the claim state, SLA clocks, document checklist, and interaction log all driven live by the engine's pure functions.

It serves two audiences without forking, via route-based modes (§4):
- **Non-technical stakeholders** — regulators / IRDAI, insurers, TPAs, patient-advocacy orgs, and people arriving from a "Show HN" or a tweet. For them the app is an existence proof: *this is what a well-designed health-insurance claim experience could look like.*
- **Developers** — engineers at hospitals, TPAs, insurers, and platforms evaluating whether to build on `@upcj/engine`. For them the app is a clean reference implementation: how to wire up `validate` / `advance` / `replay` / `evaluateSLAs`, render the lifecycle, and drive the SLA clock from real regulatory deadlines.

A third, narrower job: the app is a structured artifact for the explainer video (sub-project #2) to be filmed against, and a place where the framework's design philosophy (error prevention, plain language, the Nielsen heuristics, the system-design and data-modeling choices) is made *visible and citable* rather than just asserted in prose.

## 2. Scope

**In v1:**
- A React + Vite + TypeScript SPA at `pwa/` in the repo, deployed to GitHub Pages at `s1dd4rth.github.io/upcj/pwa/`.
- An installable PWA (manifest + service worker via the Vite PWA plugin); fully usable offline (all content is static).
- Four routes: `/product` (also `/`), `/demo`, `/dev`, `/design` (§4).
- A guided step-through interaction model over **5 seeded scenarios** (§6).
- Live, engine-driven views: current lifecycle state, SLA clocks (each labeled with the owning party), document checklist (status + responsible party), interaction log (rendered as an attributed activity feed).
- A "Design lens" overlay (in `/demo`) and a `/design` catalog page that documents every design principle with bidirectional deep links into the live app.
- i18n from day one: all UI/scenario copy as i18n keys; **English + Hindi** for the seed scenarios; a language switcher in `/product`.
- A new CI workflow `.github/workflows/pwa.yml` (path-filtered to `pwa/**`): install → test → build → deploy. A `pwa-v*` release tag namespace.
- Links to the demo from `index.html` and `README.md`.

**Out of scope for v1 (explicit non-goals):**
- No backend, no auth, no real document uploads, no persistence beyond the URL / `localStorage`, no real TPA/insurer/ABDM integration. The app *models* those parties; it does not connect to them.
- Not a patient-usable production claim tracker. That would be a different, much larger product; this is a showcase + reference.
- No new engine features. If a scenario needs a capability the engine lacks, the scenario is out of scope, not the engine.
- The Remotion video is sub-project #2, separately specced.
- Real-time multi-user, server-side rendering, native apps — none of it.

## 3. Architecture

```
pwa/
├── src/
│   ├── engine-adapter.ts      # the ONLY module that imports @upcj/engine. Wraps
│   │                          # validate/advance/replay/evaluateSLAs/getSpecHash into a
│   │                          # small app-facing API. The single swap point if the engine changes.
│   ├── scenarios/
│   │   ├── types.ts           #   Scenario = { id, title, summary, teaches, seedClaim, steps: Event[], thumbnail? }
│   │   ├── cashless-planned-happy.ts
│   │   ├── cashless-emergency-query.ts
│   │   ├── reimbursement-deduction-grievance.ts
│   │   ├── cashless-rejected-sla-breach.ts
│   │   └── claim-withdrawn.ts
│   ├── state/
│   │   ├── playback.ts        # the reducer. State = { scenarioId, cursor, mode: 'manual'|'auto', speed }.
│   │   │                      # Next/Back/jump move the cursor. The CLAIM is always recomputed by
│   │   │                      # replay(seedClaim, steps.slice(0, cursor)) — never mutated in place.
│   │   │                      # Automated mode = a timer that advances the cursor. That is the entire
│   │   │                      # app state model; the engine does the real work.
│   │   └── selectors.ts       # pure derivations from (claim, scenario, cursor):
│   │                          #   currentStateView, slaClocks (with owner + remedy), docChecklist,
│   │                          #   activityFeed, engineTrace (the diff between cursor-1 and cursor).
│   ├── i18n/                  # i18n setup + en/ and hi/ string catalogs (incl. state-content copy).
│   ├── components/
│   │   ├── shell/             # AppShell, Header, MobileTabs, CockpitRails, PresenterControls.
│   │   ├── patient/           # StateScreen + state-content map (§5a) + bespoke terminal screens.
│   │   ├── system/            # SlaClock, DocChecklist, EngineTrace, ActivityFeed, JourneyBar/JourneyRail.
│   │   ├── lens/              # DesignLensProvider, AnnotationBadge, AnnotationList (mobile) / MarginCallout (desktop).
│   │   └── dev/               # EventInspector, ClaimJson, ReplayControls, SpecHashBadge.
│   ├── design/                # the /design catalog page.
│   ├── theme/                 # tokens (OKLCH palette incl. the owner-color system), type scale, spacing.
│   └── routes.tsx             # /product, /demo, /dev, /design — hash router (GitHub Pages, no server config).
├── public/                    # manifest, icons.
├── index.html
├── vite.config.ts             # base: '/upcj/pwa/', PWA plugin.
└── package.json               # own project; @upcj/engine as a dependency (npm + file: override for local dev).
```

**The core loop, in one sentence:** state is `{ scenarioId, cursor, mode, speed }`; everything visible is a pure function of `replay(seedClaim, steps[0..cursor])` plus the engine's evaluators. Next/Back moves the cursor; automated mode is a timer that moves it. This is deliberately tiny — the point of the reference app is that the *engine* is doing the work, not the UI.

**Disciplines (these are what keep it a usable reference, not just a demo):**
- `engine-adapter.ts` is the only file that imports `@upcj/engine`. Everything else talks to the adapter.
- Scenarios are *data* (`Event[]` + a seed claim), not code paths.
- `selectors.ts` is pure; components are presentational and import no engine.
- The canonical component list is the **mobile** one. "Cockpit" (§4a) is a desktop *layout mode* that re-arranges those same components with more width — not a separate set. A component that only exists on desktop is a red flag.

**Why React/Vite, not vanilla:** the app is an interactive state-machine UI — scenario playback, derived SLA countdowns, mode switching, the annotation overlay, the engine-trace diff. Vanilla would mean hand-rolling all of that and the reference value would drop, not rise. The rest of the repo stays minimal-tooling; the PWA is the one place a framework earns its keep, and it's sandboxed to `pwa/`. (Remotion being React is a minor bonus, not the reason.)

## 4. The four routes (mode separation)

| Route | Audience | What's visible | Demo chrome |
|---|---|---|---|
| `/product` (and `/`) | "imagine this were real" — the artifact you link from a tweet | The claim experience only: patient screen, status, SLA, docs, activity feed. A scenario is pre-loaded; Next/Back works but it reads as a product. Carries the **highest design fidelity** — the considered palette, real type system, warmth. Has a **language switcher**. | **None.** No scenario picker, no design lens, no engine view, no JSON. Demo controls do not exist here. |
| `/demo` | stakeholders, talks, the explainer video | Everything in `/product` **plus** the scenario picker, the manual/automated toggle (+ speed), and the **Design lens** toggle (§5). **Defaults to automated playback** (it plays like a video, prominent pause); manual stepping is secondary. | Present but understated — folded **into the header** (the scenario name is the tappable title; manual/auto + lens are two icon buttons on the right). One sticky band, not a separate presenter bar stacked under the header. |
| `/dev` | engineers evaluating `@upcj/engine` | The full layout **plus** the **Engine view**: the event being applied, `validate` result, the state transition, `evaluateSLAs` output (the precise ticking SLA readouts live here), the new interaction with its deterministic `INT-…` id, the spec hash (`getSpecHash()`), the engine version, and a `replay`-the-whole-claim control. Plus a link to the source layout. | This *is* the chrome — no pretense of being a product. |
| `/design` | anyone asking "why is it like this?" | A catalog page: every principle — (1) error prevention, (2) clarity & plain language, (3) the 10 Nielsen heuristics (each with how this app honors it), (4) system-design choices (route-based modes, the pure-function engine, replay-as-source-of-truth, the adapter boundary), (5) data-modeling decisions (events not guards, SLAs anchored to events, deterministic interaction IDs, calendar arithmetic = literal regulation). Each entry: one-line rationale + a **deep link** into the live app at the step where it's visible (e.g. `/demo?scenario=reimbursement-deduction-grievance&step=7&lens=on`). | n/a — it's a docs page. |

Splitting by route instead of a toggle is itself a design decision (and a `/design` entry): `/product` genuinely has zero chrome, and each audience gets a URL that is exactly right for them.

### 4a. Layout

**Mobile (375px is the design target; desktop is the widening of it).**

- **Sticky header (always, one band):** status pill (e.g. `Pre-auth pending`) + the single most-urgent SLA as a *bounded, low-precision* status with its owner (e.g. `TPA — until tomorrow ~2pm`). In `/demo` the header also carries the scenario title (tappable to switch) and the manual/auto + lens icon buttons. In `/product` it's just status + SLA + language switcher.
- **Main area:** the patient screen for the current step (§5a).
- **Bottom tabs:** `Status` (the patient screen, default) · `Activity` · `Docs`. Three tabs.
- **"What just changed" disclosure:** an inline expandable strip at the bottom of the Status content showing the delta this step caused — event applied → state transition → SLA changes → doc changes → new interaction. It scrolls with the content (it is NOT a floating bottom sheet — that would collide with the tab bar). In `/product` it's hidden; in `/demo` it's a discreet `▾ what just changed?`; in `/dev` it's promoted to its own mobile tab / right-rail panel (the Engine view).
- **"Nothing hidden"** is honored via progressive disclosure *inside* the Status screen (status → what-to-do → relevant docs/SLA inline, expandable) — not buried behind menus.
- **Journey indicator:** a compact horizontal stage bar ("stage 3 of 8 phases", current highlighted, terminal styled distinctly) at the top of the Status screen; the full ~15-state list is one tap away. NOT a 15-item vertical rail on mobile.

**`Activity` tab:** an **attributed event feed** — a vertical line, each entry = actor label (small caps, color-coded by the owner-color system) + timestamp + the event in plain language + on waits a quiet `⏳ 2h 14m — TPA's clock` marker. Structurally a thread; visually a `git log` / activity feed — **no chat-bubble tails, no avatars, no "typing…", no messaging-app aesthetic.** It inherits the app's type/color/spacing. This is the only place a thread-like rendering is used.

**`Docs` tab:** the document checklist — each `DOC-###` with status (required / provided / verified / rejected), the responsible party (in its owner color), and which step it became relevant. Tapping one explains it in plain language. Grouped by claim phase, not a flat list of identical rows.

**Desktop ("cockpit" layout mode):** the *same components*, un-collapsed — left = the `JourneyRail` (the ~15-state vertical stepper, current highlighted, terminal states styled distinctly); center = the patient screen; right = a stack of {Engine trace / Engine view} + SLA clocks + Docs + Activity feed; the header (with `/demo` controls folded in) runs along the top. Nothing appears on desktop that isn't on mobile.

## 5. The Design lens + the `/design` catalog

**The lens** (only in `/demo`): a toggle that surfaces **sparse, step-specific** annotations citing design principles. Each annotation is one short line + a principle tag, e.g.:
- `Plain word, not "pre-authorisation repudiation." Nielsen #2: match the system to the real world.`
- `This screen says "nothing for you to do" — error prevention: don't invite a wrong action where none exists.`
- `The SLA names who owes the response, and what you can do if it lapses. Visibility of system status; a countdown without an owner or a remedy is just anxiety.`
- `One claim object, recomputed by replay() — never mutated. Data modeling: the event log is the source of truth.`

Annotations are *data* (`lens/annotations.ts`), keyed by `(state | element-id | step)`. **Presentation is viewport-dependent:**
- **Mobile:** annotated elements get a small non-overlapping numbered badge (①②③, ~20px, in a corner); the annotation text renders in a stacked list / bottom sheet ("On this screen: ① …; ② …"). Tapping a badge highlights its annotation and vice versa. No pinned floating callouts, no positioning math.
- **Desktop:** margin callouts in the cockpit gutter, connected to their elements with a thin leader line.

**No dimming, ever** — dim-as-focus is a "demo mode bolted on" tell. De-emphasis, where needed, is a subtle desaturation or a hairline highlight ring on the annotated elements.

Hard rule: **2–4 annotations per screen, max.** More and the app stops looking like a product and starts looking like a UX-portfolio case study.

**The `/design` catalog page** is the inverse view: all principles in one place, grouped as in the §4 table, each with a one-line rationale and a deep link into the live app at the exact step where it's visible. The connection runs both ways: in the app you ask "why is it like this?"; on the catalog page you say "show me where."

## 5a. How the patient screen renders per state — `<StateScreen>` + archetypes

The patient screen is the heart of the product. It's rendered by a `<StateScreen>` component driven by a per-state content map (`patient/state-content.ts`), keyed by the ~15 lifecycle states. **Each entry includes an `archetype` field that selects the layout** — a generic component fed only copy would produce 15 identically-shaped screens, which is the opposite of a showcase.

Each content-map entry: `{ archetype, headlineKey, explanationKey, action: 'none' | { ... } , surfaceSLAs: [...], surfaceDocs: [...], tone }` — all `*Key` values are i18n keys.

**Four archetype layouts:**
- **Waiting** — `pre-auth-pending`, `in-adjudication`, `in-query`. Calm. Dominant element: *who we're waiting on + their clock + the remedy if it lapses.* The patient screen is mostly reassurance + a faint sense of progress.
- **Active** — `awaiting-patient-action`. Urgent. Dominant element: *the action the patient must take* (one large primary affordance); everything else recedes. This is the one screen the patient must operate.
- **In-progress / neutral** — `pre-admission`, `intimated`, `admission-advised`, `in-treatment-cashless`, `in-treatment-reimbursement`, `discharged`. Informational: "here's where you are, nothing required."
- **Terminal** — each of these gets a *genuinely bespoke* sub-component, not a shared archetype:
  - `settled` — positive, resolved. A **settlement statement** (what was claimed / what was approved / what was deducted and why / paid on). NOT a hero-metric "big ₹ number" dashboard.
  - `partially-settled` — mixed. What was paid, what wasn't, *why*, and the path forward (the grievance route).
  - `rejected` — heavy. The reason stated clearly; the grievance route prominent; careful tone.
  - `withdrawn` / `closed-without-settlement` — quiet, factual closure.

So: **4 archetype layouts + ~4 bespoke terminal screens.** Mostly data-driven (the archetype picks the layout), but it will not feel bland.

## 6. The 5 seeded scenarios

Each is a data file: `{ id, title, summary, teaches, seedClaim, steps: Event[], thumbnail? }`. `steps` are real engine events; the demo `replay()`s prefixes of them. The seed data is **rich and plausible** — real-ish hospital names, real ICD-10 codes, amounts in ₹ with Indian digit grouping (lakh/crore), dates in an Indian format — not "Hospital A / ₹10,000". (These map closely onto existing conformance fixtures in `spec/conformance/`, so authoring is largely curating fixture sequences.)

1. **`cashless-planned-happy`** — *Cashless · planned admission · clean path → settled.* Intimate hospitalisation → admission advised → pre-auth filed → pre-auth approved (planned-admission SLA: 12h, comfortably met) → in-treatment → discharge bill finalised → settled cashless. The "this is how it's supposed to feel" baseline. *Teaches:* the happy path; what good looks like.
2. **`cashless-emergency-query`** — *Cashless · emergency admission · pre-auth query loop → fully settled.* Emergency admission (4h pre-auth SLA) → pre-auth filed → TPA raises a query for a missing document → hospital responds → query resolved → pre-auth approved → settled. *Teaches:* the Query lifecycle; the tighter emergency clock.
3. **`reimbursement-deduction-grievance`** — *Reimbursement · post-discharge filing · deduction → partially settled · grievance → resolved.* Patient pays, discharges, files reimbursement with documents → in-adjudication → a deduction (a line item disallowed) → **partially settled** → patient files a **grievance** → acknowledged → resolved (partial reversal). The emotionally heavy path; the `partially-settled` and grievance bespoke screens get exercised. *Teaches:* deductions, partial settlement, the grievance route as recourse.
4. **`cashless-rejected-sla-breach`** — *Cashless · pre-auth rejected, insurer breaches the response SLA → grievance → escalated.* Pre-auth filed → the response SLA clock lapses with no response (the breach is visible, attributed to the insurer, paired with the remedy) → eventually rejected → grievance filed → acknowledged → **escalated** (next grievance level). *Teaches:* SLA breach as a real event with consequences; the `rejected` screen; escalation. This is the path the framework most exists for.
5. **`claim-withdrawn`** — *Claim withdrawn — patient never admitted.* Intimated → admission advised → patient is not admitted → claim withdrawn. The short, undramatic terminal path. *Teaches:* not every claim is a saga; the lifecycle's quiet branches.

## 7. Error handling & edge cases

It's a static, seeded app, so most "error handling" is integrity + graceful degradation:
- **Scenario integrity at build time:** a test `replay()`s each of the 5 scenarios fully and asserts no engine errors + the expected terminal state. A malformed scenario fails CI, never the user's browser.
- **Runtime fallback:** if `replay()` ever returns an error anyway, the app renders a clear "this scenario hit an unexpected engine error" state (not a white screen); in `/dev` it shows the actual error object. Error-handling-as-demo: the framework should make failures legible, so the app does too.
- **Bad URL params:** unknown `scenario=` → fall back to the default scenario + a toast; out-of-range `step=` → clamp to `[0, steps.length]`. Deep links are first-class (the `/design` catalog relies on them) and degrade gracefully.
- **Offline:** the service worker caches the app shell + all scenario data. A stale cache after an engine bump is visible because `/dev` surfaces `getSpecHash()` + the engine version.
- **i18n / text expansion:** layouts tolerate 1.5–2× string length (Hindi/regional expansion); no fixed-width text containers; the language switcher is reachable in `/product`.
- **Accessibility & motion:** respects `prefers-reduced-motion` (automated-mode transitions, lens highlight); fully keyboard-navigable; lens annotations are real text, not images (screen-reader-readable — and a `/design` talking point); **WCAG-AA contrast is a design constraint, not an afterthought.**

## 8. Design constraints (non-negotiables for the build)

- **Light theme.** Scene sentence: *a frightened relative, fluorescent hospital lighting, 11pm, phone at 8% battery, needs to know what to do right now.* That forces high contrast, large legible type, light theme (dark-mode-by-default would be an affectation under hospital lights), and warm-but-not-cold color. Aesthetic lane: **"competent public infrastructure that actually works"** — closer to a well-run public service than to a slick startup or a sterile hospital. Not "healthcare → white + teal"; not "fintech → navy + gold".
- **The owner-color system** (patient / hospital / TPA / insurer / regulator each a distinct hue) is a deliberate cross-component motif — it colors the SLA chips, the Activity-feed attributions, and the Docs "responsible party." Designed once, in `theme/`.
- **OKLCH colors; no `#000`/`#fff`; tinted neutrals.** Body line length 65–75ch. Hierarchy via scale + weight contrast (≥1.25 between steps). Vary spacing for rhythm.
- **Anti-pattern bans** (this design is specifically at risk of each): no identical card grids (vary the Docs checklist and the lifecycle rail — group by phase / archetype, leading icons + weight contrast); no hero-metric template (the `settled` screen is a *statement*, not a dashboard stat); no side-stripe borders (the breach callout uses a full treatment — background tint + icon + owner color — not a colored `border-left`); no modal-first (the scenario picker is a real screen / slide-over with each scenario as proper content, not a dropdown or modal list); no gradient text; no decorative glassmorphism.
- **Copy:** plain language, every word earns its place, no em dashes. (The plain-language discipline is itself the subject of `/design` entries.)
- **Localization specifics:** ₹ with Indian digit grouping (₹1,23,456; lakh/crore); dates in an Indian format.
- **`/demo` does not require operating it to see it** — defaults to automated playback with a prominent pause; manual stepping is secondary; the lens is the one extra knob worth surfacing.

## 9. Testing

- **`engine-adapter`** — thin unit tests; pass-through correctness.
- **`selectors`** — unit tests for the view-model derivations (SLA-clocks-with-owner-and-remedy, the engine-trace diff, the doc checklist, the activity feed) against known claim objects.
- **Scenario conformance** — for each of the 5: `replay(seedClaim, steps)` runs clean, ends in the expected terminal state, produces the expected interaction count. (Same shape as the engine's own conformance suite — the demo's scenarios are a small conformance corpus.)
- **`playback` reducer** — Next/Back/jump cursor math; automated-mode tick.
- **Components** (Vitest + Testing Library) — `<StateScreen>` renders the right archetype/content per state from the map; the lens overlay shows/hides and renders badges+list on mobile / margin callouts on desktop; the three app routes render their expected chrome — and `/product` rendering **zero** demo chrome is an explicit assertion.
- **i18n** — a test asserting no missing keys in the `hi` catalog vs `en`, and that the seed-scenario copy resolves in both.
- **Playwright smoke** (may land in a follow-up): load `/demo`, step one scenario end-to-end, assert no console errors. Doubles as the deploy-liveness check and the surface the Remotion video gets filmed against.
- **Lighthouse / PWA check in CI** — installability + an a11y score gate.

## 10. Build & deploy

- `pwa/` is its own Vite + React + TS project; `@upcj/engine` is a dependency (npm package + a `file:` override for local dev). The repo's minimal-tooling ethos stays intact elsewhere — the framework is sandboxed to `pwa/`.
- `vite build` with `base: '/upcj/pwa/'`; hash router so deep links work on GitHub Pages with no server config.
- **New workflow `.github/workflows/pwa.yml`**, path-filtered to `pwa/**`: install → test (the §9 suite) → build → deploy `pwa/dist/` to `s1dd4rth.github.io/upcj/pwa/`. Independent of `starter-kit.yml` / `core.yml`. (The exact Pages-publish mechanism — a `pwa/` subdir in the Pages branch vs. a dedicated action — is settled against the current Pages config at implementation time.)
- Link from `index.html` and `README.md`: "Try the interactive demo →", alongside the starter kit and the engine.
- Release tag namespace: `pwa-v*` (matching `starter-kit-v*` / `core-v*`).

## 11. Follow-ups (not part of v1)

- Run `/impeccable teach` to write a real `pwa/PRODUCT.md` (users, tone, the "public infrastructure that works" lane, the i18n requirement, anti-references) and stand up a `DESIGN.md` once the token system exists — the owner-color system, type scale, and archetype layouts want a design-system home. This is its own task, done at the start of implementation.
- The Remotion explainer video (sub-project #2) — separate spec; reuses this app's screens and flows.
- Regional languages beyond Hindi for the seed scenarios, if a stakeholder asks.
- A Playwright smoke if it doesn't make the v1 cut.
