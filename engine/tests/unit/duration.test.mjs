import { test } from "node:test";
import assert from "node:assert/strict";
import { parseDuration, addDuration } from "../../dist/duration.js";

test("parseDuration handles hours", () => {
  assert.deepEqual(parseDuration("PT2H"),    { years: 0, months: 0, days: 0, hours: 2,  minutes: 0, seconds: 0 });
  assert.deepEqual(parseDuration("PT12H"),   { years: 0, months: 0, days: 0, hours: 12, minutes: 0, seconds: 0 });
  assert.deepEqual(parseDuration("PT4H30M"), { years: 0, months: 0, days: 0, hours: 4,  minutes: 30, seconds: 0 });
});

test("parseDuration handles days", () => {
  assert.deepEqual(parseDuration("P30D"), { years: 0, months: 0, days: 30, hours: 0, minutes: 0, seconds: 0 });
  assert.deepEqual(parseDuration("P15D"), { years: 0, months: 0, days: 15, hours: 0, minutes: 0, seconds: 0 });
});

test("parseDuration rejects invalid", () => {
  assert.throws(() => parseDuration(""),       /invalid/i);
  assert.throws(() => parseDuration("2H"),     /invalid/i);
  assert.throws(() => parseDuration("PT"),     /invalid/i);
  assert.throws(() => parseDuration("P30Z"),   /invalid/i);
});

test("addDuration: hour-scale", () => {
  assert.equal(
    addDuration("2026-04-25T13:00:00+05:30", "PT4H"),
    "2026-04-25T17:00:00+05:30"
  );
  assert.equal(
    addDuration("2026-04-25T22:00:00+05:30", "PT4H"),
    "2026-04-26T02:00:00+05:30"
  );
});

test("addDuration: day-scale uses calendar arithmetic (not business hours)", () => {
  assert.equal(
    addDuration("2026-04-26T13:00:00+05:30", "P30D"),
    "2026-05-26T13:00:00+05:30"
  );
});

test("addDuration: month boundaries", () => {
  assert.equal(
    addDuration("2026-04-25T13:00:00+05:30", "P15D"),
    "2026-05-10T13:00:00+05:30"
  );
});

test("addDuration: rejects timestamps without timezone", () => {
  assert.throws(
    () => addDuration("2026-04-25T13:00:00", "PT4H"),
    /timezone/i
  );
});
