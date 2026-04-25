# UPCJ Core Ontology and Reference Engine — Design Spec

**Status:** Draft for approval
**Date:** 2026-04-26
**Target:** UPCJ roadmap item "Machine-readable framework + reference engine" — turns the existing prose data model into a language-neutral spec that any application or AI agent can consume and operate on.
**License:** CC BY-SA 4.0 (inherited)

## 1. Purpose

The framework today is human-canonical: `framework/data-analysis.md` defines 14 objects with attributes and relationships, `framework/document-registry.json` and `framework/ownership-matrix.json` carry the structured registries, `framework/governance-model.md` holds the SLA table. Adopters must read prose and reimplement the rules in their own systems. Two TPAs adopting UPCJ today could legitimately disagree about whether a given claim has breached an SLA.

This spec adds a **machine-canonical layer** alongside the existing human one. The machine layer is JSON: schemas for each object, declarative state machines for objects with lifecycles, registries for SLAs and events, and conformance fixtures that any UPCJ-compliant engine must pass. A reference TypeScript engine ships as `@upcj/engine` to demonstrate correctness — but the spec is the contract; the engine is one implementation of it.

A single shared spec serves four audiences without forking:
- **Hospital, TPA, and insurer engineering teams** — embed the schemas and state machines in their EMR, claims, and adjudication systems and produce identical answers as every other adopter.
- **Patient app builders** — `npm install @upcj/engine`, get correct claim/SLA/CIP behaviour out of the box.
- **AI agents and LLM tools** — query the schemas and lifecycles to reason about a patient's claim state, suggest next actions, and flag SLA breaches.
- **Regulators and policy writers** — reference object types and SLA IDs in circulars (`Every TPA must ensure SLA-pre-auth-response is met`) and verify compliance via the conformance harness.

## 2. Scope

**In v1 (lean+):**
- **JSON Schemas** (draft 2020-12) for seven objects: `Claim`, `Document`, `Step`, `SLA`, `Interaction`, `Query`, and a **minimal `Grievance`** (data-only — id, claimRef, raisedAt, level, status, raisedAgainst). The full Grievance lifecycle is deferred to v1.1, but the minimal schema lets a v1 engine record that a breach-driven escalation happened (closing the audit-trail loop).
- **Lifecycle state machines** for the three stateful objects: `Claim`, `Document`, `Query`. Grievance has no lifecycle in v1.
- **Machine-readable registries**: `slas.json` (the 10 SLAs with ISO 8601 durations), `events.json` (every event the engine accepts, with typed payloads), `step-sla-map.json` (which SLAs apply at which step).
- **Reference engine** (`@upcj/engine`) — four pure functions: `validate`, `advance`, `replay`, `evaluateSLAs`. Pure functions, no system-clock reads, no global state.
- **Conformance fixtures** as language-neutral contract: ≥25 input/event/expected-output triples in `spec/conformance/`, plus a `coverage.json` declaring what the fixture set must collectively prove.
- **CI workflow** (`core.yml`) that runs unit tests, conformance tests, framework-JSON validation, and publishes the npm package on a `core-v*` tag.
- The spec validates the existing `framework/document-registry.json` and `framework/ownership-matrix.json` without moving them — additive, not migrating.

**Out of scope for v1** (deferred):
- **Grievance lifecycle** — full state machine (level 1 → 2 → 3 escalation, acknowledgement-SLA + resolution-SLA, evidence aggregation from CIP) deferred to v1.1. v1 ships the minimal schema only, so breach-driven escalations have a typed object to land on.
- **Full actor schemas** (Patient, Doctor, Hospital, Managed Care, TPA, Insurer beyond minimal references). Actor objects are mostly attribute bags with limited behaviour; v1.1 adds them as schemas.
- **Policy lifecycle** — Policy is referenced as an ID in v1; full schema + coverage rules in v1.1.
- **Eligibility / rules engine** — `is hospital in network`, `is diagnosis in exclusion list`. These are policy-derived predicates, structurally different from claim-state transitions; they belong in a separate `spec/rules/` tree, not in lifecycles. v1.2.
- **Business-hour / holiday calendar** for SLA computation. v1 uses pure calendar arithmetic, matching IRDAI's wording.
- **FHIR / HL7 / SNOMED alignment.** v1 establishes the UPCJ ontology in its own namespace; cross-ontology mappings are a separate body of work.
- **State-machine guards / inline expressions.** v1 lifecycles are pure data — every branch is a distinct event name. Conditional dispatch happens upstream of the engine.

## 3. Success criteria

- Two engines (one in TypeScript, one ported to any other language) running the same conformance fixtures produce byte-identical claim states, interactions, and SLA statuses.
- Any modification to `spec/registries/events.json`, `spec/lifecycles/*.json`, or `spec/registries/slas.json` without a corresponding fixture update fails CI.
- A claim ID + the full interaction history is sufficient to reconstruct the claim's current state and SLA picture deterministically (replay produces the same output as the live computation).
- The existing `framework/document-registry.json` and `framework/ownership-matrix.json` validate against `spec/schemas/document.schema.json` and `spec/schemas/step.schema.json` respectively, with zero changes to those files.
- The bundled `dist/spec/` inside the published `@upcj/engine` package is provably identical to the canonical `spec/` directory at the publish commit (CI fails on mismatch). `engine.getSpecHash()` returns the sha-256 fingerprint at runtime; consumers can verify they're not running against a stale spec.
- A `Claim` object carries `specVersion: "v1"`. Cross-system imports that reference an unsupported spec version are rejected with a clear error, not silently accepted.

