import type { Scenario } from "./types";
import type { Claim, Event } from "../engine-adapter";

const seedClaim: Claim = {
  id: "CLM-DEMO-CASHLESS-PLANNED-HAPPY",
  specVersion: "v1",
  status: "pre-admission",
  path: "undecided",
  admissionType: "planned",
  patientId: "PAT-DEMO-1",
  policyId: "POL-DEMO-1",
  hospitalId: "HOS-MAX-SAKET",
  tpaId: "TPA-MEDI-ASSIST",
  insurerId: "INS-STAR-HEALTH",
  interactions: [],
} as Claim;

const steps: Event[] = [
  {
    name: "intimate-hospitalisation",
    payload: { method: "phone", tpaReferenceNumber: "TPA-REF-DEMO-001" },
    at: "2026-04-20T09:00:00.000Z",
    actor: { type: "Patient", id: "PAT-DEMO-1" },
  },
  {
    name: "doctor-signs-admission-advice",
    payload: { documentId: "DOC-005-A" },
    at: "2026-04-20T10:00:00.000Z",
    actor: { type: "Doctor", id: "DOC-DEMO-1" },
  },
  {
    name: "cashless-eligibility-confirmed",
    payload: {},
    at: "2026-04-20T10:30:00.000Z",
    actor: { type: "TPA", id: "TPA-MEDI-ASSIST" },
  },
  {
    name: "pre-auth-filed",
    payload: { filedBy: "Hospital", documentId: "DOC-006-A" },
    at: "2026-04-20T11:00:00.000Z",
    actor: { type: "Hospital", id: "HOS-MAX-SAKET" },
  },
  {
    name: "pre-auth-approved",
    payload: { approvedAmount: 100000 },
    at: "2026-04-20T14:00:00.000Z",
    actor: { type: "TPA", id: "TPA-MEDI-ASSIST" },
  },
  {
    name: "patient-discharged",
    payload: { dischargeDate: "2026-04-25T12:00:00.000Z" },
    at: "2026-04-25T12:00:00.000Z",
    actor: { type: "Hospital", id: "HOS-MAX-SAKET" },
  },
  // discharge-bill-finalised moves claim from "discharged" -> "in-adjudication"
  // required by the lifecycle before claim-settled can be applied
  {
    name: "discharge-bill-finalised",
    payload: {},
    at: "2026-04-25T15:00:00.000Z",
    actor: { type: "Hospital", id: "HOS-MAX-SAKET" },
  },
  {
    name: "claim-settled",
    payload: { settledAmount: 95000 },
    at: "2026-04-28T10:00:00.000Z",
    actor: { type: "TPA", id: "TPA-MEDI-ASSIST" },
  },
];

export const cashlessPlannedHappy: Scenario = {
  id: "cashless-planned-happy",
  titleKey: "scenarios.cashlessPlannedHappy.title",
  summaryKey: "scenarios.cashlessPlannedHappy.summary",
  teachesKey: "scenarios.cashlessPlannedHappy.teaches",
  seedClaim,
  steps,
  expectedTerminalStatus: "settled",
  expectedInteractionCount: 8,
};
