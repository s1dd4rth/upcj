#!/usr/bin/env bash
# Run veraPDF PDF/UA-1 conformance check against every PDF in dist/.
# Exits non-zero if any PDF fails.
set -euo pipefail

cd "$(dirname "$0")/.."

fail=0
for pdf in dist/upcj-starter-kit.pdf dist/upcj-starter-kit-fillable.pdf; do
  if [ ! -f "$pdf" ]; then
    echo "missing $pdf — run scripts/build-pdfs.sh first" >&2
    exit 1
  fi
  echo "== veraPDF $pdf =="
  # veraPDF CLI emits XML reports; --format text is human-readable.
  # Exit code: 0 = compliant, non-zero = non-compliant or error.
  docker run --rm -v "$PWD:/work" -w /work \
    verapdf/cli:latest \
    --flavour ua1 --format text "$pdf" || fail=1
done

if [ $fail -ne 0 ]; then
  echo ""
  echo "One or more PDFs failed PDF/UA-1 validation." >&2
  exit 1
fi
echo ""
echo "All PDFs PDF/UA-1 compliant."
