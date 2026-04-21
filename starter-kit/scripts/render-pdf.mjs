// render-pdf.mjs — run inside mcr.microsoft.com/playwright container.
// Produces two PDFs from /work/_all.html:
//   - /out/upcj-starter-kit.pdf          — tagged print-ready (PDF/UA-1)
//   - /out/upcj-starter-kit-fillable.pdf — tagged + AcroForm widgets from HTML inputs
//
// Prerequisites in the container: @playwright/test with Chromium. The image
// provides both — we run this script via `node render-pdf.mjs`.

import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const SRC = "file:///work/_all.html";
const OUT_PRINT = "/out/upcj-starter-kit.pdf";
const OUT_FILLABLE = "/out/upcj-starter-kit-fillable.pdf";

const browser = await chromium.launch({
  args: [
    // Enable AcroForm widget emission from HTML <input>/<textarea>.
    "--enable-blink-features=PdfFormRendering",
    // New headless mode is required for the PdfFormRendering path.
    "--headless=new",
  ],
});

const context = await browser.newContext();
const page = await context.newPage();

await page.goto(SRC, { waitUntil: "networkidle" });

// --- Print PDF: tagged, flat (no form widgets). ---
{
  const client = await context.newCDPSession(page);
  const { data } = await client.send("Page.printToPDF", {
    printBackground: true,
    preferCSSPageSize: true,
    generateTaggedPDF: true,
    generateDocumentOutline: true,
  });
  writeFileSync(OUT_PRINT, Buffer.from(data, "base64"));
  console.log(`Wrote ${OUT_PRINT}`);
}

// --- Fillable PDF: tagged + AcroForm widgets. ---
// Chromium emits AcroForm widgets when PdfFormRendering Blink feature is on
// AND the page has HTML form inputs. No additional CDP flag is required —
// the widget emission is driven by the feature flag passed at launch.
{
  const client = await context.newCDPSession(page);
  const { data } = await client.send("Page.printToPDF", {
    printBackground: true,
    preferCSSPageSize: true,
    generateTaggedPDF: true,
    generateDocumentOutline: true,
  });
  writeFileSync(OUT_FILLABLE, Buffer.from(data, "base64"));
  console.log(`Wrote ${OUT_FILLABLE}`);
}

await browser.close();
console.log("Done.");
