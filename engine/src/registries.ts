import { Lifecycle } from "./lifecycle.js";
import { validate } from "./validate.js";
import { LIFECYCLES, REGISTRIES } from "./generated-spec.js";

function ensureValid(data: unknown, schemaName: string, label: string): unknown {
  const result = validate(data, schemaName);
  if (!result.ok) {
    throw new Error(`registries: ${label} fails ${schemaName} validation: ${JSON.stringify(result.errors)}`);
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

export const SLAS: SLAEntry[] = (ensureValid(REGISTRIES["slas"], "sla", "registries/slas.json") as { slas: SLAEntry[] }).slas;
export const EVENTS: Record<string, EventDef> = (ensureValid(REGISTRIES["events"], "events", "registries/events.json") as { events: Record<string, EventDef> }).events;
export const STEP_SLA_MAP: Record<string, string[]> = REGISTRIES["step-sla-map"] as unknown as Record<string, string[]>;

export const CLAIM_LIFECYCLE: Lifecycle = new Lifecycle(ensureValid(LIFECYCLES["claim"], "lifecycle", "lifecycles/claim.lifecycle.json") as ConstructorParameters<typeof Lifecycle>[0]);
export const DOCUMENT_LIFECYCLE: Lifecycle = new Lifecycle(ensureValid(LIFECYCLES["document"], "lifecycle", "lifecycles/document.lifecycle.json") as ConstructorParameters<typeof Lifecycle>[0]);
export const QUERY_LIFECYCLE: Lifecycle = new Lifecycle(ensureValid(LIFECYCLES["query"], "lifecycle", "lifecycles/query.lifecycle.json") as ConstructorParameters<typeof Lifecycle>[0]);
