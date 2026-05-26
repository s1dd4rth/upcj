import { describe, it, expect } from "vitest";
import { i18n } from "./index";
import enUi from "./en/ui.json";
import hiUi from "./hi/ui.json";
import enScenarios from "./en/scenarios.json";
import hiScenarios from "./hi/scenarios.json";
import enOwners from "./en/owners.json";
import hiOwners from "./hi/owners.json";
import enActivity from "./en/activity.json";
import hiActivity from "./hi/activity.json";
import enLens from "./en/lens.json";
import hiLens from "./hi/lens.json";
import enDesign from "./en/design.json";
import hiDesign from "./hi/design.json";

function flatKeys(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    flatKeys(v, prefix ? `${prefix}.${k}` : k)
  );
}

describe("i18n en catalog", () => {
  it("loads", () => {
    expect(i18n.isInitialized).toBe(true);
    expect(i18n.language).toBe("en");
  });

  it("resolves owner labels for all five roles", () => {
    for (const role of ["patient", "hospital", "tpa", "insurer", "regulator"]) {
      const t = i18n.t(`owners.${role}`);
      expect(t).not.toBe(`owners.${role}`);
      expect(t.length).toBeGreaterThan(0);
    }
  });

  it("resolves scenario 1 metadata", () => {
    expect(i18n.t("scenarios.cashlessPlannedHappy.title")).toContain("Cashless");
    expect(i18n.t("scenarios.cashlessPlannedHappy.summary").length).toBeGreaterThan(20);
    expect(i18n.t("scenarios.cashlessPlannedHappy.teaches").length).toBeGreaterThan(20);
  });

  it("resolves state-content for every state scenario 1 visits", () => {
    const states = [
      "pre-admission", "intimated", "admission-advised", "pre-auth-pending",
      "in-treatment-cashless", "discharged", "in-adjudication", "settled",
    ];
    for (const s of states) {
      const headline = i18n.t(`stateContent.${s}.headline`);
      const explanation = i18n.t(`stateContent.${s}.explanation`);
      expect(headline).not.toBe(`stateContent.${s}.headline`);
      expect(explanation).not.toBe(`stateContent.${s}.explanation`);
    }
  });

  it("resolves activity copy for every event scenario 1 uses", () => {
    const events = [
      "intimate-hospitalisation", "doctor-signs-admission-advice",
      "cashless-eligibility-confirmed", "pre-auth-filed", "pre-auth-approved",
      "patient-discharged", "discharge-bill-finalised", "claim-settled",
    ];
    for (const e of events) {
      expect(i18n.t(`activity.${e}`)).not.toBe(`activity.${e}`);
    }
  });

  it("interpolates the SLA breached template", () => {
    const out = i18n.t("ui.sla.breached", {
      owner: "TPA", when: "20 May 2026, 10:30am",
      remedy: "auto-escalate to the Insurer",
    });
    expect(out).toContain("TPA");
    expect(out).toContain("breach");
    expect(out).toContain("auto-escalate to the Insurer");
  });
});

describe("i18n hi catalog completeness", () => {
  const pairs = [
    ["ui", enUi, hiUi],
    ["scenarios", enScenarios, hiScenarios],
    ["owners", enOwners, hiOwners],
    ["activity", enActivity, hiActivity],
    ["lens", enLens, hiLens],
    ["design", enDesign, hiDesign],
  ] as const;

  for (const [name, en, hi] of pairs) {
    it(`hi/${name}.json covers every key from en/${name}.json`, () => {
      const enKeys = flatKeys(en).sort();
      const hiKeys = flatKeys(hi).sort();
      const missing = enKeys.filter((k) => !hiKeys.includes(k));
      expect(missing).toEqual([]);
    });
  }

  it("can switch to Hindi and back", async () => {
    await i18n.changeLanguage("hi");
    expect(i18n.language).toBe("hi");
    expect(i18n.t("owners.hospital")).not.toBe("Hospital");

    await i18n.changeLanguage("en");
    expect(i18n.t("owners.hospital")).toBe("Hospital");
  });

  it("scenarios.cashlessPlannedHappy.title resolves in both languages", async () => {
    await i18n.changeLanguage("en");
    const en = i18n.t("scenarios.cashlessPlannedHappy.title");
    await i18n.changeLanguage("hi");
    const hi = i18n.t("scenarios.cashlessPlannedHappy.title");
    expect(en).not.toBe(hi);
    expect(en.length).toBeGreaterThan(0);
    expect(hi.length).toBeGreaterThan(0);
    // reset for other tests
    await i18n.changeLanguage("en");
  });
});