## 4. Benchmarks and standards alignment

### 4.1 JSON Schema draft 2020-12

All object schemas are JSON Schema draft 2020-12 — the current stable draft, supported by ajv ≥ 8 (Node), jsonschema (Python), gojsonschema (Go), and equivalents in every major language. `$id` URLs are absolute (`https://upcj.org/spec/v1/schemas/claim.schema.json`); `$ref` resolves to absolute or relative paths depending on the loader.

### 4.2 ISO 8601 — durations, timestamps, intervals

Every duration is ISO 8601 (`PT2H`, `PT4H`, `P30D`). Every timestamp is an ISO 8601 date-time with timezone (`2026-04-26T13:00:00+05:30`). The engine refuses any timestamp without a TZ. Calendar arithmetic only — `P30D` = exactly 30 × 24 wall-clock hours. No business-hour adjustments in v1.

### 4.3 IRDAI deadline conventions

The 10 SLAs in `spec/registries/slas.json` mirror the deadlines listed in `framework/governance-model.md`, which derive from IRDAI Health Insurance Regulations. Where IRDAI says "30 days from claim submission", the spec says `"duration": "P30D", "startsOn": "claim-form-submitted"`. One-to-one correspondence between regulatory text and machine spec is the design intent — auditors should be able to grep both.

### 4.4 OOUX / ORCA alignment

The objects in `spec/schemas/` are exactly the objects identified in the OOUX ORCA process documented in `framework/data-analysis.md`. Schemas formalize attributes; lifecycles formalize the implicit state transitions in the prose; registries formalize the tables. No new objects; no rebranding.

## 5. Architecture

### 5.1 File layout

```
spec/                           # Machine-canonical UPCJ spec (JSON, language-neutral)
├── README.md                    # What this dir is, how to read the schemas, how to validate
├── schemas/                     # JSON Schema draft 2020-12 for every object
│   ├── claim.schema.json
│   ├── document.schema.json     # Validates entries in framework/document-registry.json
│   ├── step.schema.json         # Validates entries in framework/ownership-matrix.json
│   ├── sla.schema.json
│   ├── interaction.schema.json
│   ├── query.schema.json
│   ├── lifecycle.schema.json    # Meta-schema for spec/lifecycles/*.json
│   ├── events.schema.json       # Meta-schema for spec/registries/events.json
│   └── coverage.schema.json     # Meta-schema for spec/conformance/coverage.json
├── lifecycles/                  # JSON state machines (one per stateful object)
│   ├── claim.lifecycle.json
│   ├── document.lifecycle.json
│   └── query.lifecycle.json
├── registries/                  # Machine-readable registries
│   ├── slas.json                # The 10 SLAs, with ISO 8601 durations
│   ├── step-sla-map.json        # Which SLAs apply at which step
│   └── events.json              # Catalog of events with typed payloads
└── conformance/                 # input → event → expected-output triples
    ├── coverage.json            # What the fixture set must collectively prove
    ├── 001-claim-intimation.json
    ├── 002-pre-auth-filed.json
    └── …                        # one file per scenario, ≥25 in v1

engine/                         # Reference TypeScript implementation
├── package.json                 # @upcj/engine, type: module, Node ≥20
├── src/
│   ├── validate.ts              # validate(obj, schemaName) → ValidationResult
│   ├── advance.ts               # advance(claim, event) → AdvanceResult
│   ├── sla.ts                   # evaluateSLAs(claim, {now}) → SLAStatus[]
│   ├── lifecycle.ts             # Tiny interpreter for spec/lifecycles/*.json
│   ├── duration.ts              # ISO 8601 duration parser + adder
│   ├── registries.ts            # Loads spec/registries/* on import
│   ├── types.ts                 # Public type definitions
│   └── index.ts                 # Public API surface
├── tests/
│   ├── unit.test.mjs            # Engine internals (lifecycle interp, SLA math, errors)
│   ├── conformance.test.mjs     # Walks spec/conformance/, runs each triple
│   └── framework-conformance.test.mjs  # framework/*.json validates against spec/schemas/
├── scripts/
│   └── bundle-spec.mjs          # Copies spec/ → dist/spec/ for npm package
└── README.md

framework/                      # UNCHANGED (human-canonical)
├── data-analysis.md             # Stays as the prose ontology
├── governance-model.md          # Stays as the prose SLA + grievance reference
├── document-registry.json       # Now subject to spec/schemas/document.schema.json
└── ownership-matrix.json        # Subject to spec/schemas/step.schema.json

starter-kit/                    # UNCHANGED (still reads framework/)

.github/workflows/
└── core.yml                     # Build + test + conformance + tagged release
```

Three top-level concerns added; `framework/` and `starter-kit/` untouched.

### 5.2 Responsibilities and isolation

