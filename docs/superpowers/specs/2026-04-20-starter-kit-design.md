# UPCJ Patient Starter Kit — Design Spec

**Status:** Draft for approval
**Date:** 2026-04-20
**Target:** UPCJ roadmap item "Printable starter kit" (sits alongside v1.2 A3 poster, v1.3 WhatsApp bot)
**License:** CC BY-SA 4.0 (inherited)

## 1. Purpose

A printable-and-fillable artifact a patient receives at hospital admission that carries them through every step of the insurance claim journey. It doubles as a standardisation vehicle for providers — every template page corresponds 1:1 to a canonical document in `framework/document-registry.json`, so any hospital, TPA, or insurer that adopts the kit is adopting the Open Claim Specification.

A single kit serves three audiences without forking:
- The patient (guide pages direct the least-informed actor through each handoff).
- The provider (template pages are the form to fill; critical fields are pre-printed).
- Future digital channels (WhatsApp cards, app screens) consume the same source content and layout blocks.

## 2. Scope

**In v1:**
- ~18 **guide pages** — one per journey step: `1.1`, `1.2`, `1.3`, `A.1`–`A.5`, `B.1`–`B.5`, `3.1`–`3.4`.
- ~15 **template pages** — one per canonical document: `DOC-001` through `DOC-015` in `document-registry.json`.
- 4 **front/back-matter pages** — cover, how to use this kit, decision-junction flowchart, glossary + grievance phone tree.
- Two released PDFs from the same source: **print-ready** (flat pages) and **fillable** (AcroForm fields preserved).
- HTML preview published on the existing GitHub Pages site.
- Both claim paths: cashless (`A.*`) and reimbursement (`B.*`) covered fully.
- English only.

**Out of scope for v1** (deferred, already on roadmap):
- Hindi/Tamil translations — v1.2.
- WhatsApp image cards — v1.3. Layout will be chosen so extraction is mechanical.
- App screens — v2.
- A3 fold-out poster — separate roadmap item.
- Aadhaar, DigiLocker, or other Public Digital Infrastructure integration.
- Digital signatures, encrypted fields, or any form of online submission.

## 3. Success criteria

- A patient handed the kit at admission can navigate to the step they are on, know what to ask for, and verify a received document contains the right fields — without calling anyone.
- A doctor or hospital clerk can fill a template in under 2 minutes; the completed form is acceptable to any TPA in India.
- Both PDFs pass WCAG 2.1 AA (WCAG 2.2 AA where applicable) and PDF/UA-1 automated validation.
- When a `critical_fields` array changes in `document-registry.json`, the corresponding template page regenerates with the new fields; no manual HTML edit required.

## 4. Benchmarks and governing standards

The kit aligns with two public standards.

### 4.1 GIGW 3.0 — Guidelines for Indian Government Websites (mandatory)

- WCAG 2.1 Level AA minimum; contrast 4.5:1 for body text, 3:1 for large text and UI.
- Tagged PDFs with correct reading order, Lang entry set, form fields accessible.
- Every input has an associated `<label>`. Fields sized to accommodate maximum expected entry. Labels above or left-aligned. Format hints (`DD-MM-YYYY`, ICD-10) in small grey below label.
- Required fields identified at form start; logical tab order; `fieldset`/`legend` for grouped inputs.
- Purpose of each field programmatically determinable (`autocomplete` attribute) for autofill support.
- Forms usable without JavaScript.
- Language tagging: `lang="en"` on `<html>`, Lang entry in PDF document catalog.
- No information conveyed by colour alone — every coloured block carries a text label.

### 4.2 gov.uk design principles (informing, not mandating)

The kit honours "start with user needs," "do the hard work to make it simple," "this is for everyone," "understand context," and "consistent, not uniform." Practically: no decoration that fails to carry meaning, one column, short sentences, second person, plain language.

## 5. Content model

### 5.1 Three page types with fixed skeletons

**Guide page (per step).** Masthead · context band (phase, path applicability) · step title · lede · "What happens" bullets · "Say this" block (blue border, italic script) · "Check for" critical-fields checklist · deadline block (red border) where a deadline applies · foot with next-page pointer and page code.

**Template page (per document).** Masthead · context band (document ID, generator actor) · operational note (yellow bar, e.g. "For completion by the treating doctor") · document title · named form fields · signature block · stamp box (bottom-right) · foot with registry cross-reference and page code.

**Front/back matter.** Cover (brand, edition, license, version) · how-to-use (2 pages — fold, carry, when to show which sheet) · decision-junction flowchart (cashless vs reimbursement deciding questions) · glossary and grievance phone tree (IRDAI 155255, Ombudsman).

### 5.2 Sources of truth (no duplicated content)

- **Step content** — human-authored markdown in `starter-kit/content/steps/<step-id>.md` with front-matter (title, phase, path, deadline, script, critical-fields reference).
- **Document fields** — `framework/document-registry.json` is the single source. Every `critical_fields` entry becomes exactly one form field on the template page. The generator refuses to build if a critical field has no corresponding input type defined.
- **Ownership and SLAs** — `framework/ownership-matrix.json` and the SLA table in `framework/data-analysis.md` feed "what happens" and deadline blocks.

