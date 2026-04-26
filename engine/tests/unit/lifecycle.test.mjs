import { test } from "node:test";
import assert from "node:assert/strict";
import { Lifecycle } from "../../dist/lifecycle.js";

const SAMPLE = {
  object: "Test",
  initial: "a",
  states: {
    "a": { meta: { step: "1.1" }, on: { "go": "b" } },
    "b": { meta: { step: "1.2" }, on: { "go": "c", "back": "a" } },
    "c": { meta: { step: "1.3" }, on: {} }
  }
};

test("Lifecycle: initial state", () => {
  const lc = new Lifecycle(SAMPLE);
  assert.equal(lc.initial, "a");
});

test("Lifecycle: legal transition", () => {
  const lc = new Lifecycle(SAMPLE);
  const r = lc.nextState("a", "go");
  assert.deepEqual(r, { target: "b", meta: { step: "1.2" } });
});

test("Lifecycle: illegal transition returns null", () => {
  const lc = new Lifecycle(SAMPLE);
  assert.equal(lc.nextState("a", "back"), null);
  assert.equal(lc.nextState("c", "go"),   null);
});

test("Lifecycle: unknown source state returns null", () => {
  const lc = new Lifecycle(SAMPLE);
  assert.equal(lc.nextState("nowhere", "go"), null);
});

test("Lifecycle: states() returns all state names", () => {
  const lc = new Lifecycle(SAMPLE);
  assert.deepEqual(lc.states().sort(), ["a", "b", "c"]);
});

test("Lifecycle: transitions() returns all (state, event, target) triples", () => {
  const lc = new Lifecycle(SAMPLE);
  const t = lc.transitions().sort((x, y) =>
    x.from.localeCompare(y.from) || x.event.localeCompare(y.event)
  );
  assert.deepEqual(t, [
    { from: "a", event: "go",   to: "b" },
    { from: "b", event: "back", to: "a" },
    { from: "b", event: "go",   to: "c" }
  ]);
});