- **`spec/`** is language-neutral. Anyone (Python, Go, Java, Rust shop) reads these JSONs and can reimplement the engine. Conformance fixtures define the contract.
- **`engine/`** is TypeScript. Adopters running JS/TS install `@upcj/engine` from npm and get correct behaviour. Adopters in other languages reimplement and run the same conformance fixtures.
- **`framework/`** is human-canonical prose plus the original registries. Now backed by schemas in `spec/schemas/`.

The dependency direction is one-way: `engine/` reads `spec/` at runtime. `engine/` writes nothing to `spec/`. `spec/` knows nothing about `engine/`. This isolation is what lets non-JS adopters skip `engine/` entirely.

## 6. Spec format

### 6.1 Schemas (`spec/schemas/*.schema.json`)

Standard JSON Schema draft 2020-12. Each schema has an absolute `$id` URL. Cross-references via `$ref`. Excerpt of `claim.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://upcj.org/spec/v1/schemas/claim.schema.json",
  "title": "Claim",
  "type": "object",
  "required": ["id", "specVersion", "status", "path", "admissionType", "patientId", "policyId"],
  "properties": {
    "id": { "type": "string", "pattern": "^CLM-[A-Z0-9-]+$" },
    "specVersion": { "const": "v1" },
    "status": {
      "enum": ["pre-admission", "intimated", "admission-advised",
               "in-treatment-cashless", "in-treatment-reimbursement",
               "pre-auth-pending", "discharged", "in-adjudication",
               "in-query", "awaiting-patient-action",
               "settled", "partially-settled",
               "withdrawn", "closed-without-settlement", "rejected"]
    },
    "path": { "enum": ["undecided", "cashless", "reimbursement"] },
    "admissionType": { "enum": ["planned", "emergency"] },
    "currentStep": {
      "enum": ["1.1", "1.2", "1.3",
               "A.1", "A.2", "A.3", "A.4", "A.5",
               "B.1", "B.2", "B.3", "B.4", "B.5",
               "3.1", "3.2", "3.3", "3.4"]
    },
    "intimationDate": { "type": "string", "format": "date-time" },
    "admissionDate":  { "type": "string", "format": "date-time" },
    "dischargeDate":  { "type": "string", "format": "date-time" },
    "amounts": {
      "type": "object",
      "properties": {
        "claimed":  { "type": "number", "minimum": 0 },
        "approved": { "type": "number", "minimum": 0 },
        "settled":  { "type": "number", "minimum": 0 }
      }
    },
    "patientId":  { "type": "string" },
    "policyId":   { "type": "string" },
    "hospitalId": { "type": "string" },
    "doctorId":   { "type": "string" },
    "tpaId":      { "type": "string" },
    "insurerId":  { "type": "string" },
    "documents":     { "type": "array", "items": { "$ref": "document-instance.schema.json" } },
    "interactions":  { "type": "array", "items": { "$ref": "interaction.schema.json" } },
    "queries":       { "type": "array", "items": { "$ref": "query.schema.json" } },
    "grievances":    { "type": "array", "items": { "$ref": "grievance.schema.json" } }
  }
}
```

ID convention: prefixed (`CLM-`, `DOC-`, `INT-`, `SLA-`, `QRY-`, `GRV-`) for grep-ability and disambiguation in human-read logs.

A minimal `grievance.schema.json` ships in v1 (the full lifecycle is deferred to v1.1):

```json
{
  "$id": "https://upcj.org/spec/v1/schemas/grievance.schema.json",
  "type": "object",
  "required": ["id", "claimRef", "raisedAt", "level", "status", "raisedAgainst"],
  "properties": {
    "id":            { "type": "string", "pattern": "^GRV-[A-Z0-9-]+$" },
    "claimRef":      { "type": "string", "pattern": "^CLM-[A-Z0-9-]+$" },
    "raisedAt":      { "type": "string", "format": "date-time" },
    "level":         { "enum": [1, 2, 3] },
    "status":        { "enum": ["open", "acknowledged", "resolved", "escalated"] },
    "raisedAgainst": { "enum": ["Hospital", "TPA", "Insurer"] },
    "citedSLAs":     { "type": "array", "items": { "type": "string", "pattern": "^SLA-" } }
  }
}
```

### 6.2 Lifecycles (`spec/lifecycles/*.lifecycle.json`)

XState-style flat state machines. **No guards / no inline expressions.** Every branch is a distinct event name. Each state carries a `meta.step` that pins the state to a journey-map step.

```json
{
  "$schema": "../schemas/lifecycle.schema.json",
  "object": "Claim",
  "initial": "pre-admission",
  "states": {
    "pre-admission": {
      "meta": { "step": "1.1" },
      "on": { "intimate-hospitalisation": "intimated" }
    },
    "intimated": {
      "meta": { "step": "1.2" },
      "on": { "doctor-signs-admission-advice": "admission-advised" }
    },
    "admission-advised": {
      "meta": { "step": "1.3" },
      "on": {
        "cashless-eligibility-confirmed":  "in-treatment-cashless",
        "cashless-eligibility-declined":   "in-treatment-reimbursement"
      }
    },
    "in-treatment-cashless": {
      "meta": { "step": "A.4" },
      "on": {
        "pre-auth-filed":     "pre-auth-pending",
        "patient-discharged": "discharged"
      }
    },
    "pre-auth-pending": {
      "meta": { "step": "A.3" },
      "on": {
        "pre-auth-approved":  "in-treatment-cashless",
        "pre-auth-rejected":  "in-treatment-reimbursement",
        "query-raised":       "in-query"
      }
    }
  }
}
```

