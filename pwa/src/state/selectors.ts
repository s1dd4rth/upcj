/**
 * Pure view-model selectors.
 * All selectors are pure functions of (scenario, cursor).
 * No memoization, no React, no I/O.
 */

import { adapter } from "../engine-adapter";
import type { Claim, SLAStatus } from "../engine-adapter";
import type { Scenario } from "../scenarios/types";
import type { OwnerRole } from "../theme/owners";
import { OWNER_ROLES } from "../theme/owners";

import slasJson from "../data/slas.json";
import documentRegistryJson from "../data/document-registry.json";

// ---------------------------------------------------------------------------
// Actor → OwnerRole mapping
// ---------------------------------------------------------------------------

const ACTOR_TO_OWNER: Record<string, OwnerRole> = {
  Patient: "patient",
  Hospital: "hospital",
  Doctor: "hospital",    // IRDAI treats doctor as part of hospital party
  TPA: "tpa",
  Insurer: "insurer",
  ManagedCare: "tpa",
  Regulator: "regulator",
};

function actorToOwner(actorType: string): OwnerRole {
  const mapped = ACTOR_TO_OWNER[actorType];
  if (mapped !== undefined) return mapped;
  if (import.meta.env.DEV) {
    console.warn(`[selectors] Unknown actor type "${actorType}", falling back to "hospital"`);
  }
  return "hospital";
}

function pascalToOwner(actor: string): OwnerRole {
  return actorToOwner(actor);
}

// ---------------------------------------------------------------------------
// Static registry lookups
// ---------------------------------------------------------------------------

interface SlaRegistryEntry {
  id: string;
  actor: string;
  escalation: { action: string; target: string };
}

const SLA_MAP: Record<string, SlaRegistryEntry> = Object.fromEntries(
  (slasJson.slas as SlaRegistryEntry[]).map((s) => [s.id, s])
);

interface DocRegistryEntry {
  id: string;
  name: string;
  held_by: string;
  needed_at: string;
  notes?: string;
}

const DOC_MAP: Record<string, DocRegistryEntry> = Object.fromEntries(
  (documentRegistryJson.documents as DocRegistryEntry[]).map((d) => [d.id, d])
);

// Scenario 1 only surfaces DOC-001 through DOC-006
const SCENARIO_1_DOCS = ["DOC-001", "DOC-002", "DOC-003", "DOC-004", "DOC-005", "DOC-006"];

// ---------------------------------------------------------------------------
// Type exports
// ---------------------------------------------------------------------------

export type Archetype = "neutral" | "waiting" | "active" | "terminal";

export type SlaBucket = "comfortable" | "approaching" | "due-soon" | "breached";

export interface SlaClockVM {
  slaId: string;
  owner: OwnerRole;
  status: SlaBucket;
  rawState: SLAStatus["state"];
  startedAt: string | null;
  deadline: string | null;
  remedy?: string;
  nowIso: string;
}

export type DocStatus = "required" | "provided" | "verified" | "rejected";

export interface DocVM {
  docId: string;
  nameKey: string;
  status: DocStatus;
  responsible: OwnerRole;
  relevantAtStep: string;
  notes?: string;
}

export interface ActivityEntryVM {
  interactionId: string;
  actor: OwnerRole;
  atIso: string;
  eventName: string;
  plainTextKey: string;
}

