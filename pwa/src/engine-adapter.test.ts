import { describe, it, expect } from "vitest";
import { adapter } from "./engine-adapter";

describe("engine-adapter", () => {
  it("exposes the engine's spec hash as a non-empty string", () => {
    const h = adapter.specHash();
    expect(typeof h).toBe("string");
    expect(h.length).toBeGreaterThan(0);
  });

  it("returns a known-valid seed Claim", () => {
    const seed = adapter.exampleSeedClaim();
    const v = adapter.validate(seed);
    expect(v.ok, JSON.stringify((v as any).errors)).toBe(true);
  });

  it("replays an empty event list to the seed claim's initial state", () => {
    const seed = adapter.exampleSeedClaim();
    const r = adapter.replay(seed, []);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.claim.status).toBe(seed.status);
    }
  });

  it("evaluateSLAs accepts an asOf timestamp and returns an array", () => {
    const seed = adapter.exampleSeedClaim();
    const slas = adapter.evaluateSLAs(seed, "2026-05-22T00:00:00.000Z");
    expect(Array.isArray(slas)).toBe(true);
  });
});