Why no guards: keeps the lifecycle pure data — any language interprets it identically. Conditional dispatch (was the patient eligible? was the document complete?) is the responsibility of the *event producer* (UI, API, integrator); the resolved outcome shows up as a distinct event name. The interpreter is ~50 lines in any language.

### 6.3 Registries

#### `spec/registries/slas.json`

The 10 SLAs from the governance model, machine-readable. ISO 8601 durations. Admission-type variation expressed as a small object, not a guard. Anchored to events (start/end), not to states or steps.

```json
{
  "$schema": "../schemas/sla.schema.json",
  "slas": [
    {
      "id": "SLA-pre-auth-submission",
      "step": "A.1",
      "actor": "Hospital",
      "duration": "PT2H",
      "startsOn": ["doctor-signs-admission-advice"],
      "endsOn":   ["pre-auth-filed"],
      "escalation": { "action": "patient-files-direct", "target": "TPA" }
    },
    {
      "id": "SLA-pre-auth-response",
      "step": "A.3",
      "actor": "TPA",
      "durationByAdmissionType": { "emergency": "PT4H", "planned": "PT12H" },
      "startsOn": ["pre-auth-filed"],
      "endsOn":   ["pre-auth-approved", "pre-auth-rejected"],
      "escalation": { "action": "auto-escalate", "target": "Insurer" }
    },
    {
      "id": "SLA-reimbursement-settlement",
      "step": "3.4",
      "actor": "Insurer",
      "duration": "P30D",
      "startsOn": ["claim-form-submitted"],
      "endsOn":   ["claim-settled", "claim-rejected", "claim-partially-settled"],
      "escalation": { "action": "interest-payable-to-patient", "target": "Patient" }
    }
  ]
}
```

`startsOn` and `endsOn` are JSON arrays of event names — the SLA starts when any listed start-event fires, ends when any listed end-event fires. Always arrays even when single-element, so the format is uniform across all SLAs and other-language ports never need to special-case "string vs array". The engine watches the interaction stream and computes "active SLAs" as the set where any `startsOn` event has fired but no `endsOn` event has.

#### `spec/registries/events.json`

Every event the engine accepts, with its payload schema. This is what makes the spec self-describing.

```json
{
  "$schema": "../schemas/events.schema.json",
  "events": {
    "intimate-hospitalisation": {
      "payload": {
        "type": "object",
        "required": ["method"],
        "properties": {
          "method": { "enum": ["phone", "online-portal", "hospital-desk"] },
          "tpaReferenceNumber": { "type": "string" }
        }
      },
      "produces": "Interaction"
    },
    "pre-auth-filed": {
      "payload": {
        "type": "object",
        "required": ["filedBy", "documentId"],
        "properties": {
          "filedBy":    { "enum": ["Hospital", "Patient"] },
          "documentId": { "type": "string", "pattern": "^DOC-006-" }
        }
      },
      "produces": "Interaction"
    }
  }
}
```

The `produces` field is constrained by the meta-schema: `{ "enum": ["Interaction", "Document", "Query", "Grievance"] }`. Every event produces exactly one new typed object. Most events produce an Interaction; events like `query-raised` produce a Query (and an Interaction logging the production); breach-driven `grievance-filed` produces a Grievance.

Event names match `^[a-z][a-z0-9-]*$` (kebab-case, lowercase, no spaces or punctuation) — enforced by the events meta-schema. This guarantees `startsOn` / `endsOn` arrays can never contain ambiguous tokens.

#### `spec/registries/step-sla-map.json`

Lookup table mapping step IDs to the SLA IDs active at that step. Convenience for UIs that want to show "what SLAs are ticking now".

### 6.4 Conformance fixtures (`spec/conformance/*.json`)

The contract every UPCJ-compliant engine must satisfy. Each fixture is an input claim, an event, and the expected output.

```json
{
  "name": "Hospital files pre-auth on a planned-admission cashless claim",
  "tags": ["happy-path", "cashless", "pre-auth-flow", "sla-active"],
  "given": {
    "claim": {
      "id": "CLM-2026-0001",
      "status": "in-treatment-cashless",
      "path": "cashless",
      "admissionType": "planned",
      "currentStep": "A.4",
      "patientId": "PAT-1",
      "policyId":  "POL-1",
      "hospitalId":"HOS-1",
      "tpaId":     "TPA-1",
      "intimationDate": "2026-04-25T08:00:00+05:30",
      "admissionDate":  "2026-04-25T11:30:00+05:30",
      "documents":    [{ "id": "DOC-005-A", "validated": true }],
      "interactions": [],
      "queries": []
    }
  },
  "when": {
    "event": "pre-auth-filed",
    "payload": { "filedBy": "Hospital", "documentId": "DOC-006-A" },
    "at": "2026-04-25T13:00:00+05:30"
  },
  "then": {
    "claim": { "status": "pre-auth-pending", "currentStep": "A.3" },
    "interactions": [{
      "nature": "filing",
      "initiatingActor": { "type": "Hospital", "id": "HOS-1" },
      "timestamp": "2026-04-25T13:00:00+05:30",
      "documentIds": ["DOC-006-A"],
      "linkedSLAs": ["SLA-pre-auth-response"]
    }],
    "slaStatuses": [
      { "id": "SLA-pre-auth-submission",        "state": "completed", "endedAt": "2026-04-25T13:00:00+05:30" },
      { "id": "SLA-pre-auth-response",          "state": "active",    "deadline": "2026-04-26T01:00:00+05:30" },
      { "id": "SLA-reimbursement-settlement",   "state": "pending" }
    ]
  }
}
```

