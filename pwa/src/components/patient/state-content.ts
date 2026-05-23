import type { ClaimStatus } from "../../engine-adapter";

export type Archetype = "neutral" | "waiting" | "active" | "terminal";

export type TerminalScreen = "settled" | "partiallySettled" | "rejected" | "closed";

export type ContentTone = "calm" | "urgent" | "info" | "positive" | "mixed" | "heavy" | "quiet";

export interface StateContent {
  archetype: Archetype;
  terminalScreen?: TerminalScreen;
  headlineKey: string;
  explanationKey: string;
  action?: { labelKey: string; kind: "primary" | "secondary" };
  surfaceSlaIds?: string[];
  surfaceDocIds?: string[];
  tone: ContentTone;
}

export const STATE_CONTENT: Partial<Record<ClaimStatus, StateContent>> = {
  "pre-admission": {
    archetype: "neutral",
    headlineKey: "stateContent.pre-admission.headline",
    explanationKey: "stateContent.pre-admission.explanation",
    tone: "quiet",
  },
  "intimated": {
    archetype: "neutral",
    headlineKey: "stateContent.intimated.headline",
    explanationKey: "stateContent.intimated.explanation",
    tone: "calm",
  },
  "admission-advised": {
    archetype: "neutral",
    headlineKey: "stateContent.admission-advised.headline",
    explanationKey: "stateContent.admission-advised.explanation",
    tone: "calm",
  },
  "pre-auth-pending": {
    archetype: "waiting",
    headlineKey: "stateContent.pre-auth-pending.headline",
    explanationKey: "stateContent.pre-auth-pending.explanation",
    surfaceSlaIds: ["SLA-pre-auth-response", "SLA-pre-auth-approval"],
    tone: "calm",
  },
  "in-treatment-cashless": {
    archetype: "neutral",
    headlineKey: "stateContent.in-treatment-cashless.headline",
    explanationKey: "stateContent.in-treatment-cashless.explanation",
    tone: "positive",
  },
  "discharged": {
    archetype: "neutral",
    headlineKey: "stateContent.discharged.headline",
    explanationKey: "stateContent.discharged.explanation",
    surfaceSlaIds: ["SLA-discharge-settlement"],
    tone: "calm",
  },
  "in-adjudication": {
    archetype: "waiting",
    headlineKey: "stateContent.in-adjudication.headline",
    explanationKey: "stateContent.in-adjudication.explanation",
    surfaceSlaIds: ["SLA-discharge-settlement"],
    tone: "calm",
  },
  "settled": {
    archetype: "terminal",
    terminalScreen: "settled",
    headlineKey: "stateContent.settled.headline",
    explanationKey: "stateContent.settled.explanation",
    tone: "positive",
  },
  // Phase 2 fills: in-treatment-reimbursement, in-query, awaiting-patient-action,
  // partially-settled, rejected, withdrawn, closed-without-settlement.
  // The completeness test (it.skip) will be un-skipped in Task 2.4.
};
