import { test } from "node:test";
import assert from "node:assert/strict";
import { loadDocumentRegistry, loadSteps, renderGuidePage, loadTemplates, fieldInputType, renderTemplatePage } from "./build.mjs";

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

test("renderGuidePage embeds title, lede, script, and next-step pointer", () => {
  const templates = loadTemplates();
  const step = {
    id: "1.1", title: "OPD Consultation", phase: 1, path: "common",
    lede: "You visit a doctor for the first time.",
    whatHappens: ["The doctor examines you."],
    sayThis: "Please write my diagnosis.",
    criticalFieldsDocId: "DOC-003",
    checkFor: ["Patient name", "Date"]
  };
  const next = { id: "1.2", title: "Diagnostics" };
  const html = renderGuidePage({
    step, nextStep: next, templates,
    context: { version: "1.0.0-dev", totalPages: 37, pageNumber: 5 }
  });
  assert.match(html, /OPD Consultation/);
  assert.match(html, /You visit a doctor/);
  assert.match(html, /<q>Please write my diagnosis[^<]*<\/q>/);
  assert.match(html, /DOC-003/);
  assert.match(html, /Next:.*1\.2/s);
});

test("fieldInputType maps known labels to HTML input types", () => {
  assert.equal(fieldInputType("Date of admission").type, "text");
  assert.equal(fieldInputType("Date of admission").hint, "DD-MM-YYYY");
  assert.equal(fieldInputType("TPA helpline").type, "tel");
  assert.equal(fieldInputType("Patient name").autocomplete, "name");
  assert.equal(fieldInputType("Diagnosis (ICD-10)").multiline, true);
});

test("renderTemplatePage emits one input per critical field and a stamp box", () => {
  const templates = loadTemplates();
  const doc = {
    id: "DOC-001",
    name: "Insurance Policy Card",
    generated_by: "Insurer",
    critical_fields: ["Policy number", "TPA helpline", "Sum insured"]
  };
  const html = renderTemplatePage({
    document: doc, templates,
    context: { version: "1.0.0-dev", totalPages: 37, pageNumber: 20 }
  });
  const inputMatches = html.match(/class="field__input"/g) ?? [];
  assert.equal(inputMatches.length, 3);
  assert.match(html, /stamp-box/);
  assert.match(html, /Hospital stamp/);
  assert.match(html, /All fields are mandatory/);
});