### 5.3 Form field standards

- **Single-line field:** ≥10 mm vertical handwriting height. Label above, 9 pt uppercase, left-aligned. Format hint in `--dark-grey` below the label.
- **Multi-line field (diagnosis, reason for admission, etc.):** ≥20 mm per visual line, minimum 3 lines. Box border in `--black`, 1.5 pt.
- **Signature block:** 60 mm × 25 mm rule with label beneath ("Treating doctor — name & registration number").
- **Stamp box:** fixed 45 mm × 45 mm bordered square, bottom-right of every provider-generated template, labelled "Hospital stamp" in 9 pt uppercase. Sized for the standard ~40 mm round Indian rubber stamp with 2–3 mm bleed tolerance.
- Grouped fields use `<fieldset>` with `<legend>`. Required-field convention: "All fields are mandatory unless marked *optional*." Every template leads with this line.
- Tab order follows reading order (top-to-bottom, left-to-right).
- `autocomplete` attributes used where applicable: `bday`, `tel`, `name`, `postal-code`.

### 5.4 Content rules

- Plain language, short sentences, second person ("You should ask…").
- Every deadline specifies unit, actor, and consequence in a single block.
- Scripts in direct quotes, italic, blue border — verbatim what the patient should say.
- Every document referenced by registry ID (`DOC-005`) so paper and digital share the same handle.
- No jargon without a glossary entry.

## 6. Visual system

### 6.1 Tokens (inherited from `patient-checklist.html` / `journey-map.html`)

| Token | Value | Role | AA check |
|---|---|---|---|
| `--black` | `#0b0c0c` | Body text, masthead bg | 19.59:1 on white |
| `--white` | `#ffffff` | Paper | — |
| `--link` | `#1d70b8` | "Say this" block accent | 5.26:1 white-on |
| `--red` | `#d4351c` | Deadline accent, error | 4.81:1 white-on |
| `--green` | `#00703c` | Confirmation (sparing) | 4.91:1 white-on |
| `--yellow` | `#ffdd00` | Operational note bg | 15.7:1 black-on |
| `--light-grey` | `#f3f2f1` | Context band, zebra | — |
| `--mid-grey` | `#b1b4b6` | Borders, rules | — |
| `--dark-grey` | `#505a5f` | Small text, hints | 7.49:1 on white |

No background images, no gradients. Solid fills only where they carry meaning.

### 6.2 Typography

