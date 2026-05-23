import { describe, it, expect } from "vitest";
import { i18n } from "./index";

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
