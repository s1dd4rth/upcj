# UPCJ Patient Starter Kit

Generator for a 37-page A4 printable-and-fillable patient starter kit.
Source of truth for form fields is `../framework/document-registry.json`.
Step guide content lives in `content/steps/`. Matter lives in `content/matter/`.

## Build

    npm install
    npm run build
    npm run preview   # visit http://localhost:8080

`npm run build` writes `dist/html/` (one HTML per page plus an index).
PDFs are built in CI only (see `.github/workflows/starter-kit.yml`).

## Adding a new step

1. Add `content/steps/<step-id>.md` with the front-matter schema (see an existing file).
2. Ensure `<step-id>` is listed in `../framework/ownership-matrix.json` — the generator
   will refuse to build an orphan step.
3. `npm run build && npm test`.

## Adding a new document

Add the object to `../framework/document-registry.json` with a `critical_fields` array.
Every entry in that array becomes one form field. The generator refuses to build if
`critical_fields` is empty.

## Accessibility

All HTML must pass axe-core and pa11y with zero violations. PDFs must pass
veraPDF's PDF/UA-1 conformance check. The CI workflow enforces all three.
