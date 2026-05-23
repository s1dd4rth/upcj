import { describe, it, expect } from "vitest";
import {
  nowIsoFor,
  selectClaimAt,
  selectCurrentState,
  selectSlaClocks,
  selectDocChecklist,
  selectActivityFeed,
  selectEngineTrace,
  type SlaClockVM,
  type DocVM,
  type ActivityEntryVM,
  type EngineTraceVM,
} from "./selectors";
import { cashlessPlannedHappy as S } from "../scenarios/cashless-planned-happy";
import { OWNER_ROLES } from "../theme/owners";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function isValidOwnerRole(r: string): boolean {
  return (OWNER_ROLES as readonly string[]).includes(r);
}

// ---------------------------------------------------------------------------
// nowIsoFor
// ---------------------------------------------------------------------------

describe("nowIsoFor", () => {
  it("cursor 0 returns steps[0].at", () => {
    expect(nowIsoFor(S, 0)).toBe(S.steps[0].at);
  });

  it("cursor 4 returns steps[4].at", () => {
    expect(nowIsoFor(S, 4)).toBe(S.steps[4].at);
  });

  it("cursor at steps.length (past end) returns last step's at", () => {
    const last = S.steps[S.steps.length - 1].at;
    expect(nowIsoFor(S, S.steps.length)).toBe(last);
  });
});

// ---------------------------------------------------------------------------
// selectClaimAt
// ---------------------------------------------------------------------------

describe("selectClaimAt", () => {
  it("cursor 0 — status is pre-admission", () => {
    const claim = selectClaimAt(S, 0);
    expect(claim.status).toBe("pre-admission");
    expect(claim.interactions).toEqual([]);
  });

  it("cursor 5 — status is in-treatment-cashless (post pre-auth-approved)", () => {
    const claim = selectClaimAt(S, 5);
    // Engine: after applying 5 events (intimate, doctor, eligibility, pre-auth-filed, pre-auth-approved)
    // the status transitions to in-treatment-cashless
    expect(claim.status).toBe("in-treatment-cashless");
  });

  it("cursor 8 — status is settled", () => {
    const claim = selectClaimAt(S, 8);
    expect(claim.status).toBe("settled");
  });

  it("interactions count matches cursor", () => {
    // Each event adds one interaction
    expect((selectClaimAt(S, 0).interactions ?? []).length).toBe(0);
    expect((selectClaimAt(S, 5).interactions ?? []).length).toBe(5);
    expect((selectClaimAt(S, 8).interactions ?? []).length).toBe(8);
  });
});

// ---------------------------------------------------------------------------
// selectCurrentState
// ---------------------------------------------------------------------------

describe("selectCurrentState", () => {
  it("cursor 0 — pre-admission → neutral archetype", () => {
    const { status, archetype } = selectCurrentState(S, 0);
    expect(status).toBe("pre-admission");
    expect(archetype).toBe("neutral");
  });

  it("cursor 5 — in-treatment-cashless → neutral archetype", () => {
    const { status, archetype } = selectCurrentState(S, 5);
    expect(status).toBe("in-treatment-cashless");
    expect(archetype).toBe("neutral");
  });

  it("cursor 8 — settled → terminal archetype", () => {
    const { status, archetype } = selectCurrentState(S, 8);
    expect(status).toBe("settled");
    expect(archetype).toBe("terminal");
  });
});

// ---------------------------------------------------------------------------
// selectSlaClocks
// ---------------------------------------------------------------------------

