import type { ValidationResult, ValidationError, SchemaName } from "./types.js";
import { SCHEMAS } from "./generated-spec.js";

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

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
const ajv = new AjvCtor({ allErrors: true, strict: false });
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
addFmt(ajv);

// Register every schema with ajv
for (const [name, schema] of Object.entries(SCHEMAS)) {
  void name; // key used only for iteration; $id is the canonical identifier
  const s = schema as { $id: string };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  ajv.addSchema(s, s.$id);
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
