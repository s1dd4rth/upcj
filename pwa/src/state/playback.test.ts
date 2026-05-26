import { describe, it, expect } from "vitest";
import { playbackReducer, initialPlayback, type PlaybackState } from "./playback";
import { cashlessPlannedHappy as S } from "../scenarios/cashless-planned-happy";

describe("playback reducer", () => {
  const init = initialPlayback(S.id);

  it("starts at cursor 0, manual mode, speed 1", () => {
    expect(init.scenarioId).toBe(S.id);
    expect(init.cursor).toBe(0);
    expect(init.mode).toBe("manual");
    expect(init.speed).toBe(1);
  });

  it("NEXT increments cursor, clamped at steps.length", () => {
    let s: PlaybackState = init;
    for (let i = 0; i < S.steps.length + 3; i++) {
      s = playbackReducer(s, { type: "NEXT" });
    }
    expect(s.cursor).toBe(S.steps.length);
  });

  it("BACK decrements, clamped at 0", () => {
    let s = playbackReducer(init, { type: "NEXT" });
    s = playbackReducer(s, { type: "BACK" });
    s = playbackReducer(s, { type: "BACK" });
    expect(s.cursor).toBe(0);
  });

  it("JUMP sets cursor (clamped both sides)", () => {
    expect(playbackReducer(init, { type: "JUMP", cursor: 999 }).cursor).toBe(S.steps.length);
    expect(playbackReducer(init, { type: "JUMP", cursor: -5 }).cursor).toBe(0);
    expect(playbackReducer(init, { type: "JUMP", cursor: 3 }).cursor).toBe(3);
  });

  it("LOAD_SCENARIO resets cursor to 0 by default", () => {
    const moved = playbackReducer(init, { type: "NEXT" });
    const reloaded = playbackReducer(moved, { type: "LOAD_SCENARIO", scenarioId: S.id });
    expect(reloaded.cursor).toBe(0);
    expect(reloaded.scenarioId).toBe(S.id);
  });

  it("LOAD_SCENARIO honors an explicit cursor, clamped to the new scenario's length", () => {
    const r = playbackReducer(init, { type: "LOAD_SCENARIO", scenarioId: S.id, cursor: 999 });
    expect(r.cursor).toBe(S.steps.length);
  });

  it("SET_MODE updates mode only", () => {
    const r = playbackReducer(init, { type: "SET_MODE", mode: "auto" });
    expect(r.mode).toBe("auto");
    expect(r.cursor).toBe(init.cursor);
    expect(r.scenarioId).toBe(init.scenarioId);
  });

  it("SET_SPEED updates speed only", () => {
    const r = playbackReducer(init, { type: "SET_SPEED", speed: 2 });
    expect(r.speed).toBe(2);
    expect(r.mode).toBe(init.mode);
  });
});