Engines read `given.claim`, apply `when.event` with `when.payload` at `when.at`, and assert the result equals `then`. **`then.slaStatuses` is the FULL output of `evaluateSLAs(claim, { now: when.at })` — including pending SLAs that haven't started, not just active ones.** Asserting the whole truth (rather than a filtered subset) prevents engines from drifting on which SLAs they consider "currently relevant". Identical fixtures run by a Python or Go engine implementation must produce identical outputs.

### 6.5 Conventions summary

- **All durations** ISO 8601 (`PT4H`, `P30D`).
- **All timestamps** carry timezone, defaulting to `+05:30` (IST).
- **No system-clock reads**; functions that need "now" take an explicit `now` parameter.
- **Events** named in `kebab-case-imperative` (`pre-auth-filed`, `claim-form-submitted`); regex `^[a-z][a-z0-9-]*$`.
- **IDs** prefixed by object type (`CLM-`, `DOC-`, `INT-`, `SLA-`, `QRY-`, `GRV-`).
- **Schema `$id`s** absolute (`https://upcj.org/spec/v1/...`), so `$ref` resolution works whether files are loaded from disk, npm package, or CDN.
- **Step IDs name positions in the journey map; they are not monotonically increasing along a claim's path.** A claim can move from step `A.4` (in-treatment cashless) to `A.3` (pre-auth response pending) when an enhancement is filed mid-treatment; from `B.4` to `B.5` and back; from `3.1` to `3.4` skipping `3.2` if no query is raised. Lifecycle interpreters MUST NOT assume monotonic step transitions, and CI MUST validate every `meta.step` value in every lifecycle file is present in the `currentStep` enum.

## 7. Engine API

### 7.1 Public surface (the entire export of `@upcj/engine`)

Four functions plus one constant. Pure. No side effects. No global state. No system-clock reads.

```ts
import { validate, advance, replay, evaluateSLAs, getSpecHash } from "@upcj/engine";
import type { Claim, Event, Interaction, SLAStatus } from "@upcj/engine";

const result: ValidationResult = validate(claim, "claim");

const event: Event = {
  name: "pre-auth-filed",
  payload: { filedBy: "Hospital", documentId: "DOC-006-A" },
  at: "2026-04-25T13:00:00+05:30",
  actor: { type: "Hospital", id: "HOS-1" }
};
const advanced = advance(claim, event);

// replay folds advance() over an ordered event list — the canonical primitive
// for reconstructing a claim from its audit history.
const final = replay(initialClaim, [event1, event2, event3]);

const slas: SLAStatus[] = evaluateSLAs(claim, {
  now: "2026-04-25T18:30:00+05:30"
});

// getSpecHash() returns the sha-256 of the bundled spec/ at publish time —
// consumers can verify they're running against the canonical spec:
//   if (getSpecHash() !== expectedFromCanonicalRepo) throw …
const hash: string = getSpecHash();
```

### 7.2 Result types

`validate`, `advance`, and `replay` return Result-style discriminated unions. `evaluateSLAs` returns an array (never fails — empty array means no SLAs in registry, which is itself a programming error caught at engine init). Domain conditions are returned as data. Programming errors (wrong argument types in TS, malformed spec files) throw `Error`.

```ts
type ValidationResult =
  | { ok: true }
  | { ok: false; errors: ValidationError[] };

type ValidationError = {
  path: string;          // JSON pointer, e.g. "/amounts/claimed"
  message: string;
  schemaPath: string;
};

type AdvanceResult =
  | { ok: true; claim: Claim; interactions: Interaction[] }
  | { ok: false; error: AdvanceError };

type AdvanceError =
  | { kind: "claim-invalid";       errors: ValidationError[] }
  | { kind: "event-unknown";       eventName: string }
  | { kind: "payload-invalid";     eventName: string; errors: ValidationError[] }
  | { kind: "transition-illegal";  currentState: string; eventName: string }
  | { kind: "spec-version-mismatch"; expected: string; actual: string };

type ReplayResult =
  | { ok: true; claim: Claim; interactions: Interaction[] }
  | { ok: false; error: AdvanceError; processedCount: number };  // events successfully applied before the failure

type SLAStatus = {
  id: string;
  state: "pending" | "active" | "completed" | "breached";
  startedAt: string | null;
  deadline: string | null;
  endedAt: string | null;
  escalation?: { action: string; target: string };
};
```

