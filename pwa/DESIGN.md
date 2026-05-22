# DESIGN.md — UPCJ Demo PWA

**Register:** design brief (tokens, type, spacing, components — the system, not a spec for individual screens)
**Deeper detail:** `docs/superpowers/specs/2026-05-13-upcj-demo-pwa-design.md` §8
**Token source:** `src/theme/tokens.css` (values filled in Task 0.3)

---

## Color strategy

Restrained. The palette is warm-tinted neutrals with the owner-color hues applied semantically — they identify who owns an SLA, who is responsible for a document, who acted in the activity feed. They are not used decoratively. One accent color at under 10% of total surface area.

No `#000`, no `#fff`. The darkest ink and the lightest background are both tinted. This keeps the warmth and prevents the clinical white-and-black feel of hospital portals and healthcare SaaS.

Breached SLA states and warnings use clay/amber (`--warn`), not alarm-red. The one state that uses a heavier treatment is `rejected`, and even there the tone is heavy-and-clear, not alarming.

All color values use the OKLCH color space. Tokens are defined in `src/theme/tokens.css`.

---

## OKLCH palette

All values are filled in Task 0.3. The table below defines the token names and their roles.

| Token name | Purpose | Approximate OKLCH triplet |
|---|---|---|
| `--bg` | Page background | `oklch(0.985 0.006 85)` |
| `--surface` | Raised surface (cards, panels) | `oklch(0.97 0.006 85)` |
| `--ink` | Body text | `oklch(0.22 0.01 85)` |
| `--ink-muted` | Secondary text, labels, captions | `oklch(0.45 0.01 85)` |
| `--hairline` | Borders, dividers, separators | `oklch(0.88 0.006 85)` |
| `--accent` | Single accent; used at <10% surface area | `oklch(0.55 0.13 235)` |
| `--ok` | Positive states (approved, settled) | `oklch(0.6 0.12 150)` |
| `--warn` | Breach callouts, deductions, queries | `oklch(0.7 0.13 75)` |
| `--bad` | Rejected state; used sparingly | `oklch(0.55 0.16 25)` |

---

## Owner-color system

Each party in the claim lifecycle has a distinct hue. These colors identify who owns or performed an action. They are labels, not statuses: the patient color is the color of the patient even when nothing is wrong. Tokens and i18n label keys are filled in Task 0.3.

The owner-color system is used in three places: SLA chip labels (who owns the deadline), activity-feed attributions (who acted), and the document checklist's "responsible party" column.

| Token | i18n label key | Purpose |
|---|---|---|
| `--owner-patient` | `owners.patient` | `oklch(0.6 0.10 250)` |
| `--owner-hospital` | `owners.hospital` | `oklch(0.6 0.10 160)` |
| `--owner-tpa` | `owners.tpa` | `oklch(0.62 0.10 300)` |
| `--owner-insurer` | `owners.insurer` | `oklch(0.6 0.10 30)` |
| `--owner-regulator` | `owners.regulator` | `oklch(0.55 0.08 100)` |

Owner roles get a color, not an icon. The color is their identity across the entire app.

---

## Type scale

Minimum ratio: 1.25 (major third). Minimum 6 steps. Hierarchy is achieved via scale and weight contrast, not color alone. Body text line length is 65 to 75 characters.

Specific step sizes, weights, and line heights are filled in Task 0.3.

---

## Spacing scale

Varied rhythm, not uniform. Some gaps are tighter (related elements within a component), some are looser (between sections, between cards, before a terminal-state screen). The scale is not a mechanical multiplier applied everywhere. The rhythm is the designer's call at each junction.

Specific step values are filled in Task 0.3.

---

## Surface and elevation

Light theme throughout. Depth is expressed via hairline borders and tinted surfaces, not heavy box shadows. A raised surface (`--surface`) is a slight tint above `--bg`; it does not cast a shadow. The cockpit layout's rails and the sticky header are distinguished by hairlines and surface tints, not shadows.

---

## Motion

Minimal. Automated playback advances with a simple crossfade or slide; the transition should feel like turning a page, not a product demo animation.

The app respects `prefers-reduced-motion`. When the media query is set: automated-mode transitions are suppressed (state updates are instant); the auto-advance interval is extended so the user has time to read without transitions. Automated playback also pauses when reduced motion is set, to avoid a stream of rapid visual changes.

---

## Iconography

Small, line-style, functional. Icons appear where they reduce cognitive load (the tab bar, document status indicators, the lens toggle). They are never decorative.

Owner roles do not get icons. They get a color.

---

## Iconographic anti-patterns

These patterns are specifically banned in this design:

- Card grids of identical tiles. The document checklist groups by phase and uses weight contrast and leading indicators, not a flat list of same-shaped rows.
- Hero-metric dashboards. The `settled` screen is a settlement statement, not a big ₹ number.
- Side-stripe-only state coloring. An SLA breach callout uses a full treatment: background tint + icon + owner color. A `border-left` alone is not enough.
- Modal-first interactions. The scenario picker is a real screen or slide-over with proper content per scenario, not a dropdown or a modal list.
- Chat-bubble metaphors. The activity feed is an attributed event log. It uses a vertical thread structure with actor labels, timestamps, and plain-language event descriptions. No bubble tails, no avatars, no messaging-app aesthetic.
- Gradient text. No.
- Decorative glassmorphism. No.

---

## Density

Indian retail finance UI density, not sparse American SaaS. The app is meant to convey a full claim — SLA clocks, document statuses, an activity feed, a journey indicator — without making the user scroll past empty space to reach it.

₹ amounts use Indian digit grouping (₹1,23,456; lakh/crore). Dates use an Indian format. Formatting implementation is in Phase 6 of the build plan.

---

## Accessibility

WCAG-AA contrast on all text. Minimum touch target size 44 by 44 px on mobile. Visible keyboard focus rings on all interactive elements. Screen-reader landmarks: `<header>`, `<main>`, `<nav>`, and region labels where needed. The bottom tabs and the journey stage bar are navigable by keyboard.

The lens annotations are real text, not images. They are readable by screen readers. This is both an accessibility requirement and a `/design` talking point: the framework's design philosophy should be legible to all users.

---

## The lens

The design-lens overlay (available in `/demo` only) surfaces sparse, step-specific annotations citing design principles. Each annotation is one short line plus a principle tag. Hard cap: 2 to 4 annotations per screen. More than 4 and the app stops looking like a product.

Presentation is viewport-dependent. On mobile: annotated elements get a small numbered badge (approximately 20 px, placed in a corner without overlapping content); annotation text renders in a stacked list below the screen or as a bottom sheet, with badge-to-annotation tap highlighting in both directions. On desktop: margin callouts in the cockpit gutter, connected to their elements with a thin leader line.

The lens never dims or desaturates surrounding content. De-emphasis, where needed, is a subtle hairline highlight ring on the annotated element. Dim-as-focus is a tell that demo mode has been bolted on; this design does not have that tell.
