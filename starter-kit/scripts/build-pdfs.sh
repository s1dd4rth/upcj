#!/usr/bin/env bash
# Build the tagged print-ready PDF from dist/html using Chromium via
# Playwright. The v1.0.0 output is a single PDF/UA-1 conformant document.
# Fillable AcroForm output is deferred to v1.1 — see spec §2, §8.
#
# Pipeline:
#   1. Node — concatenate dist/html/ pages into dist/html/_all.html
#   2. Docker (Playwright image) — render _all.html → raw tagged PDF
#   3. Docker (same image) — post-process for PDF/UA-1 compliance:
#        • inject XMP metadata stream (rule 7.1.8)
#        • wrap untagged content items in /Artifact BMC…EMC (rule 7.1.3)
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -d dist/html ]; then
  echo "dist/html missing — run npm run build first" >&2
  exit 1
fi

# Build a single combined HTML the renderer can paginate.
node - <<'EOF'
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist/html";
const matterPrefix = ["cover.html", "how-to-use-1.html", "how-to-use-2.html", "decision-junction.html"];
const matterSuffix = ["glossary.html"];

const allFiles = new Set(
  readdirSync(DIST).filter((f) => f.endsWith(".html") && f !== "index.html" && f !== "_all.html")
);
const stepFiles = [...allFiles]
  .filter((f) => /^[0-9A-B]/.test(f) && !f.startsWith("DOC-"))
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
const docFiles = [...allFiles].filter((f) => f.startsWith("DOC-")).sort();

const orderedFiles = [
  ...matterPrefix.filter((f) => allFiles.has(f)),
  ...stepFiles,
  ...docFiles,
  ...matterSuffix.filter((f) => allFiles.has(f))
];

const bodies = orderedFiles.map((f) => {
  const html = readFileSync(join(DIST, f), "utf8");
  const m = html.match(/<body>([\s\S]*?)<\/body>/);
  if (!m) throw new Error(`${f}: missing <body>`);
  return m[1];
});

const out = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>UPCJ Starter Kit</title>
<link rel="stylesheet" href="kit.css">
</head>
<body>
${bodies.join("\n")}
</body>
</html>`;

writeFileSync(join(DIST, "_all.html"), out);
console.log(`Concatenated ${orderedFiles.length} pages into _all.html`);
EOF

# Run Chromium-via-Playwright inside a container that has both pre-installed.
# Mount dist/html as /work (read) and dist/ as /out (write).
# --ipc=host is required by Chromium in Docker (shared memory for renderer process).
#
# The mcr.microsoft.com/playwright image ships Chromium binaries but not the
# playwright npm package. We install it at runtime into /tmp/pw inside the
# container (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 skips a redundant browser
# download — the image already has the matching Chromium at /ms-playwright/).
#
# After rendering, we install pikepdf and run fix-pdf-ua.py to add the
# XMP metadata stream and wrap untagged content items as /Artifact.
docker run --rm \
  -v "$PWD/dist/html:/work:ro" \
  -v "$PWD/dist:/out" \
  -v "$PWD/scripts/render-pdf.mjs:/render-pdf.mjs:ro" \
  -v "$PWD/scripts/fix-pdf-ua.py:/fix-pdf-ua.py:ro" \
  --ipc=host \
  mcr.microsoft.com/playwright:v1.50.0-jammy \
  bash -c '
    set -e

    # ---- Render: Chromium via Playwright ----
    mkdir -p /tmp/pw
    cd /tmp/pw
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --silent playwright@1.50.0
    cp /render-pdf.mjs /tmp/pw/render-pdf.mjs
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright node /tmp/pw/render-pdf.mjs

    # ---- Post-process: inject XMP + artifact-wrap untagged content ----
    DEBIAN_FRONTEND=noninteractive apt-get update -qq
    DEBIAN_FRONTEND=noninteractive apt-get install -y python3-pikepdf 2>&1 | grep -E "pikepdf|error|Error" || true
    python3 /fix-pdf-ua.py /out/upcj-starter-kit.pdf /out/upcj-starter-kit.pdf
  '

echo "Wrote dist/upcj-starter-kit.pdf"
