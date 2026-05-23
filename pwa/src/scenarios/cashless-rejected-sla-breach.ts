import type { Scenario } from "./types";
import type { Claim, Event } from "../engine-adapter";

// T0: pre-auth filed 2026-05-10T09:00:00Z
// SLA-pre-auth-response (planned) = PT12H → deadline 2026-05-10T21:00:00Z
// pre-auth-rejected at T0+16h = 2026-05-11T01:00:00Z → SLA breached

const seedClaim: Claim = {
  id: "CLM-DEMO-CASHLESS-REJECTED-SLA-BREACH",
  specVersion: "v1",
  status: "pre-admission",
  path: "undecided",
  admissionType: "planned",
  patientId: "PAT-DEMO-4",
  policyId: "POL-DEMO-2",
  hospitalId: "HOS-APOLLO-DELHI",
  tpaId: "TPA-PARAMOUNT",
  insurerId: "INS-ORIENTAL",
  interactions: [],
} as Claim;

const steps: Event[] = [
  // 1. Patient intimates hospitalisation
  {
    name: "intimate-hospitalisation",
    payload: { method: "online-portal", tpaReferenceNumber: "TPA-REF-DEMO-004" },
    at: "2026-05-10T07:00:00.000Z",
    actor: { type: "Patient", id: "PAT-DEMO-4" },
  },
  // 2. Doctor signs admission advice
  {
    name: "doctor-signs-admission-advice",
    payload: { documentId: "DOC-005-D" },
    at: "2026-05-10T08:00:00.000Z",
    actor: { type: "Doctor", id: "DOC-DEMO-4" },
  },
  // 3. TPA confirms cashless eligibility → in-treatment-cashless
  {
    name: "cashless-eligibility-confirmed",
    payload: {},
    at: "2026-05-10T08:30:00.000Z",
    actor: { type: "TPA", id: "TPA-PARAMOUNT" },
  },
  // 4. Hospital files pre-auth — T0 = 2026-05-10T09:00:00Z
  //    SLA-pre-auth-response (planned, PT12H) deadline = 2026-05-10T21:00:00Z
  {
    name: "pre-auth-filed",
    payload: { filedBy: "Hospital", documentId: "DOC-006-D" },
    at: "2026-05-10T09:00:00.000Z",
    actor: { type: "Hospital", id: "HOS-APOLLO-DELHI" },
  },
  // 5. TPA rejects pre-auth at T0+16h = 2026-05-11T01:00:00Z
  //    SLA deadline was 2026-05-10T21:00:00Z → SLA-pre-auth-response is BREACHED
  //    Lifecycle: pre-auth-pending → in-treatment-reimbursement
  {
    name: "pre-auth-rejected",
    payload: { reason: "Treatment not covered under policy exclusions" },
    at: "2026-05-11T01:00:00.000Z",
    actor: { type: "TPA", id: "TPA-PARAMOUNT" },
  },
  // 6. Patient discharged — stays in reimbursement path
  {
    name: "patient-discharged",
    payload: { dischargeDate: "2026-05-15T12:00:00.000Z" },
    at: "2026-05-15T12:00:00.000Z",
    actor: { type: "Hospital", id: "HOS-APOLLO-DELHI" },
  },
  // 7. Patient submits claim form → discharged → in-adjudication
  {
    name: "claim-form-submitted",
    payload: { documentId: "DOC-013-B" },
    at: "2026-05-17T10:00:00.000Z",
    actor: { type: "Patient", id: "PAT-DEMO-4" },
  },
  // 8. Insurer rejects the claim after adjudication → in-adjudication → rejected
  {
    name: "claim-rejected",
    payload: { reason: "Treatment not covered under policy exclusions" },
    at: "2026-05-20T14:00:00.000Z",
    actor: { type: "Insurer", id: "INS-ORIENTAL" },
  },
  // 9. Patient files grievance → rejected stays rejected
  {
    name: "grievance-filed",
    payload: { grievanceId: "GRV-DEMO-002", level: 1, raisedAgainst: "Insurer" },
    at: "2026-05-22T09:00:00.000Z",
    actor: { type: "Patient", id: "PAT-DEMO-4" },
  },
  // 10. Insurer acknowledges grievance
  {
    name: "grievance-acknowledged",
    payload: {},
    at: "2026-05-23T11:00:00.000Z",
    actor: { type: "Insurer", id: "INS-ORIENTAL" },
  },
  // 11. Patient escalates grievance to next level
  {
    name: "grievance-escalated",
    payload: {},
    at: "2026-06-07T10:00:00.000Z",
    actor: { type: "Patient", id: "PAT-DEMO-4" },
  },
];

export const cashlessRejectedSlaBreach: Scenario = {
  id: "cashless-rejected-sla-breach",
  titleKey: "scenarios.cashlessRejectedSlaBreach.title",
  summaryKey: "scenarios.cashlessRejectedSlaBreach.summary",
  teachesKey: "scenarios.cashlessRejectedSlaBreach.teaches",
  seedClaim,
  steps,
  expectedTerminalStatus: "rejected",
  expectedInteractionCount: 11,
};
