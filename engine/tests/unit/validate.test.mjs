import { test } from "node:test";
import assert from "node:assert/strict";
import { validate } from "../../dist/validate.js";

test("validate: well-formed claim passes", () => {
  const claim = {
    id: "CLM-001",
    specVersion: "v1",
    status: "pre-admission",
    path: "undecided",
    admissionType: "planned",
    patientId: "PAT-1",
    policyId: "POL-1"
  };
  const result = validate(claim, "claim");
  assert.equal(result.ok, true);
});

test("validate: missing required field fails with path", () => {
  const claim = {
    id: "CLM-001",
    specVersion: "v1",
    // status missing
    path: "undecided",
    admissionType: "planned",
    patientId: "PAT-1",
    policyId: "POL-1"
  };
  const result = validate(claim, "claim");
  assert.equal(result.ok, false);
  assert.ok(result.errors.length > 0);
  assert.ok(result.errors.some(e => /status/.test(e.message) || /status/.test(e.path)));
});

test("validate: bad enum value fails", () => {
  const claim = {
    id: "CLM-001",
    specVersion: "v1",
    status: "lying-down-meekly",
    path: "undecided",
    admissionType: "planned",
    patientId: "PAT-1",
    policyId: "POL-1"
  };
  const result = validate(claim, "claim");
  assert.equal(result.ok, false);
});

test("validate: SLA registry shape", () => {
  const slaReg = {
    slas: [{
      id: "SLA-test",
      step: "A.1",
      actor: "Hospital",
      duration: "PT2H",
      startsOn: ["e1"],
      endsOn:   ["e2"],
      escalation: { action: "escalate", target: "TPA" }
    }]
  };
  const result = validate(slaReg, "sla");
  assert.equal(result.ok, true);
});

test("validate: SLA missing both duration and durationByAdmissionType fails", () => {
  const slaReg = {
    slas: [{
      id: "SLA-bad",
      step: "A.1",
      actor: "Hospital",
      startsOn: ["e1"],
      endsOn:   ["e2"],
      escalation: { action: "escalate", target: "TPA" }
    }]
  };
  const result = validate(slaReg, "sla");
  assert.equal(result.ok, false);
});

test("validate: unknown schema name throws", () => {
  assert.throws(() => validate({}, "nonsense"), /unknown schema/i);
});
