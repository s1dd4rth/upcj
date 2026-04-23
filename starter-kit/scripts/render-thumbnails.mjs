// Renders six A4-sized PNG thumbnails of representative kit pages.
// Runs inside mcr.microsoft.com/playwright container.
// Reads from /work (dist/html), writes to /out (assets/starter-kit-preview).

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const PAGES = [
  { id: "cover",              label: "cover" },
  { id: "decision-junction",  label: "decision-junction" },
  { id: "1.3",                label: "guide-with-deadline" },
  { id: "DOC-005",            label: "template-with-form" },
  { id: "icd-10-reference",   label: "icd-10-reference" },
  { id: "glossary",           label: "glossary" },
];

mkdirSync("/out", { recursive: true });

// 2x device scale factor so PNGs look crisp at ~400px display width on retina.
const browser = await chromium.launch({ args: ["--headless=new"] });
const context = await browser.newContext({
  viewport: { width: 800, height: 1132 },  // A4 aspect, 96dpi baseline × 2
  deviceScaleFactor: 2,
});

// Block Paged.js and other external resources — they either fail (no network
// in container) or rewrite the DOM into .pagedjs_sheet, which we don't need.
// Screenshotting the raw .page gives the same visual result via @media screen.
await context.route("**/*", route => {
  if (!route.request().url().startsWith("file://")) {
    route.abort();
  } else {
    route.continue();
  }
});

for (const { id, label } of PAGES) {
  const page = await context.newPage();
  await page.goto(`file:///work/${id}.html`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);

  // Paged.js wraps .page in .pagedjs_sheet when it finishes. Wait for that,
  // but fall back to screenshotting the raw .page if Paged.js didn't run.
  const target =
    (await page.$(".pagedjs_sheet")) ?? (await page.$(".page"));
  if (!target) throw new Error(`${id}: no .page or .pagedjs_sheet found`);

  await target.screenshot({
    path: `/out/${label}.png`,
    type: "png",
  });
  console.log(`Wrote /out/${label}.png`);
  await page.close();
}

await browser.close();
console.log("Done.");
