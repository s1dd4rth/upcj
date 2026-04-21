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
    const { data, content } = matter(raw);
    return { id, ...data, bodyHtml: marked.parse(content) };
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
      const { data, content } = matter(raw);
      return [id, { id, ...data, bodyHtml: marked.parse(content) }];
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

async function main() {
  const distHtml = join(__dirname, "dist", "html");
  rmSync(join(__dirname, "dist"), { recursive: true, force: true });
  mkdirSync(distHtml, { recursive: true });

  // Copy kit.css into dist so preview and PDF stages share one asset.
  const css = readFileSync(join(__dirname, "templates", "kit.css"), "utf8");
  writeFileSync(join(distHtml, "kit.css"), css);

  const documents = loadDocumentRegistry();
  const steps = loadSteps();
  const matterPages = loadMatter();
  const templates = loadTemplates();
  const version = loadVersion();

  console.log(`upcj-starter-kit v${version}`);
  console.log(`  ${documents.length} documents, ${steps.length} steps, ${Object.keys(matterPages).length} matter pages`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
