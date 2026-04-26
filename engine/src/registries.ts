import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Lifecycle } from "./lifecycle.js";
import { validate } from "./validate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const candidatePaths = [
  join(__dirname, "spec"),
  join(__dirname, "..", "..", "spec")
];

function safeReaddir(p: string): boolean {
  try { readdirSync(p); return true; } catch { return false; }
}

const SPEC_DIR = candidatePaths.find(safeReaddir);
if (!SPEC_DIR) {
  throw new Error(
    `registries: cannot locate spec/. Searched: ${candidatePaths.join(", ")}`
  );
}

function loadJSON(rel: string): unknown {
  return JSON.parse(readFileSync(join(SPEC_DIR!, rel), "utf8"));
}

function loadAndValidate(rel: string, schemaName: string): unknown {
  const data = loadJSON(rel);
  const result = validate(data, schemaName);
  if (!result.ok) {
    throw new Error(
      `registries: ${rel} fails ${schemaName} validation: ${JSON.stringify(result.errors)}`
    );
  }
  return data;
}

export type SLAEntry = {
  id: string;
  step: string;
  actor: string;
  duration?: string;
  durationByAdmissionType?: { emergency: string; planned: string };
  startsOn: string[];
  endsOn: string[];
  escalation: { action: string; target: string };
};

export type EventDef = {
  payload: object;
  produces: "Interaction" | "Document" | "Query" | "Grievance";
};

export const SLAS: SLAEntry[] = (loadAndValidate("registries/slas.json", "sla") as { slas: SLAEntry[] }).slas;
export const EVENTS: Record<string, EventDef> = (loadAndValidate("registries/events.json", "events") as { events: Record<string, EventDef> }).events;
export const STEP_SLA_MAP: Record<string, string[]> = loadJSON("registries/step-sla-map.json") as Record<string, string[]>;

export const CLAIM_LIFECYCLE: Lifecycle = new Lifecycle(loadAndValidate("lifecycles/claim.lifecycle.json", "lifecycle") as ConstructorParameters<typeof Lifecycle>[0]);
export const DOCUMENT_LIFECYCLE: Lifecycle = new Lifecycle(loadAndValidate("lifecycles/document.lifecycle.json", "lifecycle") as ConstructorParameters<typeof Lifecycle>[0]);
export const QUERY_LIFECYCLE: Lifecycle = new Lifecycle(loadAndValidate("lifecycles/query.lifecycle.json", "lifecycle") as ConstructorParameters<typeof Lifecycle>[0]);
