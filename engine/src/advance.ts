import { createHash } from "node:crypto";
import { validate } from "./validate.js";
import { canonicalJson } from "./canonical-json.js";
import { CLAIM_LIFECYCLE, EVENTS, SLAS } from "./registries.js";
import type {
  Claim, Event, Interaction, AdvanceResult, ValidationError, StepId, ClaimStatus
} from "./types.js";

// Inline ajv instance for per-event payload validation. Use the same dynamic
// import + default-unwrap pattern as validate.ts (ajv default export ambiguity
// under nodenext + ESM).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ajvMod: any = await import("ajv/dist/2020.js");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fmtMod: any = await import("ajv-formats");
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const AjvCtor = ajvMod.default ?? ajvMod;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const addFmt = fmtMod.default ?? fmtMod;
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
const _ajv = new AjvCtor({ allErrors: true, strict: false });
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
addFmt(_ajv);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _payloadCache = new WeakMap<object, any>();

export function advance(claim: Claim, event: Event): AdvanceResult {
  // 1. Spec-version check
  if (claim.specVersion !== "v1") {
    return { ok: false, error: { kind: "spec-version-mismatch", expected: "v1", actual: String(claim.specVersion) } };
  }

  // 2. Validate input claim
  const claimResult = validate(claim, "claim");
  if (!claimResult.ok) {
    return { ok: false, error: { kind: "claim-invalid", errors: claimResult.errors } };
  }

  // 3. Look up event
  const eventDef = EVENTS[event.name];
  if (!eventDef) {
    return { ok: false, error: { kind: "event-unknown", eventName: event.name } };
  }

  // 4. Validate payload
  const payloadResult = validatePayload(event.payload, eventDef.payload);
  if (!payloadResult.ok) {
    return { ok: false, error: { kind: "payload-invalid", eventName: event.name, errors: payloadResult.errors } };
  }

  // 5. Lifecycle transition
  const transition = CLAIM_LIFECYCLE.nextState(claim.status, event.name);
  if (!transition) {
    return { ok: false, error: { kind: "transition-illegal", currentState: claim.status, eventName: event.name } };
  }

  // 6+7. Build Interaction
  const interactionId = computeInteractionId(claim, event);
  const newInteraction: Interaction = {
    id: interactionId,
    claimRef: claim.id,
    timestamp: event.at,
    eventName: event.name,
    initiatingActor: event.actor,
    respondingActor: null,
    nature: eventDef.produces,
    payload: event.payload,
    linkedSLAs: SLAS.filter(s => s.startsOn.includes(event.name)).map(s => s.id),
    ...(isOutOfOrder(claim, event) ? { outOfOrder: true } : {})
  };

  // 8. Build new claim
  const newClaim: Claim = {
    ...claim,
    status: transition.target as ClaimStatus,
    currentStep: (transition.meta.step as StepId | undefined) ?? claim.currentStep,
    interactions: [...(claim.interactions ?? []), newInteraction]
  };

  // 9. Re-validate
  const recheck = validate(newClaim, "claim");
  if (!recheck.ok) {
    return { ok: false, error: { kind: "claim-invalid", errors: recheck.errors } };
  }

  // 10. Return
  return { ok: true, claim: newClaim, interactions: [newInteraction] };
}

function computeInteractionId(claim: Claim, event: Event): string {
  const seq = (claim.interactions ?? []).length;
  const input = `${claim.id}|${seq}|${event.at}|${event.name}|${canonicalJson(event.payload)}`;
  const hash = createHash("sha256").update(input).digest("hex");
  return `INT-${hash.slice(0, 16).toUpperCase()}`;
}

function isOutOfOrder(claim: Claim, event: Event): boolean {
  const interactions = claim.interactions ?? [];
  const last = interactions[interactions.length - 1];
  return last ? Date.parse(event.at) < Date.parse(last.timestamp) : false;
}

function validatePayload(
  payload: Record<string, unknown>,
  schema: object
): { ok: true } | { ok: false; errors: ValidationError[] } {
  let fn = _payloadCache.get(schema);
  if (!fn) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    fn = _ajv.compile(schema);
    _payloadCache.set(schema, fn);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  if (fn(payload)) return { ok: true };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
  const errors: ValidationError[] = ((fn.errors ?? []) as Array<{ instancePath: string; message?: string; schemaPath: string }>).map((e) => ({
    path: e.instancePath || "/",
    message: e.message ?? "validation failed",
    schemaPath: e.schemaPath
  }));
  return { ok: false, errors };
}