The four SLA states map cleanly:
- **pending** — `startsOn` event hasn't fired
- **active** — `startsOn` fired, `endsOn` hasn't, `now < deadline`
- **completed** — `endsOn` fired before `deadline`
- **breached** — `now >= deadline` and `endsOn` hasn't fired

### 7.3 Time semantics

1. Every timestamp carries a timezone. Default `+05:30` (IST). The engine refuses any timestamp without a TZ.
2. All durations are ISO 8601. Engine ships a tiny duration adder; no third-party date library required for the spec.
3. Calendar arithmetic, not business hours. `P30D` = exactly 720 wall-clock hours from `startedAt`. Matches IRDAI "30 days from submission" wording literally.
4. `now` is always injected. `evaluateSLAs(claim, { now })` requires `now`. There is no overload that reads `Date.now()`. Tests, replays, and audits stay deterministic.
5. Event timestamps are authoritative. `event.at` in `advance()` is what gets recorded in the resulting `Interaction.timestamp`. Engine never modifies it. Out-of-order events are accepted but flagged with `outOfOrder: true` in the resulting Interaction — let the caller decide whether to reject.

### 7.4 `advance()` sequence

Given `(claim, event)`:

1. Check `claim.specVersion === "v1"`. If mismatch → `{ kind: "spec-version-mismatch", expected: "v1", actual: claim.specVersion }`.
2. `validate(claim, "claim")`. If `!ok` → `{ kind: "claim-invalid", errors }`.
3. Look up `event.name` in `events.json`. If absent → `{ kind: "event-unknown", eventName }`.
4. Validate `event.payload` against the event's payload schema. If `!ok` → `{ kind: "payload-invalid", … }`.
5. Read `claim.lifecycle.json`. Look up `claim.status` → state node. Look up `event.name` in the state's `on` map. If absent → `{ kind: "transition-illegal", currentState, eventName }`.
6. Resolve target state. Read its `meta.step`.
7. Construct new `Interaction`:
   ```ts
   {
     id: deterministicId(claim, event),         // see definition below
     claimRef: claim.id,
     timestamp: event.at,
     initiatingActor: event.actor,
     respondingActor: null,
     nature: events[event.name].produces,
     payload: event.payload,
     linkedSLAs: matchingSLAsForEvent(event.name) // every SLA whose startsOn includes event.name
   }
   ```
8. Construct new claim:
   ```ts
   { ...claim,
     status: targetState,
     currentStep: targetState.meta.step,
     interactions: [...claim.interactions, newInteraction]
   }
   ```
9. Re-validate the new claim. If somehow invalid → `{ kind: "claim-invalid", errors }`. (Catches lifecycle-spec bugs.)
10. Return `{ ok: true, claim: newClaim, interactions: [newInteraction] }`.

`deterministicId(claim, event)` is `sha-256` of the canonical concatenation:

```
claim.id + "|" + claim.interactions.length + "|" + event.at + "|" + event.name + "|" + canonicalJson(event.payload)
```

Including `claim.interactions.length` (a per-claim sequence number) AND `canonicalJson(event.payload)` eliminates collisions on legitimate same-second same-name events from the same claim — e.g., two `document-uploaded` events at `13:00:00` with different `documentId`s, or any source system whose timestamps lose subsecond precision. `canonicalJson` is RFC 8785 JCS (JSON Canonicalization Scheme): sorted keys, no whitespace, deterministic number formatting. The same `(claim, event)` always produces the same Interaction ID across implementations and across runs; conformance fixtures can assert exact IDs.

### 7.5 Error model conventions

- **Domain errors** (illegal transitions, validation failures) returned as data. Always.
- **Programming errors** (wrong type, missing spec file) throw `Error`. Bugs.
- **No silent recovery.** The engine never guesses or auto-fills. Missing required field → validation error.

This shape maps cleanly to TypeScript callers, MCP tool wrappers (JSON-serializable everything), and other-language ports (Result-style → Rust `Result`, Go `(value, error)`, Python `Union[Ok, Err]`).

## 8. Testing and conformance

### 8.1 Test layout

Three test files, all run on every commit:

- **`engine/tests/unit.test.mjs`** — engine internals (`node:test`). Duration parser edge cases, lifecycle interpreter shapes, SLA matcher, deterministic IDs, no-throw discipline.
- **`engine/tests/conformance.test.mjs`** — walks `spec/conformance/*.json`, runs each fixture through `advance` (or `evaluateSLAs`), deep-equals against `then`.
- **`engine/tests/framework-conformance.test.mjs`** — validates `framework/document-registry.json` against `spec/schemas/document.schema.json`, `framework/ownership-matrix.json` against `spec/schemas/step.schema.json`. Failures here mean either the spec is wrong or the framework drifted.

### 8.2 Conformance harness

Sketch:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { advance, evaluateSLAs } from "../src/index.js";

const SPEC_DIR = new URL("../../spec/conformance/", import.meta.url);
const fixtures = readdirSync(SPEC_DIR)
  .filter(f => f.endsWith(".json") && f !== "coverage.json")
  .sort();

