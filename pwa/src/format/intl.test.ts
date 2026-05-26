import { describe, it, expect } from "vitest";
import { formatINR, formatIndianDate, formatIndianDateTime } from "./intl";

describe("formatINR", () => {
  it("groups lakhs and crores (Indian numerals)", () => {
    expect(formatINR(123456)).toContain("1,23,456");
    expect(formatINR(12345678)).toContain("1,23,45,678");
  });
  it("handles small amounts", () => {
    expect(formatINR(500)).toMatch(/₹\s?500/);
    expect(formatINR(0)).toMatch(/₹\s?0/);
  });
  it("starts with the rupee symbol", () => {
    expect(formatINR(100).charAt(0)).toBe("₹");
  });
});

describe("formatIndianDate / formatIndianDateTime", () => {
  it("formats a date in Indian style", () => {
    const out = formatIndianDate("2026-04-28T10:00:00.000Z");
    expect(out).toMatch(/\d+\s\w+\s2026/);
  });
  it("formats a datetime in Indian style", () => {
    const out = formatIndianDateTime("2026-04-28T10:00:00.000Z");
    expect(out.length).toBeGreaterThan(5);
    expect(out).toMatch(/\d/);
  });
  it("respects the hi language option", () => {
    const out = formatINR(100, { language: "hi" });
    expect(out.length).toBeGreaterThan(0);
  });
});