export interface EngineTraceVM {
  eventApplied: { name: string; payload: Record<string, unknown> };
  statusBefore: Claim["status"];
  statusAfter: Claim["status"];
  newInteractionId: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the ISO timestamp to use as "now" for SLA evaluation.
 * Uses the NEXT step's timestamp (deterministic demo time).
 */
export function nowIsoFor(scenario: Scenario, cursor: number): string {
  if (cursor < scenario.steps.length) {
    return scenario.steps[cursor].at;
  }
  // Past end: use the last event's timestamp
  return scenario.steps[scenario.steps.length - 1].at;
}

// ---------------------------------------------------------------------------
// selectClaimAt
// ---------------------------------------------------------------------------

export function selectClaimAt(scenario: Scenario, cursor: number): Claim {
  const r = adapter.replay(scenario.seedClaim, scenario.steps.slice(0, cursor));
  if (!r.ok) {
    throw new Error(
      `[selectClaimAt] Engine replay failed at cursor ${cursor}: ${JSON.stringify(r.error)}`
    );
  }
  return r.claim;
}

// ---------------------------------------------------------------------------
// selectCurrentState
// ---------------------------------------------------------------------------

const TERMINAL_STATUSES = new Set<Claim["status"]>([
  "settled",
  "partially-settled",
  "rejected",
  "withdrawn",
  "closed-without-settlement",
]);

const WAITING_STATUSES = new Set<Claim["status"]>([
  "pre-auth-pending",
  "in-query",
  "in-adjudication",
]);

const ACTIVE_STATUSES = new Set<Claim["status"]>([
  "awaiting-patient-action",
]);

export function selectCurrentState(
  scenario: Scenario,
  cursor: number
): { status: Claim["status"]; archetype: Archetype } {
  const claim = selectClaimAt(scenario, cursor);
  const status = claim.status;

  let archetype: Archetype;
  if (TERMINAL_STATUSES.has(status)) {
    archetype = "terminal";
  } else if (WAITING_STATUSES.has(status)) {
    archetype = "waiting";
  } else if (ACTIVE_STATUSES.has(status)) {
    archetype = "active";
  } else {
    archetype = "neutral";
  }

  return { status, archetype };
}

// ---------------------------------------------------------------------------
// selectSlaClocks
// ---------------------------------------------------------------------------

function computeBucket(
  state: SLAStatus["state"],
  startedAt: string | null,
  deadline: string | null,
  nowIso: string
): SlaBucket {
  if (state === "breached") return "breached";

  // state === "active"
  if (!startedAt || !deadline) return "comfortable";

  const start = new Date(startedAt).getTime();
  const end = new Date(deadline).getTime();
  const now = new Date(nowIso).getTime();

  const total = end - start;
  if (total <= 0) return "due-soon";

  const elapsed = (now - start) / total;
  if (elapsed < 0.5) return "comfortable";
  if (elapsed < 0.8) return "approaching";
  return "due-soon";
}

export function selectSlaClocks(scenario: Scenario, cursor: number): SlaClockVM[] {
  const claim = selectClaimAt(scenario, cursor);
  const now = nowIsoFor(scenario, cursor);
  const all = adapter.evaluateSLAs(claim, now);

  return all
    .filter((s) => s.state === "active" || s.state === "breached")
    .map((s) => {
      const entry = SLA_MAP[s.id];
      const owner: OwnerRole = entry ? pascalToOwner(entry.actor) : "hospital";
      const bucket = computeBucket(s.state, s.startedAt, s.deadline, now);

      const vm: SlaClockVM = {
        slaId: s.id,
        owner,
        status: bucket,
        rawState: s.state,
        startedAt: s.startedAt,
        deadline: s.deadline,
        nowIso: now,
      };

      if (s.state === "breached" && entry?.escalation?.action) {
        vm.remedy = entry.escalation.action;
      }

      return vm;
    });
}

/**
 * Returns all SLAs including pending and completed.
 * Primary `selectSlaClocks` only returns active/breached.
 */
export function selectAllSlaClocks(scenario: Scenario, cursor: number): SlaClockVM[] {
  const claim = selectClaimAt(scenario, cursor);
  const now = nowIsoFor(scenario, cursor);
  const all = adapter.evaluateSLAs(claim, now);

  return all.map((s) => {
    const entry = SLA_MAP[s.id];
    const owner: OwnerRole = entry ? pascalToOwner(entry.actor) : "hospital";
    const bucket =
      s.state === "active" || s.state === "breached"
        ? computeBucket(s.state, s.startedAt, s.deadline, now)
        : ("comfortable" as SlaBucket);

    const vm: SlaClockVM = {
      slaId: s.id,
      owner,
      status: bucket,
      rawState: s.state,
      startedAt: s.startedAt,
      deadline: s.deadline,
      nowIso: now,
    };

    if (s.state === "breached" && entry?.escalation?.action) {
      vm.remedy = entry.escalation.action;
    }

    return vm;
  });
}

// ---------------------------------------------------------------------------
// selectDocChecklist
// ---------------------------------------------------------------------------

function extractDocIdFromPayload(payload: Record<string, unknown>): string | null {
  if (typeof payload["documentId"] === "string") {
    return payload["documentId"] as string;
  }
  return null;
}

function heldByToOwner(heldBy: string): OwnerRole {
  // held_by can be compound like "Patient / Hospital", "Hospital / TPA"
  // Split and use the first known role
  const parts = heldBy.split(/\s*[/,]\s*/);
  for (const part of parts) {
    const trimmed = part.trim();
    const role = ACTOR_TO_OWNER[trimmed];
    if (role !== undefined && (OWNER_ROLES as readonly string[]).includes(role)) {
      return role;
    }
    // Direct lowercase match
    const lower = trimmed.toLowerCase() as OwnerRole;
    if ((OWNER_ROLES as readonly string[]).includes(lower)) {
      return lower;
    }
  }
  return "hospital";
}

export function selectDocChecklist(scenario: Scenario, cursor: number): DocVM[] {
  const claim = selectClaimAt(scenario, cursor);
  const interactions = claim.interactions ?? [];

  // Build a set of docId prefixes that appear in interaction payloads
  const providedPrefixes = new Set<string>();
  for (const interaction of interactions) {
    const docId = extractDocIdFromPayload(interaction.payload);
    if (docId) {
      // A payload like "DOC-005-A" should match registry entry "DOC-005"
      const match = docId.match(/^(DOC-\d+)/);
      if (match) {
        providedPrefixes.add(match[1]);
      }
    }
  }

  return SCENARIO_1_DOCS.map((docId) => {
    const entry = DOC_MAP[docId];
    if (!entry) {
      throw new Error(`[selectDocChecklist] Unknown docId ${docId} in registry`);
    }

    const isProvided = providedPrefixes.has(docId);
    // v1: provided === verified (no richer doc-state engine yet)
    const status: DocStatus = isProvided ? "provided" : "required";

    return {
      docId,
      nameKey: entry.name,
      status,
      responsible: heldByToOwner(entry.held_by),
      relevantAtStep: entry.needed_at,
      notes: entry.notes ?? undefined,
    };
  });
}

// ---------------------------------------------------------------------------
// selectActivityFeed
// ---------------------------------------------------------------------------

export function selectActivityFeed(scenario: Scenario, cursor: number): ActivityEntryVM[] {
  const claim = selectClaimAt(scenario, cursor);
  const interactions = claim.interactions ?? [];

  return interactions.map((interaction) => ({
    interactionId: interaction.id,
    actor: actorToOwner(interaction.initiatingActor.type),
    atIso: interaction.timestamp,
    eventName: interaction.eventName,
    plainTextKey: `activity.${interaction.eventName}`,
  }));
}

// ---------------------------------------------------------------------------
// selectEngineTrace
// ---------------------------------------------------------------------------

export function selectEngineTrace(scenario: Scenario, cursor: number): EngineTraceVM | null {
  if (cursor === 0) return null;

  const beforeResult = adapter.replay(
    scenario.seedClaim,
    scenario.steps.slice(0, cursor - 1)
  );
  if (!beforeResult.ok) {
    throw new Error(
      `[selectEngineTrace] Engine replay (before) failed at cursor ${cursor - 1}: ${JSON.stringify(beforeResult.error)}`
    );
  }

  const afterResult = adapter.replay(
    scenario.seedClaim,
    scenario.steps.slice(0, cursor)
  );
  if (!afterResult.ok) {
    throw new Error(
      `[selectEngineTrace] Engine replay (after) failed at cursor ${cursor}: ${JSON.stringify(afterResult.error)}`
    );
  }

  const step = scenario.steps[cursor - 1];
  const afterInteractions = afterResult.claim.interactions ?? [];
  const lastInteraction = afterInteractions[afterInteractions.length - 1];

  return {
    eventApplied: { name: step.name, payload: step.payload },
    statusBefore: beforeResult.claim.status,
    statusAfter: afterResult.claim.status,
    newInteractionId: lastInteraction?.id ?? "",
  };
}
