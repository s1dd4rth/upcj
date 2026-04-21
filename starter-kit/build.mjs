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
const PAGE_ORDER_SUFFIX = ["glossary"];
const MATTER_PAGE_COUNT = PAGE_ORDER_PREFIX.length + PAGE_ORDER_SUFFIX.length;

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

const FIELD_RULES = [
  { match: /^date\b/i,            type: "text", hint: "DD-MM-YYYY" },
  { match: /\bhelpline\b/i,       type: "tel",  autocomplete: "tel" },
  { match: /\bphone\b/i,          type: "tel",  autocomplete: "tel" },
  { match: /\bpostal\b|pincode/i, type: "text", autocomplete: "postal-code" },
  { match: /\bname\b/i,           type: "text", autocomplete: "name" },
  { match: /date of birth|dob/i,  type: "text", hint: "DD-MM-YYYY", autocomplete: "bday" },
  { match: /diagnosis|reason for|notes|symptoms/i, multiline: true, type: "text" },
  { match: /icd-10/i,             multiline: true, type: "text", hint: "ICD-10 code + description" },
  { match: /amount|sum/i,         type: "text", hint: "INR" }
];

export function fieldInputType(label) {
  for (const rule of FIELD_RULES) {
    if (rule.match.test(label)) {
      const { match, ...rest } = rule;
      return { type: "text", ...rest };
    }
  }
  return { type: "text" };
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function renderTemplatePage({ document: doc, templates, context }) {
  const fields = doc.critical_fields.map((label) => ({
    label,
    slug: slugify(`${doc.id}-${label}`),
    ...fieldInputType(label)
  }));
  const actor = doc.generated_by; // "Doctor", "Hospital", "Insurer", etc.
  const actorRole = actor === "Doctor" ? "doctor" : actor.toLowerCase();
  const body = templates["template-page"]({
    docId: doc.id,
    docName: doc.name,
    actor,
    actorRole,
    fields
  });
  return templates.layout({
    ...context,
    pageCode: doc.id,
    contextLeft: `Document · ${doc.id}`,
    contextRight: `Generated by ${actor}`,
    title: doc.name,
    body
  });
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

  const totalPages = steps.length + documents.length + MATTER_PAGE_COUNT;
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

  for (const doc of documents) {
    const html = renderTemplatePage({
      document: doc, templates, context: { ...context, pageNumber }
    });
    writeFileSync(join(distHtml, `${doc.id}.html`), html);
    pageNumber++;
  }
  console.log(`Built ${documents.length} template pages`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
