/**
 * Puppeteer configuration for the UPCJ starter kit.
 *
 * Skips Chrome download during `npm install` — pa11y and axe find the
 * browser via PUPPETEER_EXECUTABLE_PATH (set automatically by a11y.mjs on
 * macOS; set manually on CI or Docker).
 *
 * CI suggestion: install chromium via the OS package manager and set:
 *   PUPPETEER_EXECUTABLE_PATH=$(which chromium-browser)
 */
const config = {
  skipDownload: true,
  chrome: { skipDownload: true },
  "chrome-headless-shell": { skipDownload: true },
};

module.exports = config;
