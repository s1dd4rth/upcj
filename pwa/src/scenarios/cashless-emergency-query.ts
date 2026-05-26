import type { Scenario } from "./types";
import type { Claim, Event } from "../engine-adapter";

const seedClaim: Claim = {
  id: "CLM-DEMO-CASHLESS-EMERGENCY-QUERY",
  specVersion: "v1",
  status: "pre-admission",
  path: "undecided",
  admissionType: "emergency",
  patientId: "PAT-DEMO-2",
  policyId: "POL-DEMO-1",
  hospitalId: "HOS-MAX-SAKET",
  tpaId: "TPA-MEDI-ASSIST",
  insurerId: "INS-STAR-HEALTH",
  interactions: [],
} as Claim;

const steps: Event[] = [
  // Emergency admission — intimated at midnight
  {
    name: "intimate-hospitalisation",
    payload: { method: "phone", tpaReferenceNumber: "TPA-REF-DEMO-002" },
    at: "2026-05-10T00:00:00.000Z",
    actor: { type: "Patient", id: "PAT-DEMO-2" },
  },
  // Doctor signs advice +30 min
  {
    name: "doctor-signs-admission-advice",
    payload: { documentId: "DOC-005-B" },
    at: "2026-05-10T00:30:00.000Z",
    actor: { type: "Doctor", id: "DOC-DEMO-2" },
  },
  // TPA confirms cashless eligibility +1h
  {
    name: "cashless-eligibility-confirmed",
    payload: {},
    at: "2026-05-10T01:00:00.000Z",
    actor: { type: "TPA", id: "TPA-MEDI-ASSIST" },
  },
  // Hospital files pre-auth +1.5h
  {
    name: "pre-auth-filed",
    payload: { filedBy: "Hospital", documentId: "DOC-006-B" },
    at: "2026-05-10T01:30:00.000Z",
    actor: { type: "Hospital", id: "HOS-MAX-SAKET" },
  },
  // TPA approves pre-auth +2h
  {
    name: "pre-auth-approved",
    payload: { approvedAmount: 175000 },
    at: "2026-05-10T02:00:00.000Z",
    actor: { type: "TPA", id: "TPA-MEDI-ASSIST" },
  },
  // Patient discharged 6 days later
  {
    name: "patient-discharged",
    payload: { dischargeDate: "2026-05-16T12:00:00.000Z" },
    at: "2026-05-16T12:00:00.000Z",
    actor: { type: "Hospital", id: "HOS-MAX-SAKET" },
  },
  // Hospital finalises discharge bill +3h
  {
    name: "discharge-bill-finalised",
    payload: {},
    at: "2026-05-16T15:00:00.000Z",
    actor: { type: "Hospital", id: "HOS-MAX-SAKET" },
  },
  // TPA raises a query while reviewing the bill (claim now in-adjudication → in-query)
  {
    name: "query-raised",
    payload: { queryId: "QRY-DEMO-001", directedTo: "Hospital" },
    at: "2026-05-16T17:00:00.000Z",
    actor: { type: "TPA", id: "TPA-MEDI-ASSIST" },
  },
  // Hospital resolves the query +2h (claim returns to in-adjudication)
  {
    name: "query-resolved",
    payload: {},
    at: "2026-05-16T19:00:00.000Z",
    actor: { type: "Hospital", id: "HOS-MAX-SAKET" },
  },
  // TPA settles the claim 3 days later
  {
    name: "claim-settled",
    payload: { settledAmount: 170000 },
    at: "2026-05-19T10:00:00.000Z",
    actor: { type: "TPA", id: "TPA-MEDI-ASSIST" },
  },
];

export const cashlessEmergencyQuery: Scenario = {
  id: "cashless-emergency-query",
  titleKey: "scenarios.cashlessEmergencyQuery.title",
  summaryKey: "scenarios.cashlessEmergencyQuery.summary",
  teachesKey: "scenarios.cashlessEmergencyQuery.teaches",
  seedClaim,
  steps,
  expectedTerminalStatus: "settled",
  expectedInteractionCount: 10,
};
