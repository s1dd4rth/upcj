import { test } from "node:test";
import assert from "node:assert/strict";
import { loadDocumentRegistry, loadSteps } from "./build.mjs";

test("loadDocumentRegistry returns all 15 documents", () => {
  const docs = loadDocumentRegistry();
  assert.equal(docs.length, 15);
  assert.equal(docs[0].id, "DOC-001");
  assert.equal(docs[14].id, "DOC-015");
});

test("loadDocumentRegistry throws if a document has empty critical_fields", () => {
  assert.throws(
    () => loadDocumentRegistry({ fixture: "fixtures/empty-critical.json" }),
    /critical_fields/
  );
});

test("loadSteps parses front-matter and body from every step file", () => {
  const steps = loadSteps();
  const step = steps.find((s) => s.id === "1.1");
  assert.ok(step, "step 1.1 must exist");
  assert.ok(step.title, "step must have title from front-matter");
  assert.ok(step.bodyHtml.length > 0, "body must be rendered");
});
