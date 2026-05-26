# PRODUCT.md — UPCJ Demo PWA

**Register:** product (app UI, not marketing)
**Deeper detail:** `docs/superpowers/specs/2026-05-13-upcj-demo-pwa-design.md`

---

## What this is

`@upcj/demo` is a static, seeded single-page web app that walks a visitor through a patient's health-insurance claim, event by event, with the claim state, SLA clocks, document checklist, and interaction log all driven live by `@upcj/engine`'s pure functions. It is an existence proof and a reference implementation. It is not a production claim tracker.

The design spec describes UPCJ today as a thing you can read but not click through. This app is the click-through.

---

## Users

There are two cohorts. The app serves both from the same codebase via route-based modes, without forking and without compromise.

**Cohort 1: Non-technical stakeholders.** Regulators and IRDAI staff, insurers, TPAs, patient-advocacy organisations, and people arriving from "Show HN" or a link in a tweet. They do not know what `replay()` does and do not need to. For them the app is an answer to a single question: could a well-designed health-insurance claim experience actually exist? Every design decision — the language, the warmth, the absence of jargon, the SLA callouts that name the responsible party, the grievance route surfaced as recourse rather than fine print — is the answer to that question.

**Cohort 2: Developers evaluating `@upcj/engine`.** Engineers at hospitals, TPAs, insurers, and health platforms who want to know whether the engine is worth adopting. For them the app is a clean reference implementation: how to wire up `validate` / `advance` / `replay` / `evaluateSLAs`, render the lifecycle, drive the SLA clock from regulatory deadlines, and handle the query and grievance branches. The `/dev` route makes every engine call visible.

---

## Tone and aesthetic lane

The aesthetic lane is **competent public infrastructure that actually works.** Think a well-run public service: confident without being flashy, warm without being patronising, precise without being cold. The reference is the feeling of a government process that has been designed by someone who cared, not the feeling of a startup or a hospital.

This is not a clinical app and not a consumer fintech app. The design should feel like it belongs to the UPCJ framework — regulated, careful, on the patient's side.

Light theme. High contrast. Large legible type. Warm-but-not-cold color. The palette is built from OKLCH tinted neutrals with one restrained accent at under 10% of surface area. No `#000`, no `#fff`.

---

## Anti-references

These aesthetics are specifically at risk of creeping in and should be treated as design anti-patterns:

- "Healthcare" SaaS dashboards — white + teal, card grids, hero-metric stat tiles.
- "Fintech" dashboards — navy + gold, bold-percentage callouts, gradient text.
- Sterile hospital portals — grey tables, dense form layouts, system-font stack with no typographic intent.
- Chat-app aesthetics — bubble tails, avatars, typing indicators, a thread framing that implies conversation rather than process.
- Hero-metric dashboards — the `settled` screen is a statement (what was claimed, what was approved, what was deducted and why, paid on), not a ₹ number in a big circle.

---

## Strategic principles

**Error prevention.** The patient screen for each state shows exactly one primary action when action is required. Where nothing is required, the screen says so clearly and does not invite a wrong move. Guards are in the engine; the UI mirrors that discipline.

**Plain language.** Every word earns its place. No "pre-authorisation repudiation." No em dashes. Hindi copy is not a translation afterthought — it is authored alongside the English, and both must be correct.

**Visibility of system status, with ownership and a remedy.** The SLA clock is always named. "TPA — until tomorrow ~2pm" is a complete statement; "48h remaining" alone is anxiety. When an SLA lapses, the breach is attributed to the responsible party and the available remedy is shown.

**The framework's data model is surfaced.** One claim object, never mutated. `replay(seedClaim, steps[0..cursor])` recomputes the state from scratch at every step. Interaction IDs (`INT-…`) are deterministic and visible in `/dev`. The event log is the source of truth. The demo makes these choices visible and citable, not just asserted in prose.

**i18n is a hard requirement.** English and Hindi are the seed languages. All UI and scenario copy is stored as i18n keys. ₹ amounts use Indian digit grouping (₹1,23,456). Dates use an Indian format. Layouts tolerate 1.5 to 2x string length without breaking. The language switcher is reachable from `/product`.

**WCAG-AA contrast on all text.** Touch targets at least 44 by 44 px. Visible keyboard focus rings. Screen-reader landmarks throughout. The design lens does not dim the underlying screen.

---

## Scene sentence

A frightened relative, fluorescent hospital lighting, 11pm, phone at 8% battery, needs to know what to do right now.

This is the user when they reach the app. Every design decision — font size, contrast, the number of things on screen, what the primary action says, whether the SLA is legible at a glance — is checked against this scene.

---

## Out of scope

This app deliberately does not:

- Take real money or initiate any financial transaction.
- Store or transmit personally identifiable information.
- Connect to live TPA, insurer, or ABDM systems.
- Accept real claim submissions.
- Serve as a production claim tracker for real patients.

The `/product` route is "imagine this were real." The app is a showcase and a reference implementation. The disclaimer is part of the product design, not a footnote.

---

## Success criteria

A stakeholder who has never seen UPCJ can follow scenario 1 (cashless planned happy path) end-to-end on a phone in under two minutes, without reading any documentation, and leave believing a well-designed claim experience is possible.

A developer can map every visible piece of the UI to a named engine function call. The `/dev` route makes this mapping explicit; the `/design` catalog makes it citable.

An Indian user reading in Hindi sees correct ₹ grouping, correct date formatting, and copy that reads as authored rather than translated.

The design lens, when toggled on, reveals the design principles behind what is on screen without dimming or obscuring the underlying product. It is an annotation layer, not a tutorial overlay.
