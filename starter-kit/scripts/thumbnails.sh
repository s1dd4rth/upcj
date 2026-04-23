#!/usr/bin/env bash
# Generate six PNG thumbnails of representative starter-kit pages for
# embedding on the public landing page. Writes to ../assets/starter-kit-preview.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -d dist/html ]; then
  echo "dist/html missing — run npm run build first" >&2
  exit 1
fi

# Allow overriding the output directory via env var so callers can write
# directly to the main repo's assets/ rather than the worktree's copy.
# Resolve to an absolute path regardless of whether the env var is relative
# or absolute.
_raw_out="${THUMBNAILS_OUT:-"../assets/starter-kit-preview"}"
mkdir -p "$_raw_out"
OUT="$(cd "$_raw_out" && pwd)"

docker run --rm \
  -v "$PWD/dist/html:/work:ro" \
  -v "$OUT:/out" \
  -v "$PWD/scripts/render-thumbnails.mjs:/render-thumbnails.mjs:ro" \
  --ipc=host \
  mcr.microsoft.com/playwright:v1.50.0-jammy \
  bash -c '
    set -e
    mkdir -p /tmp/pw && cd /tmp/pw
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --silent playwright@1.50.0
    cp /render-thumbnails.mjs /tmp/pw/render-thumbnails.mjs
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright node /tmp/pw/render-thumbnails.mjs
  '

echo "Wrote six PNGs to $(cd "$OUT" && pwd)"
ls -lh "$OUT"
