import { SPEC_HASH } from "./spec-hash.js";

export { validate } from "./validate.js";
export { advance } from "./advance.js";
export { replay } from "./replay.js";
export { evaluateSLAs } from "./sla.js";

export function getSpecHash(): string {
  return SPEC_HASH;
}

export type {
  Claim, Event, Interaction, Query, Grievance, DocumentInstance, Deduction,
  ActorReference, ActorType, AdmissionType, ClaimPath, ClaimStatus, StepId,
  ValidationResult, ValidationError, AdvanceResult, AdvanceError,
  ReplayResult, SLAStatus, SchemaName
} from "./types.js";