for (const name of fixtures) {
  const fx = JSON.parse(readFileSync(new URL(name, SPEC_DIR), "utf8"));
  test(`conformance: ${fx.name}`, () => {
    const result = advance(fx.given.claim, fx.when);
    assert.equal(result.ok, true);
    assert.deepStrictEqual(result.claim, expectedClaim(fx));
    assert.deepStrictEqual(result.interactions, fx.then.interactions);
    if (fx.then.slaStatuses) {
      // Assert the FULL output of evaluateSLAs, not a filtered subset.
      // Filtering convention is "the spec is the contract — assert the whole truth."
      const slas = evaluateSLAs(result.claim, { now: fx.when.at });
      assert.deepStrictEqual(slas, fx.then.slaStatuses);
    }
  });
}

test("coverage requirements satisfied", () => {
  const coverage = JSON.parse(readFileSync(new URL("coverage.json", SPEC_DIR), "utf8"));
  const allTags = fixtures.map(f => JSON.parse(readFileSync(new URL(f, SPEC_DIR), "utf8")));
  for (const req of coverage.requirements) {
    assertCoverageRule(req, allTags);
  }
});
```

### 8.3 Coverage requirements (`spec/conformance/coverage.json`)

```json
{
  "$schema": "../schemas/coverage.schema.json",
  "requirements": [
    {
      "rule": "every-event-covered",
      "from": "registries/events.json",
      "rationale": "Each declared event must appear in at least one fixture's `when.event` field."
    },
    {
      "rule": "every-transition-exercised",
      "from": "lifecycles/",
      "rationale": "Every (state, event) → state edge in every lifecycle must appear in at least one fixture. Catches dead lifecycle edges that pass `every-event-covered` but exercise only a subset of transitions."
    },
    {
      "rule": "every-state-entered",
      "from": "lifecycles/",
      "rationale": "Every state in every lifecycle must be the resulting state of at least one fixture."
    },
    {
      "rule": "every-sla-has-state",
      "from": "registries/slas.json",
      "states": ["completed", "breached"],
      "rationale": "Every SLA must have at least one fixture proving it can complete and one proving it can be breached."
    },
    {
      "rule": "lifecycle-meta-step-valid",
      "from": "lifecycles/",
      "rationale": "Every `meta.step` value in every lifecycle file must be a member of `claim.schema.json`'s `currentStep` enum. Catches schema drift before runtime."
    },
    {
      "rule": "tag-min-count", "tag": "happy-path-cashless",       "minCount": 1
    },
    {
      "rule": "tag-min-count", "tag": "happy-path-reimbursement",  "minCount": 1
    },
    {
      "rule": "tag-min-count", "tag": "query-loop",                "minCount": 2,
      "rationale": "Both A.2 (cashless) and B.5 (reimbursement) query flows must be covered."
    },
    {
      "rule": "tag-min-count", "tag": "partial-settlement",        "minCount": 1,
      "rationale": "Partial-settlement is the most common real-world Indian outcome (room-rent caps, sub-limits). Must be exercised."
    }
  ]
}
```

Six built-in rule kinds, all required: `every-event-covered`, `every-transition-exercised`, `every-state-entered`, `every-sla-has-state`, `lifecycle-meta-step-valid`, `tag-min-count`. Adding a new event to `events.json` or a new transition to a lifecycle without authoring a fixture breaks CI.

### 8.4 Framework JSON validation

`engine/tests/framework-conformance.test.mjs` checks that the canonical registries match the new spec:

```ts
test("framework/document-registry.json matches document.schema.json", () => {
  const registry = JSON.parse(readFileSync("framework/document-registry.json", "utf8"));
  for (const doc of registry.documents) {
    const result = validate(doc, "document");
    assert.equal(result.ok, true, `DOC ${doc.id}: ${JSON.stringify(result.errors)}`);
  }
});
```

Same shape for `ownership-matrix.json`.

## 9. Distribution

### 9.1 Package shape

**Single npm package: `@upcj/engine`**.

The published tarball includes:
- `dist/` — compiled JS + `.d.ts`
- `dist/spec/` — copy of `spec/` directory bundled in (so consumers don't need a second package)
- `package.json` with:
  ```json
  "exports": {
    ".":             "./dist/index.js",
    "./spec/*.json": "./dist/spec/*.json"
  }
  ```

A build step (`npm run build` in `engine/`, `scripts/bundle-spec.mjs`) copies `../spec/` into `engine/dist/spec/` before publishing AND computes a sha-256 fingerprint over the canonical spec/ directory (sorted file list, RFC 8785 JCS for each JSON). The hash is written to `engine/dist/spec-hash.json` and embedded as `SPEC_HASH` in the built engine. At runtime, `engine.getSpecHash()` returns this constant. CI verifies the bundled hash matches a freshly-computed canonical hash at publish time; mismatch fails the release. Consumers can pin against expected hashes or simply check `getSpecHash()` against the canonical published value to detect drift between npm and the GitHub repo.

**Non-JS adopters** read the same files from GitHub raw URLs:

```
https://raw.githubusercontent.com/s1dd4rth/upcj/main/spec/schemas/claim.schema.json
https://raw.githubusercontent.com/s1dd4rth/upcj/main/spec/conformance/001-pre-auth-filed.json
```

Schemas use absolute `$id` URLs (`https://upcj.org/spec/v1/...`) so `$ref` resolution can route to either the local copy (in npm) or a CDN (with a small URL→path map for the resolver).

