import { describe, it, expect } from "vitest";
import { OWNER_ROLES, ownerHue, ownerLabelKey } from "./owners";

describe("owner-color system", () => {
  it("covers exactly the five parties", () => {
    expect([...OWNER_ROLES].sort()).toEqual(
      ["hospital", "insurer", "patient", "regulator", "tpa"]
    );
  });
  it("gives every role a distinct OKLCH hue token name", () => {
    const hues = OWNER_ROLES.map(ownerHue);
    expect(new Set(hues).size).toBe(OWNER_ROLES.length);
    hues.forEach((h) => expect(h).toMatch(/^var\(--owner-/));
  });
  it("gives every role an i18n label key", () => {
    OWNER_ROLES.forEach((r) => expect(ownerLabelKey(r)).toBe(`owners.${r}`));
  });
});
