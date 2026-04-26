// Public type definitions. Initial subset; expanded in Task 9.

export type ValidationError = {
  path: string;
  message: string;
  schemaPath: string;
};

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: ValidationError[] };

export type SchemaName =
  | "claim" | "document" | "document-instance" | "deduction"
  | "step" | "sla" | "interaction" | "query" | "grievance"
  | "lifecycle" | "events" | "coverage";
