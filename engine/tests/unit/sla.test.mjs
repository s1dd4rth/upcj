import { test } from "node:test";
import assert from "node:assert/strict";
import { computeSLAStatus } from "../../dist/sla.js";

const SLA = {
  id: "SLA-test",
  step: "A.1",
  actor: "Hospital",
  duration: "PT4H",
  startsOn: ["start-event"],
  endsOn:   ["end-event-a", "end-event-b"],
  escalation: { action: "escalate", target: "TPA" }
};

test("pending when no startsOn fired", () => {
  const status = computeSLAStatus(SLA, [], "2026-04-25T13:00:00+05:30", "planned");
  assert.equal(status.state, "pending");
  assert.equal(status.startedAt, null);
  assert.equal(status.deadline, null);
  assert.equal(status.endedAt, null);
});

test("active when startsOn fired and now < deadline", () => {
  const interactions = [{
    id: "INT-1", claimRef: "CLM-1",
    timestamp: "2026-04-25T11:00:00+05:30",
    eventName: "start-event",
    initiatingActor: { type: "Hospital", id: "HOS-1" }, respondingActor: null,
    nature: "Interaction", payload: {},
    linkedSLAs: ["SLA-test"]
  }];
  const status = computeSLAStatus(SLA, interactions, "2026-04-25T13:00:00+05:30", "planned");
  assert.equal(status.state, "active");
  assert.equal(status.startedAt, "2026-04-25T11:00:00+05:30");
  assert.equal(status.deadline,  "2026-04-25T15:00:00+05:30");
  assert.equal(status.endedAt, null);
});

test("breached when now >= deadline and no end-event", () => {
  const interactions = [{
    id: "INT-1", claimRef: "CLM-1",
    timestamp: "2026-04-25T11:00:00+05:30",
    eventName: "start-event",
    initiatingActor: { type: "Hospital", id: "HOS-1" }, respondingActor: null,
    nature: "Interaction", payload: {},
    linkedSLAs: ["SLA-test"]
  }];
  const status = computeSLAStatus(SLA, interactions, "2026-04-25T16:00:00+05:30", "planned");
  assert.equal(status.state, "breached");
  assert.equal(status.escalation.target, "TPA");
});

test("completed when end-event fired before deadline", () => {
  const interactions = [
    {
      id: "INT-1", claimRef: "CLM-1",
      timestamp: "2026-04-25T11:00:00+05:30",
      eventName: "start-event",
      initiatingActor: { type: "Hospital", id: "HOS-1" }, respondingActor: null,
      nature: "Interaction", payload: {},
      linkedSLAs: ["SLA-test"]
    },
    {
      id: "INT-2", claimRef: "CLM-1",
      timestamp: "2026-04-25T14:00:00+05:30",
      eventName: "end-event-a",
      initiatingActor: { type: "TPA", id: "TPA-1" }, respondingActor: null,
      nature: "Interaction", payload: {},
      linkedSLAs: []
    }
  ];
  const status = computeSLAStatus(SLA, interactions, "2026-04-25T16:00:00+05:30", "planned");
  assert.equal(status.state, "completed");
  assert.equal(status.endedAt, "2026-04-25T14:00:00+05:30");
});

test("admission-type-aware duration", () => {
  const SLA2 = { ...SLA, duration: undefined,
    durationByAdmissionType: { emergency: "PT4H", planned: "PT12H" } };
  const interactions = [{
    id: "INT-1", claimRef: "CLM-1",
    timestamp: "2026-04-25T11:00:00+05:30",
    eventName: "start-event",
    initiatingActor: { type: "Hospital", id: "HOS-1" }, respondingActor: null,
    nature: "Interaction", payload: {},
    linkedSLAs: ["SLA-test"]
  }];
  const planned   = computeSLAStatus(SLA2, interactions, "2026-04-25T12:00:00+05:30", "planned");
  const emergency = computeSLAStatus(SLA2, interactions, "2026-04-25T12:00:00+05:30", "emergency");
  assert.equal(planned.deadline,   "2026-04-25T23:00:00+05:30");
  assert.equal(emergency.deadline, "2026-04-25T15:00:00+05:30");
});