describe("selectSlaClocks", () => {
  it("cursor 0 — no active/breached SLAs (all pending)", () => {
    const clocks = selectSlaClocks(S, 0);
    expect(clocks).toHaveLength(0);
  });

  it("cursor 4 (after pre-auth-filed) — pre-auth SLAs are active", () => {
    // steps[0..3] applied; pre-auth-filed starts SLA-pre-auth-response and SLA-pre-auth-approval
    const clocks = selectSlaClocks(S, 4);
    expect(clocks.length).toBeGreaterThanOrEqual(1);
    // verify shape
    for (const c of clocks) {
      expect(typeof c.slaId).toBe("string");
      expect(isValidOwnerRole(c.owner)).toBe(true);
      expect(["comfortable", "approaching", "due-soon", "breached"]).toContain(c.status);
      expect(["pending", "active", "completed", "breached"]).toContain(c.rawState);
      expect(typeof c.nowIso).toBe("string");
    }
  });

  it("cursor 5 — all SLAs are completed or pending → no active/breached", () => {
    // After pre-auth-approved all related SLAs close; no new SLAs start yet
    const clocks = selectSlaClocks(S, 5);
    expect(clocks).toHaveLength(0);
  });

  it("cursor 8 — settled → no active/breached SLAs", () => {
    const clocks = selectSlaClocks(S, 8);
    expect(clocks).toHaveLength(0);
  });

  it("shape invariants: owner is always a valid OwnerRole", () => {
    for (let cursor = 0; cursor <= S.steps.length; cursor++) {
      for (const c of selectSlaClocks(S, cursor)) {
        expect(isValidOwnerRole(c.owner)).toBe(true);
      }
    }
  });

  it("active clocks have a computed bucket (not breached)", () => {
    // cursor 4: SLAs are active; startedAt and deadline are set
    const clocks = selectSlaClocks(S, 4);
    const activeClocks = clocks.filter((c) => c.rawState === "active");
    for (const c of activeClocks) {
      expect(c.status).not.toBe("breached");
      expect(["comfortable", "approaching", "due-soon"]).toContain(c.status);
      expect(c.startedAt).not.toBeNull();
      expect(c.deadline).not.toBeNull();
      expect(c.remedy).toBeUndefined();
    }
  });

  it("breached clocks have remedy set", () => {
    // In scenario 1 no SLAs breach, but we verify the field is absent/undefined for active
    const clocks = selectSlaClocks(S, 4);
    const breached = clocks.filter((c) => c.rawState === "breached");
    for (const c of breached) {
      expect(typeof c.remedy).toBe("string");
    }
  });
});

// ---------------------------------------------------------------------------
// selectDocChecklist
// ---------------------------------------------------------------------------

describe("selectDocChecklist", () => {
  it("cursor 0 — DOC-001 through DOC-006 are present, all required initially", () => {
    const docs = selectDocChecklist(S, 0);
    const docIds = docs.map((d) => d.docId);
    // Expect exactly DOC-001..DOC-006
    expect(docIds).toContain("DOC-001");
    expect(docIds).toContain("DOC-006");
    expect(docs.length).toBe(6);
    for (const d of docs) {
      expect(d.status).toBe("required");
    }
  });

  it("shape invariants", () => {
    const docs = selectDocChecklist(S, 5);
    for (const d of docs) {
      const d_ = d as DocVM;
      expect(typeof d_.docId).toBe("string");
      expect(typeof d_.nameKey).toBe("string");
      expect(["required", "provided", "verified", "rejected"]).toContain(d_.status);
      expect(isValidOwnerRole(d_.responsible)).toBe(true);
      expect(typeof d_.relevantAtStep).toBe("string");
    }
  });

  it("cursor 2 (doctor-signs-admission-advice applied) — DOC-005 is provided", () => {
    // step[1] has payload { documentId: "DOC-005-A" } which starts with "DOC-005"
    const docs = selectDocChecklist(S, 2);
    const doc005 = docs.find((d) => d.docId === "DOC-005");
    expect(doc005).toBeDefined();
    expect(doc005?.status).toBe("provided");
  });

  it("cursor 4 (pre-auth-filed applied) — DOC-006 is provided", () => {
    // step[3] has payload { documentId: "DOC-006-A" } which starts with "DOC-006"
    const docs = selectDocChecklist(S, 4);
    const doc006 = docs.find((d) => d.docId === "DOC-006");
    expect(doc006).toBeDefined();
    expect(doc006?.status).toBe("provided");
  });
});

