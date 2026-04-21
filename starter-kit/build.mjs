// build.mjs — UPCJ starter kit generator.
// Single entry point. Reads framework JSON + content markdown.
// Writes dist/html/ for preview and PDF source.

import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";
import matter from "gray-matter";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const PAGE_ORDER_PREFIX = ["cover", "how-to-use-1", "how-to-use-2", "decision-junction"];

export function loadDocumentRegistry({ fixture } = {}) {
  const path = fixture
    ? resolve(__dirname, fixture)
    : join(ROOT, "framework", "document-registry.json");
  const { documents } = JSON.parse(readFileSync(path, "utf8"));
  for (const doc of documents) {
    if (!Array.isArray(doc.critical_fields) || doc.critical_fields.length === 0) {
      throw new Error(`${doc.id}: critical_fields must be a non-empty array`);
    }
  }
  return documents;
}

export function loadOwnershipMatrix() {
  const path = join(ROOT, "framework", "ownership-matrix.json");
  return JSON.parse(readFileSync(path, "utf8"));
}

export function loadSteps() {
  const dir = join(__dirname, "content", "steps");
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  const steps = files.map((file) => {
    const id = file.replace(/\.md$/, "");
    const raw = readFileSync(join(dir, file), "utf8");
    try {
      const { data, content } = matter(raw);
      return { id, ...data, bodyHtml: marked.parse(content) };
    } catch (err) {
      throw new Error(`content/steps/${file}: ${err.message}`, { cause: err });
    }
  });
  steps.sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
  return steps;
}

export function loadMatter() {
  const dir = join(__dirname, "content", "matter");
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  return Object.fromEntries(
    files.map((file) => {
      const id = file.replace(/\.md$/, "");
      const raw = readFileSync(join(dir, file), "utf8");
      try {
        const { data, content } = matter(raw);
        return [id, { id, ...data, bodyHtml: marked.parse(content) }];
      } catch (err) {
        throw new Error(`content/matter/${file}: ${err.message}`, { cause: err });
      }
    })
  );
}

export function loadTemplates() {
  const dir = join(__dirname, "templates");
  const files = readdirSync(dir).filter((f) => f.endsWith(".hbs"));
  const templates = {};
  for (const file of files) {
    const name = file.replace(/\.hbs$/, "");
    const source = readFileSync(join(dir, file), "utf8");
    const key = name.startsWith("_") ? name.slice(1) : name;
    templates[key] = Handlebars.compile(source);
  }
  return templates;
}

export function loadVersion() {
  return readFileSync(join(__dirname, "VERSION"), "utf8").trim();
}

export function renderGuidePage({ step, nextStep, templates, context }) {
  const body = templates["guide-page"]({
    stepTitle: step.title,
    lede: step.lede,
    whatHappens: step.whatHappens,
    sayThis: step.sayThis,
    checkFor: step.checkFor,
    criticalFieldsDocId: step.criticalFieldsDocId,
    deadline: step.deadline,
    nextStep: nextStep && { id: nextStep.id, title: nextStep.title }
  });
  return templates.layout({
    ...context,
    pageCode: step.id,
    contextLeft: `Phase ${step.phase} · Path: ${step.path}`,
    contextRight: step.id,
    title: step.title,
    body
  });
}

function findStep(steps, id) {
  return steps.find((s) => s.id === id) ?? null;
}

async function main() {
  const distHtml = join(__dirname, "dist", "html");
  rmSync(join(__dirname, "dist"), { recursive: true, force: true });
  mkdirSync(distHtml, { recursive: true });
  writeFileSync(join(distHtml, "kit.css"),
    readFileSync(join(__dirname, "templates", "kit.css"), "utf8"));

  const documents = loadDocumentRegistry();
  const steps = loadSteps();
  const matterPages = loadMatter();
  const templates = loadTemplates();
  const version = loadVersion();

  const totalPages = steps.length + documents.length + 5; // 17 + 15 + 5 (matter)
  const context = { version, totalPages };

  let pageNumber = PAGE_ORDER_PREFIX.length + 1;
  for (const step of steps) {
    const nextStep = step.nextStepId ? findStep(steps, step.nextStepId) : null;
    const html = renderGuidePage({
      step, nextStep, templates, context: { ...context, pageNumber }
    });
    writeFileSync(join(distHtml, `${step.id}.html`), html);
    pageNumber++;
  }

  console.log(`Built ${steps.length} guide pages into ${distHtml}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
