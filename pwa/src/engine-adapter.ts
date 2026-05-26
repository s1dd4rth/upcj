import {
  validate as _validate,
  advance as _advance,
  replay as _replay,
  evaluateSLAs as _evaluateSLAs,
  getSpecHash,
} from "@upcj/engine";
import type {
  Claim,
  Event,
  ValidationResult,
  AdvanceResult,
  ReplayResult,
  SLAStatus,
} from "@upcj/engine";

// NOTE: this is the ONLY module in the app that imports @upcj/engine.
// Everything else must go through `adapter`.

// Engine version — hardcoded to match @upcj/engine@1.0.0.
// Should be read from @upcj/engine/package.json; hardcoded here because
// JSON imports from node_modules paths require "resolveJsonModule" + extra
// bundler config that isn't set up for this workspace.
export const ENGINE_VERSION = "1.0.0";

function makeExampleSeedClaim(): Claim {
  // Minimal valid Claim shape — mirrors spec/conformance/001-intimation.json
  return {
    id: "CLM-DEMO-SEED",
    specVersion: "v1",
    status: "pre-admission",
    path: "undecided",
    admissionType: "planned",
    patientId: "PAT-1",
    policyId: "POL-001",
    hospitalId: "HOS-1",
    tpaId: "TPA-1",
    insurerId: "INS-1",
    interactions: [],
  } as Claim;
}

export const adapter = {
  specHash: (): string => getSpecHash(),
  validate: (claim: Claim): ValidationResult => _validate(claim, "claim"),
  advance: (claim: Claim, event: Event): AdvanceResult => _advance(claim, event),
  replay: (seed: Claim, events: Event[]): ReplayResult => _replay(seed, events),
  evaluateSLAs: (claim: Claim, asOf: string): SLAStatus[] =>
    _evaluateSLAs(claim, { now: asOf }),
  exampleSeedClaim: makeExampleSeedClaim,
};

export type {
  Claim,
  ClaimStatus,
  Event,
  ValidationResult,
  ValidationError,
  AdvanceResult,
  ReplayResult,
  SLAStatus,
} from "@upcj/engine";
