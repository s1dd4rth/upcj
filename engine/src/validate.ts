import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { ValidationResult, ValidationError, SchemaName } from "./types.js";

// Use dynamic require-style import to sidestep ESM default-export ambiguity with ajv.
// `esModuleInterop: true` + `strict: false` (on ajv types) means we cast as any once.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ajvMod: any = await import("ajv/dist/2020.js");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fmtMod: any = await import("ajv-formats");

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const AjvCtor = ajvMod.default ?? ajvMod;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const addFmt = fmtMod.default ?? fmtMod;

const __dirname = dirname(fileURLToPath(import.meta.url));

// Locate spec/schemas. Two valid layouts:
// - engine/dist/spec/schemas/  (post-bundle, used in npm package)
// - engine/../spec/schemas/    (dev/test, before bundle)
const candidatePaths = [
  join(__dirname, "spec", "schemas"),
  join(__dirname, "..", "..", "spec", "schemas")
];

function safeReaddir(p: string): boolean {
  try { readdirSync(p); return true; } catch { return false; }
}

const SCHEMA_DIR = candidatePaths.find(safeReaddir);
if (!SCHEMA_DIR) {
  throw new Error(
    `validate: cannot locate spec/schemas. Searched: ${candidatePaths.join(", ")}`
  );
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
const ajv = new AjvCtor({ allErrors: true, strict: false });
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
addFmt(ajv);

// Load all schemas from SCHEMA_DIR
for (const file of readdirSync(SCHEMA_DIR)) {
  if (!file.endsWith(".schema.json")) continue;
  const filePath = join(SCHEMA_DIR, file);
  const schema = JSON.parse(readFileSync(filePath, "utf8")) as { $id: string };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  ajv.addSchema(schema, schema.$id);
}

const KNOWN: SchemaName[] = [
  "claim", "document", "document-instance", "deduction",
  "step", "sla", "interaction", "query", "grievance",
  "lifecycle", "events", "coverage"
];

// Pre-compile all known schemas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const schemas: Record<string, any> = {};
for (const name of KNOWN) {
  const $id = `https://upcj.org/spec/v1/schemas/${name}.schema.json`;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const compiled = ajv.getSchema($id);
  if (!compiled) throw new Error(`validate: missing schema ${$id}`);
  schemas[name] = compiled;
}

export function validate(obj: unknown, schemaName: string): ValidationResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const fn = schemas[schemaName];
  if (!fn) throw new Error(`validate: unknown schema "${schemaName}"`);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  if (fn(obj)) return { ok: true };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const errors: ValidationError[] = ((fn.errors ?? []) as Array<{ instancePath: string; message?: string; schemaPath: string }>).map((e) => ({
    path:       e.instancePath || "/",
    message:    e.message ?? "validation failed",
    schemaPath: e.schemaPath
  }));
  return { ok: false, errors };
}
