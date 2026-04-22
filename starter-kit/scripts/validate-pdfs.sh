#!/usr/bin/env bash
# Run veraPDF PDF/UA-1 conformance check against the print-ready PDF.
# Exits non-zero if it fails.
set -euo pipefail

cd "$(dirname "$0")/.."

pdf=dist/upcj-starter-kit.pdf
if [ ! -f "$pdf" ]; then
  echo "missing $pdf — run scripts/build-pdfs.sh first" >&2
  exit 1
fi
echo "== veraPDF $pdf =="
docker run --rm -v "$PWD:/work" -w /work \
  verapdf/cli:latest \
  --flavour ua1 --format text "$pdf"

echo ""
echo "PDF/UA-1 compliant."
