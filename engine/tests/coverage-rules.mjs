// Built-in coverage-rule implementations.
// Each rule receives (req, ctx) where ctx = { fixtures, lifecycles, slas, events, claimSchema }
// and throws on coverage failure or returns silently.

import assert from "node:assert/strict";

export function runCoverageRule(req, ctx) {
  const fn = RULES[req.rule];
  if (!fn) throw new Error(`unknown coverage rule: ${req.rule}`);
  fn(req, ctx);
}

const RULES = {
  "every-event-covered": (_req, { fixtures, events }) => {
    const used = new Set(fixtures.map(f => f.when?.event).filter(Boolean));
    for (const eventName of Object.keys(events.events)) {
      assert.ok(used.has(eventName), `coverage: event "${eventName}" not in any fixture`);
    }
  },

  "every-transition-exercised": (_req, { fixtures, lifecycles }) => {
    const exercised = new Set();
    for (const f of fixtures) {
      const e = f.when?.event;
      const fromStatus = f.given?.claim?.status;
      const toStatus   = f.then?.claim?.status;
      if (e && fromStatus && toStatus) exercised.add(`${fromStatus}/${e}/${toStatus}`);
    }
    for (const lc of lifecycles) {
      // Only check the Claim lifecycle for transitions; Document/Query lifecycles
      // describe object-level transitions handled by their own future engines.
      if (lc.object !== "Claim") continue;
      for (const [from, node] of Object.entries(lc.states)) {
        for (const [event, to] of Object.entries(node.on ?? {})) {
          assert.ok(
            exercised.has(`${from}/${event}/${to}`),
            `coverage: Claim transition ${from}/${event}->${to} not exercised in any fixture`
          );
        }
      }
    }
  },

  "every-state-entered": (_req, { fixtures, lifecycles }) => {
    const entered = new Set();
    for (const f of fixtures) {
      const to = f.then?.claim?.status;
      if (to) entered.add(to);
    }
    for (const lc of lifecycles) {
      if (lc.object !== "Claim") continue;
      for (const state of Object.keys(lc.states)) {
        if (state === lc.initial) continue;
        assert.ok(entered.has(state), `coverage: Claim state "${state}" never entered by any fixture`);
      }
    }
  },

  "every-sla-has-state": (req, { fixtures, slas }) => {
    const required = req.states ?? ["completed", "breached"];
    for (const sla of slas.slas) {
      for (const state of required) {
        const present = fixtures.some(f =>
          (f.then?.slaStatuses ?? []).some(s => s.id === sla.id && s.state === state)
        );
        assert.ok(present, `coverage: SLA ${sla.id} state="${state}" not exercised`);
      }
    }
  },

  "lifecycle-meta-step-valid": (_req, { lifecycles, claimSchema }) => {
    const validSteps = new Set(claimSchema.properties.currentStep.enum);
    for (const lc of lifecycles) {
      for (const [name, node] of Object.entries(lc.states)) {
        const step = node.meta?.step;
        if (step !== undefined) {
          assert.ok(validSteps.has(step),
            `coverage: lifecycle ${lc.object} state "${name}" meta.step="${step}" not in claim.schema currentStep enum`);
        }
      }
    }
  },

  "tag-min-count": (req, { fixtures }) => {
    const matching = fixtures.filter(f => (f.tags ?? []).includes(req.tag));
    assert.ok(matching.length >= req.minCount,
      `coverage: tag "${req.tag}" needs ${req.minCount} fixtures, found ${matching.length}`);
  }
};
