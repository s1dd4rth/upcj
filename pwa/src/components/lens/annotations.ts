import type { ClaimStatus } from "../../engine-adapter";

export type Principle =
  | "error-prevention"
  | "clarity"
  | "heuristic-1"
  | "heuristic-2"
  | "heuristic-3"
  | "heuristic-4"
  | "heuristic-5"
  | "heuristic-6"
  | "heuristic-7"
  | "heuristic-8"
  | "heuristic-9"
  | "heuristic-10"
  | "system-design"
  | "data-modeling";

export interface AnnotationKey {
  state?: ClaimStatus;
  elementId?: string;
  step?: { scenarioId: string; cursor: number };
}

export interface Annotation {
  id: string; // url-safe slug; will be used in deep-links (#/design and #/demo?lens=on)
  key: AnnotationKey; // when this annotation applies
  textKey: string; // i18n key for the annotation copy
  principle: Principle;
}

export const ANNOTATIONS: Annotation[] = [
  // pre-admission / intimated — the journey begins
  {
    id: "plain-language-status",
    key: { state: "pre-admission" },
    textKey: "lens.annotations.plain-language-status",
    principle: "clarity",
  },
  {
    id: "no-jargon-headlines",
    key: { state: "intimated" },
    textKey: "lens.annotations.no-jargon-headlines",
    principle: "heuristic-2", // Match between system and real world
  },

  // pre-auth-pending — the SLA story
  {
    id: "sla-with-owner-and-remedy",
    key: { state: "pre-auth-pending" },
    textKey: "lens.annotations.sla-with-owner-and-remedy",
    principle: "heuristic-1", // Visibility of system status (extended with ownership + remedy)
  },
  {
    id: "bounded-not-precise",
    key: { state: "pre-auth-pending" },
    textKey: "lens.annotations.bounded-not-precise",
    principle: "error-prevention",
  },
  {
    id: "no-progress-without-data",
    key: { state: "pre-auth-pending" },
    textKey: "lens.annotations.no-progress-without-data",
    principle: "data-modeling",
  },

  // in-treatment-cashless — the "nothing to do" affordance
  {
    id: "nothing-to-do-is-a-design-choice",
    key: { state: "in-treatment-cashless" },
    textKey: "lens.annotations.nothing-to-do-is-a-design-choice",
    principle: "error-prevention",
  },

  // in-query — the waiting state with ownership
  {
    id: "waiting-with-ownership",
    key: { state: "in-query" },
    textKey: "lens.annotations.waiting-with-ownership",
    principle: "heuristic-1",
  },

  // awaiting-patient-action — the Active archetype
  {
    id: "active-archetype-recedes-everything-else",
    key: { state: "awaiting-patient-action" },
    textKey: "lens.annotations.active-archetype-recedes-everything-else",
    principle: "heuristic-8", // Aesthetic & minimalist design
  },

  // settled — the settlement statement
  {
    id: "statement-not-hero-metric",
    key: { state: "settled" },
    textKey: "lens.annotations.statement-not-hero-metric",
    principle: "clarity",
  },
  {
    id: "indian-numerals-and-dates",
    key: { state: "settled" },
    textKey: "lens.annotations.indian-numerals-and-dates",
    principle: "heuristic-2",
  },

  // partially-settled — the grievance route is recourse
  {
    id: "grievance-as-recourse",
    key: { state: "partially-settled" },
    textKey: "lens.annotations.grievance-as-recourse",
    principle: "system-design",
  },
  {
    id: "deductions-itemised-not-summarised",
    key: { state: "partially-settled" },
    textKey: "lens.annotations.deductions-itemised-not-summarised",
    principle: "clarity",
  },

  // rejected — the careful tone
  {
    id: "rejection-without-alarm-red",
    key: { state: "rejected" },
    textKey: "lens.annotations.rejection-without-alarm-red",
    principle: "heuristic-10", // Help & documentation
  },
  {
    id: "breach-is-clay-not-red",
    key: { state: "rejected" },
    textKey: "lens.annotations.breach-is-clay-not-red",
    principle: "clarity",
  },

  // withdrawn — quiet closure
  {
    id: "withdrawal-is-first-class",
    key: { state: "withdrawn" },
    textKey: "lens.annotations.withdrawal-is-first-class",
    principle: "data-modeling",
  },

  // system-design / data-modeling annotations that aren't tied to a single state
  {
    id: "replay-as-source-of-truth",
    key: { elementId: "engine-trace" },
    textKey: "lens.annotations.replay-as-source-of-truth",
    principle: "data-modeling",
  },
  {
    id: "events-not-guards",
    key: { elementId: "engine-trace" },
    textKey: "lens.annotations.events-not-guards",
    principle: "data-modeling",
  },
  {
    id: "deterministic-interaction-ids",
    key: { elementId: "engine-trace" },
    textKey: "lens.annotations.deterministic-interaction-ids",
    principle: "data-modeling",
  },
  {
    id: "owner-colors-as-cross-component-motif",
    key: { elementId: "owner-chip" },
    textKey: "lens.annotations.owner-colors-as-cross-component-motif",
    principle: "system-design",
  },
];
