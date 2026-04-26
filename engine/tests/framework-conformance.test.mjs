import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validate } from "../dist/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRAMEWORK = join(__dirname, "..", "..", "framework");

test("framework/document-registry.json: all entries pass document.schema.json", () => {
  const reg = JSON.parse(readFileSync(join(FRAMEWORK, "document-registry.json"), "utf8"));
  for (const doc of reg.documents) {
    const r = validate(doc, "document");
    assert.equal(r.ok, true, `${doc.id}: ${JSON.stringify(r.errors)}`);
  }
});

test("framework/ownership-matrix.json: all step entries pass step.schema.json", () => {
  const reg = JSON.parse(readFileSync(join(FRAMEWORK, "ownership-matrix.json"), "utf8"));
  for (const step of reg.steps) {
    const r = validate(step, "step");
    assert.equal(r.ok, true, `${step.id}: ${JSON.stringify(r.errors)}`);
  }
});
