import { readFileSync } from "node:fs";
import { advance } from "../dist/index.js";
import { SLAS } from "../dist/registries.js";
import { computeSLAStatus } from "../dist/sla.js";

const fixturePath = process.argv[2];
if (!fixturePath) {
  console.error("usage: node generate-fixture-then.mjs <fixture.json>");
  process.exit(1);
}

const fx = JSON.parse(readFileSync(fixturePath, "utf8"));
const event = {
  name: fx.when.event,
  payload: fx.when.payload ?? {},
  at: fx.when.at,
  actor: fx.when.actor,
};

const r = advance(fx.given.claim, event);
if (!r.ok) {
  console.error("ADVANCE FAILED:", JSON.stringify(r.error, null, 2));
  process.exit(2);
}

const interactions = r.claim.interactions ?? [];
const slaStatuses = SLAS.map(sla =>
  computeSLAStatus(sla, interactions, fx.when.at, r.claim.admissionType)
);

// Strip auto-generated id from new interactions (harness ignores it)
const newInteractions = r.interactions.map(({ id, ...rest }) => rest);

console.log(
  JSON.stringify(
    {
      claim: { status: r.claim.status, currentStep: r.claim.currentStep },
      interactions: newInteractions,
      slaStatuses,
    },
    null,
    2
  )
);
