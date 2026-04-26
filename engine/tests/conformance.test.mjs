import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { advance, evaluateSLAs } from "../dist/index.js";
import { runCoverageRule } from "./coverage-rules.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPEC_DIR = join(__dirname, "..", "..", "spec");
const FX_DIR = join(SPEC_DIR, "conformance");

const fixtureNames = readdirSync(FX_DIR)
  .filter(f => f.endsWith(".json") && f !== "coverage.json")
  .sort();

const fixtures = fixtureNames.map(n => JSON.parse(readFileSync(join(FX_DIR, n), "utf8")));

for (let i = 0; i < fixtures.length; i++) {
  const name = fixtureNames[i];
  const fx = fixtures[i];

  test(`conformance: ${name} — ${fx.name}`, () => {
    const event = {
      name:    fx.when.event,
      payload: fx.when.payload,
      at:      fx.when.at,
      actor:   fx.when.actor
    };
    const r = advance(fx.given.claim, event);
    assert.equal(r.ok, true, `advance failed: ${JSON.stringify(r.error ?? r, null, 2)}`);

    // Verify the new claim's expected fields match.
    for (const [k, v] of Object.entries(fx.then.claim ?? {})) {
      assert.deepStrictEqual(r.claim[k], v, `claim.${k} mismatch (got ${JSON.stringify(r.claim[k])}, expected ${JSON.stringify(v)})`);
    }

    // Verify interactions: ignore the auto-generated id, compare other fields.
    const expected = fx.then.interactions ?? [];
    assert.equal(r.interactions.length, expected.length, "interaction count mismatch");
    for (let j = 0; j < expected.length; j++) {
      const got = { ...r.interactions[j] };
      delete got.id;
      assert.deepStrictEqual(got, expected[j], `interactions[${j}] mismatch`);
    }

    // Verify SLA statuses (full output assertion).
    if (fx.then.slaStatuses) {
      const slas = evaluateSLAs(r.claim, { now: fx.when.at });
      assert.deepStrictEqual(slas, fx.then.slaStatuses);
    }
  });
}

test("coverage requirements satisfied", () => {
  const coverage = JSON.parse(readFileSync(join(FX_DIR, "coverage.json"), "utf8"));
  const events = JSON.parse(readFileSync(join(SPEC_DIR, "registries", "events.json"), "utf8"));
  const slas   = JSON.parse(readFileSync(join(SPEC_DIR, "registries", "slas.json"), "utf8"));
  const lifecycles = readdirSync(join(SPEC_DIR, "lifecycles"))
    .filter(f => f.endsWith(".json"))
    .map(f => JSON.parse(readFileSync(join(SPEC_DIR, "lifecycles", f), "utf8")));
  const claimSchema = JSON.parse(readFileSync(join(SPEC_DIR, "schemas", "claim.schema.json"), "utf8"));

  for (const req of coverage.requirements) {
    runCoverageRule(req, { fixtures, lifecycles, slas, events, claimSchema });
  }
});