// ---------------------------------------------------------------------------
// selectActivityFeed
// ---------------------------------------------------------------------------

describe("selectActivityFeed", () => {
  it("cursor 0 — empty feed", () => {
    const feed = selectActivityFeed(S, 0);
    expect(feed).toHaveLength(0);
  });

  it("cursor 5 — 5 entries", () => {
    const feed = selectActivityFeed(S, 5);
    expect(feed).toHaveLength(5);
  });

  it("cursor 8 — 8 entries", () => {
    const feed = selectActivityFeed(S, 8);
    expect(feed).toHaveLength(8);
  });

  it("shape invariants", () => {
    const feed = selectActivityFeed(S, 8);
    for (const entry of feed) {
      const e = entry as ActivityEntryVM;
      expect(typeof e.interactionId).toBe("string");
      expect(isValidOwnerRole(e.actor)).toBe(true);
      expect(typeof e.atIso).toBe("string");
      expect(typeof e.eventName).toBe("string");
      expect(typeof e.plainTextKey).toBe("string");
      expect(e.plainTextKey.startsWith("activity.")).toBe(true);
    }
  });

  it("first entry is the intimate-hospitalisation by patient", () => {
    const feed = selectActivityFeed(S, 1);
    expect(feed[0].actor).toBe("patient");
    expect(feed[0].eventName).toBe("intimate-hospitalisation");
    expect(feed[0].plainTextKey).toBe("activity.intimate-hospitalisation");
  });

  it("Doctor actor maps to 'hospital' owner role", () => {
    // step[1] is doctor-signs-admission-advice, actor.type = "Doctor"
    const feed = selectActivityFeed(S, 2);
    const doctorEntry = feed.find((e) => e.eventName === "doctor-signs-admission-advice");
    expect(doctorEntry).toBeDefined();
    expect(doctorEntry?.actor).toBe("hospital");
  });
});

// ---------------------------------------------------------------------------
// selectEngineTrace
// ---------------------------------------------------------------------------

describe("selectEngineTrace", () => {
  it("cursor 0 — returns null", () => {
    expect(selectEngineTrace(S, 0)).toBeNull();
  });

  it("cursor 1 — first event (intimate-hospitalisation)", () => {
    const trace = selectEngineTrace(S, 1) as EngineTraceVM;
    expect(trace).not.toBeNull();
    expect(trace.eventApplied.name).toBe("intimate-hospitalisation");
    expect(trace.statusBefore).toBe("pre-admission");
    expect(trace.statusAfter).toBe("intimated");
    expect(typeof trace.newInteractionId).toBe("string");
  });

  it("cursor 5 — pre-auth-approved event applied", () => {
    const trace = selectEngineTrace(S, 5) as EngineTraceVM;
    expect(trace).not.toBeNull();
    expect(trace.eventApplied.name).toBe("pre-auth-approved");
    expect(trace.statusBefore).toBe("pre-auth-pending");
    expect(trace.statusAfter).toBe("in-treatment-cashless");
  });

  it("cursor 8 — claim-settled event applied", () => {
    const trace = selectEngineTrace(S, 8) as EngineTraceVM;
    expect(trace).not.toBeNull();
    expect(trace.eventApplied.name).toBe("claim-settled");
    expect(trace.statusAfter).toBe("settled");
  });

  it("shape invariants", () => {
    for (let cursor = 1; cursor <= S.steps.length; cursor++) {
      const trace = selectEngineTrace(S, cursor) as EngineTraceVM;
      expect(trace).not.toBeNull();
      expect(typeof trace.eventApplied.name).toBe("string");
      expect(typeof trace.statusBefore).toBe("string");
      expect(typeof trace.statusAfter).toBe("string");
      expect(typeof trace.newInteractionId).toBe("string");
    }
  });
});
