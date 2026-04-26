# @upcj/engine

Reference TypeScript implementation of the UPCJ ([Unified Patient Claim Journey](https://github.com/s1dd4rth/upcj)) core spec — a machine-readable, language-neutral specification of the Indian health-insurance claim process.

```bash
npm install @upcj/engine
```

## Why this exists

UPCJ is a public framework that hospitals, TPAs, insurers, and patient apps adopt so they share a vocabulary and produce consistent claim behaviour. The canonical spec at [`spec/`](https://github.com/s1dd4rth/upcj/tree/main/spec) is JSON — schemas, state machines, and registries that any language can read. This package is one reference implementation; non-JS adopters port the spec into their stack and pass the same conformance fixtures.

## Quick start

```ts
import { validate, advance, replay, evaluateSLAs, getSpecHash } from "@upcj/engine";

// 1. Validate a Claim against the spec schema.
const claim = {
  id: "CLM-2026-0001",
  specVersion: "v1",
  status: "pre-admission",
  path: "undecided",
  admissionType: "planned",
  patientId: "PAT-1",
  policyId: "POL-1",
};
const result = validate(claim, "claim");
if (!result.ok) console.error(result.errors);

// 2. Apply an event. Returns the new claim + the audit-trail Interaction.
const event = {
  name: "intimate-hospitalisation",
  payload: { method: "phone", tpaReferenceNumber: "TPA-REF-001" },
  at: "2026-04-25T08:00:00+05:30",
  actor: { type: "Patient", id: "PAT-1" },
};
const next = advance(claim, event);
if (next.ok) {
  console.log(next.claim.status); // "intimated"
  console.log(next.interactions); // one new Interaction with deterministic INT-... id
}

// 3. Compute SLA status at a given moment.
const slas = evaluateSLAs(next.claim, { now: "2026-04-25T13:00:00+05:30" });
slas.forEach(s => console.log(s.id, s.state, s.deadline));

// 4. Reconstruct from history.
const final = replay(initialClaim, [event1, event2, event3]);

// 5. Verify you're on the canonical spec.
console.log(getSpecHash()); // sha-256 of bundled spec/
```

## Public surface

Five exports. All pure. No system-clock reads. No global state.

| Export | Signature | Behaviour |
|---|---|---|
| `validate` | `(obj, schemaName) → ValidationResult` | JSON Schema 2020-12 validation against any of the 12 spec schemas |
| `advance` | `(claim, event) → AdvanceResult` | Apply one event: validate → lookup event → check transition → build Interaction → return new claim. Returns `{ ok: false, error }` for domain errors; never throws |
| `replay` | `(claim, events[]) → ReplayResult` | Fold `advance` over an event list. Stops at first failure with `processedCount` |
| `evaluateSLAs` | `(claim, { now }) → SLAStatus[]` | Compute pending/active/completed/breached for every SLA in the registry. `now` is required — engine never reads system clock |
| `getSpecHash` | `() → string` | sha-256 of the bundled `spec/` directory at publish time. Use to detect drift between npm and the canonical repo |

## Spec contract

The engine reads `spec/*.json` at runtime. The package bundles its own copy under `dist/spec/`. The canonical version on disk in the source repo is at the top-level `spec/` directory. Both are identical at publish time, verified by CI.

Non-JS adopters skip this package entirely and read the spec from raw GitHub URLs:

```
https://raw.githubusercontent.com/s1dd4rth/upcj/main/spec/schemas/claim.schema.json
https://raw.githubusercontent.com/s1dd4rth/upcj/main/spec/conformance/001-intimation.json
```

The 44 conformance fixtures in `spec/conformance/` are the cross-language contract. Any UPCJ-compliant engine implementation must produce byte-identical outputs when run against the same fixtures.

## Versioning

| Version | Meaning |
|---|---|
| Spec version | encoded in the `$id` URL of every schema (`https://upcj.org/spec/v1/...`). Major breaking changes bump to `/spec/v2/`. |
| Package version | semver. v1.0.0 supports spec v1. A v2.0.0 of this package would support spec v2. |
| Conformance fixtures | versioned with the spec, not the engine. v1.x fixtures live with v1.x lifecycles + registries. |

## Develop

```bash
git clone https://github.com/s1dd4rth/upcj
cd upcj/engine
npm install
npm run build       # bundles ../spec/ into dist/spec/, runs tsc, computes spec hash
npm test            # 79 tests: 32 unit + 44 conformance + 1 coverage + 2 framework
```

CI workflow: [`.github/workflows/core.yml`](https://github.com/s1dd4rth/upcj/blob/main/.github/workflows/core.yml). Runs on every push touching `spec/`, `engine/`, `framework/`, or the workflow file. Publishes to npm via OIDC trusted publishing on `core-v*` tags.

## Scope (v1)

| Object | Schema | Lifecycle | Notes |
|---|---|---|---|
| Claim | ✅ | ✅ 15 states | Central object |
| Document | ✅ | ✅ | Validates entries in `framework/document-registry.json` |
| Step | ✅ | — | Validates entries in `framework/ownership-matrix.json` |
| SLA | ✅ | — | 10 SLAs with ISO 8601 durations |
| Interaction | ✅ | — | The CIP audit trail |
| Query | ✅ | ✅ | Deficiency loop |
| Grievance | ✅ (minimal) | — | Full lifecycle deferred to v1.1 |

Out of scope for v1 (deferred): full Grievance lifecycle with escalation, full actor schemas (Patient/Doctor/Hospital/TPA/Insurer beyond `ActorReference`), eligibility/policy-rules engine, business-hour calendars, FHIR/SNOMED alignment.

## License

CC BY-SA 4.0 — same as the rest of the UPCJ framework.

Spec design doc: [`docs/superpowers/specs/2026-04-26-ontology-design.md`](https://github.com/s1dd4rth/upcj/blob/main/docs/superpowers/specs/2026-04-26-ontology-design.md).
