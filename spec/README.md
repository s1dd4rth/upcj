# UPCJ Core Spec

Language-neutral, machine-readable specification for the Unified Patient
Claim Journey. Files under this directory are the canonical contract;
the TypeScript implementation in `../engine/` is one of many possible
implementations.

## Layout

- `schemas/` — JSON Schema (draft 2020-12) for every object.
- `lifecycles/` — JSON state machines for stateful objects.
- `registries/` — SLA, event, and step→SLA mappings.
- `conformance/` — input/event/expected-output fixtures every conformant
  engine must pass.

## Validating the spec

A conformant engine reads the schemas from `schemas/`, the lifecycles
from `lifecycles/`, and the registries from `registries/`, then runs
every fixture in `conformance/` and asserts the result equals the
expected output. The reference engine in `../engine/` does this; ports
in other languages must do the same.

## Versioning

Spec version is `v1` (encoded in every schema's `$id` URL).
Conformance fixtures, lifecycles, and registries are joint with the
schema version they target. A v2 spec would live at `spec/v2/`.

## License

CC BY-SA 4.0 — same as the rest of the UPCJ framework.
