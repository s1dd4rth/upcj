# @upcj/engine

Reference TypeScript implementation of the UPCJ core spec.

## Install

    npm install @upcj/engine

## Use

    import { validate, advance, replay, evaluateSLAs, getSpecHash } from "@upcj/engine";

See `docs/superpowers/specs/2026-04-26-ontology-design.md` in the
upcj repo for the full API and behaviour spec.

## Develop

    npm install
    npm run build       # bundles ../spec/ into dist/spec/, runs tsc
    npm test            # unit + conformance + framework-conformance

## License

CC BY-SA 4.0.
