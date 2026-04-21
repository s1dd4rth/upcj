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
    for (const field of doc.critical_fields) {
      if (typeof field !== "string" || field.trim() === "") {
        throw new Error(`${doc.id}: critical_fields contains an empty or non-string entry`);
      }
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
  // Date of birth must precede the generic date rule, otherwise "Date of birth"
  // matches /^date\b/ first and never gets autocomplete="bday".
  { match: /date of birth|dob/i,                          type: "text", hint: "DD-MM-YYYY", autocomplete: "bday" },
  // Match "date" anywhere in the label (not just at the start) so "Admission date",
  // "Discharge date", "Settlement date" all receive the DD-MM-YYYY hint.
  { match: /\bdate\b/i,                                   type: "text", hint: "DD-MM-YYYY" },
  { match: /\bhelpline\b/i,                               type: "tel",  autocomplete: "tel" },
  { match: /\bphone\b/i,                                  type: "tel",  autocomplete: "tel" },
  { match: /\bpostal\b|\bpincode\b/i,                     type: "text", autocomplete: "postal-code" },
  // Narrow: only fire autocomplete="name" for the patient's/policyholder's own name.
  // "Doctor name", "Test name", "Medicine name" must NOT match — they are third-party
  // or non-person labels where autocomplete="name" is wrong.
  { match: /\b(patient|policyholder|insured|member)\s+name\b|^name\b/i, type: "text", autocomplete: "name" },
  { match: /diagnosis|reason for|notes|symptoms/i,        multiline: true, type: "text" },
  { match: /\bicd-10\b/i,                                 multiline: true, type: "text", hint: "ICD-10 code + description" },
  // Word boundaries so "consumables" does not false-match on the substring "sum".
  { match: /\bamount\b|\bsum\b/i,                         type: "text", hint: "INR" }
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

const ACTOR_ROLE_LABEL = {
  "Doctor":             "Treating doctor",
  "Hospital":           "Hospital authorised signatory",
  "Hospital Admin":     "Hospital administrator",
  "Hospital Lab":       "Laboratory in-charge",
  "Hospital Pharmacy":  "Pharmacist",
  "Insurer":            "Insurer authorised signatory",
  "TPA":                "TPA authorised signatory",
  "Patient":            "Patient / policyholder",
  "Doctor / Hospital":  "Treating doctor / hospital",
  "Government":         null  // no signature block for government-issued IDs
};

export function renderTemplatePage({ document: doc, templates, context }) {
  const fields = doc.critical_fields.map((label) => ({
    label,
    slug: slugify(`${doc.id}-${label}`),
    ...fieldInputType(label)
  }));
  const actor = doc.generated_by;
  const signatureLabel = Object.prototype.hasOwnProperty.call(ACTOR_ROLE_LABEL, actor)
    ? ACTOR_ROLE_LABEL[actor]
    : `${actor} authorised signatory`;
  const body = templates["template-page"]({
    docId: doc.id,
    docName: doc.name,
    actor,
    signatureLabel,
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

export function renderMatterPage({ id, matter, templates, context }) {
  const template = templates[id] ?? templates["how-to-use"];
  const body = template({
    title: matter.title,
    lede: matter.lede,
    edition: matter.edition,
    license: matter.license,
    cashlessCriterion: matter.cashlessCriterion,
    reimbursementCriterion: matter.reimbursementCriterion,
    terms: matter.terms,
    bodyHtml: matter.bodyHtml
  });
  return templates.layout({
    ...context,
    pageCode: id.toUpperCase(),
    contextLeft: id === "cover" ? "" : "Front/back matter",
    contextRight: matter.title ?? "",
    title: matter.title ?? "UPCJ Starter Kit",
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

  let pageNumber = 1;

  // Prefix matter: cover, how-to-use (rendered as 2 pages), decision-junction
  const coverHtml = renderMatterPage({ id: "cover", matter: matterPages.cover, templates,
    context: { ...context, pageNumber } });
  writeFileSync(join(distHtml, "cover.html"), coverHtml); pageNumber++;

  for (const key of ["how-to-use-1", "how-to-use-2"]) {
    const html = renderMatterPage({ id: "how-to-use", matter: matterPages[key], templates,
      context: { ...context, pageNumber } });
    writeFileSync(join(distHtml, `${key}.html`), html);
    pageNumber++;
  }

  const djHtml = renderMatterPage({ id: "decision-junction", matter: matterPages["decision-junction"], templates,
    context: { ...context, pageNumber } });
  writeFileSync(join(distHtml, "decision-junction.html"), djHtml); pageNumber++;

  // Guide pages
  for (const step of steps) {
    const nextStep = step.nextStepId ? findStep(steps, step.nextStepId) : null;
    const html = renderGuidePage({
      step, nextStep, templates, context: { ...context, pageNumber }
    });
    writeFileSync(join(distHtml, `${step.id}.html`), html);
    pageNumber++;
  }

  // Template pages
  for (const doc of documents) {
    const html = renderTemplatePage({
      document: doc, templates, context: { ...context, pageNumber }
    });
    writeFileSync(join(distHtml, `${doc.id}.html`), html);
    pageNumber++;
  }

  // Suffix matter: glossary
  const gHtml = renderMatterPage({ id: "glossary", matter: matterPages.glossary, templates,
    context: { ...context, pageNumber } });
  writeFileSync(join(distHtml, "glossary.html"), gHtml);

  // Preview index — one link per rendered page in the natural sort order.
  const allPages = readdirSync(distHtml)
    .filter((f) => f.endsWith(".html") && f !== "index.html")
    .sort();
  const index = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>UPCJ Starter Kit — Preview</title>
<link rel="stylesheet" href="kit.css"></head>
<body><main style="max-width:210mm;margin:20mm auto;padding:0 20mm">
<h1>UPCJ Starter Kit — HTML preview</h1>
<p class="small">Version ${version}. ${allPages.length} pages.</p>
<ol>${allPages.map((p) => `<li><a href="${p}">${p.replace(/\.html$/, "")}</a></li>`).join("")}</ol>
</main></body></html>`;
  writeFileSync(join(distHtml, "index.html"), index);

  console.log(`Built ${pageNumber} pages`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