Font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`. System stack — no web font dependency for print.

| Element | Size | Line-height |
|---|---|---|
| h1 (page title) | 22 pt | 1.15 |
| h2 (section heading) | 14 pt | 1.2 |
| h3 (subsection) | 11 pt bold | 1.3 |
| Body | 11 pt | 1.47 |
| Small / hint | 9 pt | 1.4 |

All-caps restricted to 9 pt labels and context bands. Tabular numerals where alignment matters.

### 6.3 Page geometry (A4 portrait, 210 × 297 mm)

- Margins: 20 mm top, 18 mm bottom, 20 mm inner, 20 mm outer.
- Content column: 170 mm wide → ~75 characters per line at 11 pt body.
- Masthead: full-bleed black bar, 10 mm tall.
- Context band directly under masthead: 6 mm tall, `--light-grey`.
- Footer: 9 pt `--dark-grey`, 4 mm above bottom margin.

### 6.4 Accessibility commitments

- WCAG 2.1 AA (full), WCAG 2.2 AA for new criteria (focus not obscured, dragging movements, target size ≥ 24 × 24 px for all interactive elements in the HTML preview).
- HTML: semantic heading hierarchy (h1 → h2 → h3, no skipping); `<form>` with `<fieldset>`/`<legend>`; `<label for="…">` explicitly bound; `aria-describedby` for field hints; `lang="en"` on `<html>`.
- PDF: tagged output with `Lang`, `StructTreeRoot`, correct reading order, AcroForm accessible fields, bookmarks for every page, no image-only text.

### 6.5 Print fidelity

- Every accent colour must remain recognisable in grayscale (value-contrast, not hue-contrast).
- No background photographs; flat fills only.
- 300 dpi minimum for any raster logos or seals (none planned in v1).

## 7. Build, repo, and release

### 7.1 Toolchain

- **Build:** `starter-kit/build.mjs` — Node script, Handlebars templates, reads `framework/*.json` and `starter-kit/content/`, writes `starter-kit/dist/`.
- **Preview:** Static HTML served with `python3 -m http.server`. Paged.js polyfill in each HTML file renders A4 page breaks live in the browser; no PDF round-trip during authoring.
- **PDF generation (CI only):** GitHub Action runs WeasyPrint against generated HTML. Two output PDFs: `upcj-starter-kit.pdf` (flat print-ready) and `upcj-starter-kit-fillable.pdf` (AcroForm fields). WeasyPrint is the chosen renderer because it emits properly tagged PDFs with Lang entry, reading order, and accessible form fields — the GIGW-mandated surface.
- **Validation (CI only):** three gates per release:
  1. `axe-core` against each rendered HTML page.
  2. `pa11y` second-opinion pass.
  3. `veraPDF` PDF/UA-1 conformance check against the output PDFs.
  All three must pass for the release job to succeed.

### 7.2 Repo layout

```
starter-kit/
├── README.md               # Authoring guide (what this dir is, how to add a step)
├── VERSION                 # Semver (1.0.0, ...)
├── build.mjs               # Generator (Node)
├── templates/
│   ├── kit.css             # Shared print CSS — all tokens
│   ├── _layout.hbs         # Masthead, context band, foot
│   ├── guide-page.hbs      # Per-step guide
│   ├── template-page.hbs   # Per-document form
│   ├── cover.hbs
│   ├── how-to-use.hbs
│   ├── decision-junction.hbs
│   └── glossary.hbs
├── content/
│   ├── steps/              # One .md per step with front-matter
│   │   ├── 1.1.md
│   │   ├── 1.2.md
│   │   ├── 1.3.md
│   │   ├── A.1.md
│   │   ├── ... (through A.5.md)
│   │   ├── B.1.md
│   │   ├── ... (through B.5.md)
│   │   ├── 3.1.md
│   │   ├── ... (through 3.4.md)
│   └── matter/             # Cover, how-to, glossary long-form
│       ├── cover.md
│       ├── how-to-use.md
│       ├── decision-junction.md
│       └── glossary.md
└── dist/                   # Generated — gitignored
    ├── html/               # Per-page HTML for web preview
    ├── upcj-starter-kit.pdf
    └── upcj-starter-kit-fillable.pdf

.github/workflows/
└── starter-kit.yml         # Build + accessibility gates + release on tag
```

### 7.3 Versioning and release

- Kit version lives in `starter-kit/VERSION` (semver).
- GitHub Action builds PDFs on every tag matching `starter-kit-v*` and attaches them to the release.
- Latest PDFs mirrored to GitHub Pages at `/starter-kit.pdf` and `/starter-kit-fillable.pdf`.
- Every page footer carries kit version + page code (`UPCJ/SK/1.3/EN v1.0.0`), so a printed sheet is self-identifying and version-traceable.

### 7.4 Digital adaptation hooks (forward compatibility)

- Hero content (title, lede, script, deadline) of every guide page fits within the top 60% of the A4 — the portion that also renders as a clean 1200 × 1600 PNG for WhatsApp v1.3. No redesign required; just a crop.
- Template pages use semantic HTML inputs, so the same HTML drives a future in-app form with minimal change.
- Step content in `content/steps/*.md` is format-agnostic; the future app consumes it directly.

## 8. Risks and open questions

**Risks:**
- **WeasyPrint AcroForm fidelity.** Fillable PDFs must preserve form semantics. Mitigation: prototype on one template page in week 1 of implementation and validate with veraPDF + Acrobat before committing to 15.
- **Stamp-box size drift across printers.** 45 mm × 45 mm is sized for a typical Indian stamp, but reprography variance can shift the box. Mitigation: a 3 mm bleed area marked inside the border in the print-ready PDF; the fillable PDF has no stamp until printed.
- **Content authoring load.** ~18 step `.md` files need careful, plain-language content. Mitigation: seed drafts from `framework/patient-checklist.html` existing copy; peer review by a patient-advocacy contributor before v1.0.0 tag.

**Open questions (tracked in implementation plan, not blocking this spec):**
- Does WeasyPrint's AcroForm output satisfy veraPDF's PDF/UA-1 check, or do we need a post-processing step with `qpdf` or `pdfcs` to add missing tags? Answered in implementation prototype.
- Cover page — does it carry a QR code to the GitHub Pages HTML version? Defer to authoring review.
- Licensing line on every page, or only on cover? Defer to authoring review.

## 9. Links

- Existing framework: `framework/patient-checklist.html`, `framework/journey-map.html`, `framework/document-registry.json`, `framework/ownership-matrix.json`, `framework/data-analysis.md`.
- [Designing Accessible and Usable Forms — GIGW 3.0](https://guidelines.india.gov.in/designing-accessible-and-usable-forms/)
- [Accessibility Guidelines and Attributes — GIGW 3.0](https://guidelines.india.gov.in/accessibility-guidelines-and-attributes/)
- [GIGW 3.0 Introduction](https://guidelines.india.gov.in/introduction/)
- [Government Design Principles — gov.uk](https://www.gov.uk/guidance/government-design-principles)
- [Type Scale — gov.uk Design System](https://design-system.service.gov.uk/styles/type-scale/)
- [Colour — gov.uk Design System](https://design-system.service.gov.uk/styles/colour/)
