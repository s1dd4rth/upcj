import { describe, it, expect } from "vitest";
import { adapter } from "../engine-adapter";
import { SCENARIOS } from "./index";

describe("scenario conformance", () => {
  for (const s of SCENARIOS) {
    it(`${s.id}: replays cleanly to ${s.expectedTerminalStatus}`, () => {
      const r = adapter.replay(s.seedClaim, s.steps);
      expect(r.ok, !r.ok ? JSON.stringify((r as { error: unknown }).error) : "").toBe(true);
      if (r.ok) {
        expect(r.claim.status).toBe(s.expectedTerminalStatus);
        expect(r.claim.interactions.length).toBe(s.expectedInteractionCount);
      }
    });

    it(`${s.id}: every prefix replays without error (steppable)`, () => {
      for (let i = 0; i <= s.steps.length; i++) {
        const r = adapter.replay(s.seedClaim, s.steps.slice(0, i));
        expect(r.ok, `prefix ${i}: ${!r.ok ? JSON.stringify((r as { error: unknown }).error) : ""}`).toBe(true);
      }
    });
  }
});