### 9.2 Versioning

- `@upcj/engine` follows semver. v1.0.0 ships with the lean+ scope.
- Spec versioning lives in `$id` URLs (`/spec/v1/`). Breaking changes to the spec → bump to `/spec/v2/`. The engine package supports one spec major version per engine major version.
- Conformance fixtures live alongside the spec they target.
- Tags follow `core-v*` to namespace cleanly from `starter-kit-v*`. First release: `core-v1.0.0`.

### 9.3 CI integration

New workflow `.github/workflows/core.yml`, parallel to `starter-kit.yml`:

```yaml
name: core

on:
  push:
    branches: [main]
    paths: ["spec/**", "engine/**", "framework/**", ".github/workflows/core.yml"]
    tags: ["core-v*"]
  pull_request:
    paths: ["spec/**", "engine/**", "framework/**"]

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: engine
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "npm", cache-dependency-path: engine/package-lock.json }
      - run: npm ci
      - run: npm test                           # unit + conformance + framework + coverage
      - run: npm run build                      # bundle spec/ into dist/spec/

  release:
    if: startsWith(github.ref, 'refs/tags/core-v')
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write    # for npm provenance
    defaults:
      run:
        working-directory: engine
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          registry-url: "https://registry.npmjs.org"
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public --provenance
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 9.4 Initial release strategy

Three milestones to v1.0.0:

1. **Spec freeze.** All schemas, lifecycles, registries committed. ≥25 conformance fixtures (rough estimate: 1 per event ≈ 15-20, plus a handful of multi-event end-to-end scenarios).
2. **Engine green.** Conformance harness passes; coverage requirements satisfied; framework-conformance passes (the existing `document-registry.json` and `ownership-matrix.json` validate against the new schemas without modification).
3. **First publish.** Tag `core-v1.0.0`, CI publishes `@upcj/engine@1.0.0` to npm with provenance. Spec files included in the package; also accessible via raw GitHub URLs.

After v1.0.0 ships, v1.1 work begins (Query state machine completeness, then Grievance, then full actor schemas).

## 10. Risks and open questions

**Risks:**
- **Spec format gets wrong before v2.** Once published, breaking changes require a `/spec/v2/` namespace bump. Mitigation: the lean+ scope is deliberately small; v1.0.0 covers the operational happy path + deficiency loop, the surface most exercised. Format choices (JSON Schema 2020-12, ISO 8601, no-guards lifecycles) are conservative and well-supported.
- **Conformance fixtures undercoverage.** Fixtures could pass while real-world edge cases fail. Mitigation: `coverage.json` enforces "every event has a fixture" + "every SLA has both completion and breach fixtures". Rule set extensible as gaps appear.
- **Other-language adoption never materializes.** The "language-neutral" framing is moot if every adopter ends up using `@upcj/engine`. Acceptable failure mode: the spec is still a useful internal contract for the JS engine. Validates the approach without proving the multi-language thesis.

**Open questions (tracked in implementation plan, not blocking this spec):**
- `https://upcj.org/spec/v1/` is the canonical schema namespace in the spec — do we register the domain and host the schemas there, or treat the URL as opaque identifier with files served only from GitHub? Defer to authoring review; if `upcj.org` is not registered before v1.0.0 freeze, fall back to `https://github.com/s1dd4rth/upcj/spec/v1/` as the namespace.
- DST and cross-border timezone semantics. The engine adds durations to the `startsOn` instant in UTC and formats deadlines in the original timezone for display. Leap seconds are ignored. India does not observe DST so the IST baseline is unaffected; cross-border claims (e.g., Mauritius hospital, Indian patient) need a v1.1 sentence in the spec covering UTC-arithmetic semantics — not a v1 blocker.

**Resolved during external review (2026-04-26):**
- Event ordering on `advance()`: **permissive** — out-of-order events accepted, flagged with `outOfOrder: true` on the resulting Interaction. Strict ordering would force every caller to maintain an event-sequencing buffer; real-world claims have constant racing between hospital, TPA, and patient timestamps.
- `derivePath(claim) → "cashless" | "reimbursement" | "undecided"`: **not in v1**. Path is set by an explicit event (`cashless-eligibility-confirmed` or `cashless-eligibility-declined`) and stored on the Claim. Deriving from interaction history is redundant when the field is authoritative. Add in v1.1 only if a consumer surfaces a real need.

## 11. Links

- Existing framework: `framework/data-analysis.md`, `framework/governance-model.md`, `framework/document-registry.json`, `framework/ownership-matrix.json`, `framework/journey-map.html`, `framework/patient-checklist.html`.
- [JSON Schema draft 2020-12](https://json-schema.org/draft/2020-12/release-notes)
- [ISO 8601 — Date and time format](https://www.iso.org/iso-8601-date-and-time-format.html)
- [IRDAI Health Insurance Regulations](https://irdai.gov.in/)
- [XState — state machine semantics referenced for lifecycle format](https://stately.ai/docs/xstate)
- [OOUX ORCA — methodology used to derive the original 14 objects](https://www.ooux.com/orca/)
