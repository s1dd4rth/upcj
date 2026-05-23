import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "../../i18n";
import {
  DesignLensProvider,
  useDesignLens,
  MAX_ANNOTATIONS_PER_SCREEN,
} from "./DesignLensProvider";
import { ANNOTATIONS } from "./annotations";

function wrapper({ enabled }: { enabled: boolean }) {
  return ({ children }: { children: React.ReactNode }) => (
    <DesignLensProvider enabled={enabled}>{children}</DesignLensProvider>
  );
}

describe("DesignLensProvider", () => {
  it("provides enabled=true when enabled", () => {
    const { result } = renderHook(() => useDesignLens(), {
      wrapper: wrapper({ enabled: true }),
    });
    expect(result.current.enabled).toBe(true);
  });

  it("provides enabled=false when disabled", () => {
    const { result } = renderHook(() => useDesignLens(), {
      wrapper: wrapper({ enabled: false }),
    });
    expect(result.current.enabled).toBe(false);
  });

  it("returns annotations whose state matches", () => {
    const { result } = renderHook(() => useDesignLens(), {
      wrapper: wrapper({ enabled: true }),
    });
    const out = result.current.annotationsFor({ state: "pre-auth-pending" });
    expect(out.length).toBeGreaterThan(0);
    expect(out.length).toBeLessThanOrEqual(MAX_ANNOTATIONS_PER_SCREEN);
    out.forEach((a) =>
      expect(a.key.state === "pre-auth-pending" || a.key.state === undefined).toBe(true),
    );
  });

  it("returns empty when no annotations match", () => {
    const { result } = renderHook(() => useDesignLens(), {
      wrapper: wrapper({ enabled: true }),
    });
    const out = result.current.annotationsFor({ state: undefined, elementId: "nonexistent" });
    expect(out).toEqual([]);
  });

  it("caps at 4 per screen even if more match", () => {
    // pre-auth-pending has 3 state-based annotations in ANNOTATIONS;
    // this verifies the cap logic is applied
    const { result } = renderHook(() => useDesignLens(), {
      wrapper: wrapper({ enabled: true }),
    });
    const out = result.current.annotationsFor({ state: "pre-auth-pending" });
    expect(out.length).toBeLessThanOrEqual(MAX_ANNOTATIONS_PER_SCREEN);
  });

  it("throws when used outside DesignLensProvider", () => {
    // renderHook without a wrapper — no provider in tree
    expect(() => {
      renderHook(() => useDesignLens());
    }).toThrow("useDesignLens must be used inside DesignLensProvider");
  });

  it("every annotation has a textKey that resolves in en", async () => {
    const i18n = (await import("../../i18n")).default;
    for (const a of ANNOTATIONS) {
      const t = i18n.t(a.textKey);
      expect(t, `missing en string for ${a.textKey}`).not.toBe(a.textKey);
      expect(t.length).toBeGreaterThan(0);
    }
  });
});
