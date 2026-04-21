// render-pdf.mjs — run inside mcr.microsoft.com/playwright container.
// Produces the tagged print-ready PDF from /work/_all.html:
//   - /out/upcj-starter-kit.pdf — tagged (PDF/UA-1 after post-processing)
//
// AcroForm fillable output is deferred to v1.1 — see spec §2, §8. Chromium
// headless does not emit widget annotations from HTML forms even with
// --enable-blink-features=PdfFormRendering, so a pdf-lib widget-injection
// post-processor is needed. That work is scoped separately.

import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const SRC = "file:///work/_all.html";
const OUT = "/out/upcj-starter-kit.pdf";

const browser = await chromium.launch({ args: ["--headless=new"] });
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(SRC, { waitUntil: "networkidle" });

const client = await context.newCDPSession(page);
const { data } = await client.send("Page.printToPDF", {
  printBackground: true,
  preferCSSPageSize: true,
  generateTaggedPDF: true,
  generateDocumentOutline: true,
});
writeFileSync(OUT, Buffer.from(data, "base64"));
console.log(`Wrote ${OUT}`);

await browser.close();
console.log("Done.");
