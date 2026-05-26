import type { Scenario } from "./types";
import type { Claim, Event } from "../engine-adapter";

const seedClaim: Claim = {
  id: "CLM-DEMO-REIMB-DEDUCTION-GRIEVANCE",
  specVersion: "v1",
  status: "pre-admission",
  path: "undecided",
  admissionType: "planned",
  patientId: "PAT-DEMO-3",
  policyId: "POL-DEMO-1",
  hospitalId: "HOS-FORTIS-NOIDA",
  tpaId: "TPA-MEDI-ASSIST",
  insurerId: "INS-HDFC-ERGO",
  interactions: [],
} as Claim;

const steps: Event[] = [
  // Patient intimates hospitalisation
  {
    name: "intimate-hospitalisation",
    payload: { method: "online-portal", tpaReferenceNumber: "TPA-REF-DEMO-003" },
    at: "2026-05-01T09:00:00.000Z",
    actor: { type: "Patient", id: "PAT-DEMO-3" },
  },
  // Doctor signs admission advice
  {
    name: "doctor-signs-admission-advice",
    payload: { documentId: "DOC-005-C" },
    at: "2026-05-01T10:00:00.000Z",
    actor: { type: "Doctor", id: "DOC-DEMO-3" },
  },
  // TPA declines cashless — claim enters reimbursement path
  {
    name: "cashless-eligibility-declined",
    payload: {},
    at: "2026-05-01T11:00:00.000Z",
    actor: { type: "TPA", id: "TPA-MEDI-ASSIST" },
  },
  // Patient discharged 5 days later
  {
    name: "patient-discharged",
    payload: { dischargeDate: "2026-05-06T14:00:00.000Z" },
    at: "2026-05-06T14:00:00.000Z",
    actor: { type: "Hospital", id: "HOS-FORTIS-NOIDA" },
  },
  // Patient submits claim form — moves discharged → in-adjudication
  {
    name: "claim-form-submitted",
    payload: { documentId: "DOC-013-A" },
    at: "2026-05-08T10:00:00.000Z",
    actor: { type: "Patient", id: "PAT-DEMO-3" },
  },
  // TPA raises a query directed at the Patient — in-adjudication → in-query
  {
    name: "query-raised",
    payload: { queryId: "QRY-DEMO-002", directedTo: "Patient" },
    at: "2026-05-10T11:00:00.000Z",
    actor: { type: "TPA", id: "TPA-MEDI-ASSIST" },
  },
  // TPA flags that the patient must take action — in-query → awaiting-patient-action
  {
    name: "patient-action-needed",
    payload: {},
    at: "2026-05-10T14:00:00.000Z",
    actor: { type: "TPA", id: "TPA-MEDI-ASSIST" },
  },
  // Patient provides information — awaiting-patient-action → in-adjudication
  {
    name: "query-resolved",
    payload: {},
    at: "2026-05-12T09:00:00.000Z",
    actor: { type: "Patient", id: "PAT-DEMO-3" },
  },
  // Insurer partially settles with deductions — in-adjudication → partially-settled
  {
    name: "claim-partially-settled",
    payload: {
      settledAmount: 75000,
      deductions: [
        { amount: 15000, reason: "Room rent cap exceeded", category: "room-rent-cap" },
        { amount: 10000, reason: "Sub-limit on diagnostics", category: "sub-limit" },
      ],
    },
    at: "2026-05-15T12:00:00.000Z",
    actor: { type: "Insurer", id: "INS-HDFC-ERGO" },
  },
  // Patient files a grievance — partially-settled stays partially-settled
  {
    name: "grievance-filed",
    payload: { grievanceId: "GRV-DEMO-001", level: 1, raisedAgainst: "Insurer" },
    at: "2026-05-17T10:00:00.000Z",
    actor: { type: "Patient", id: "PAT-DEMO-3" },
  },
  // Insurer acknowledges the grievance
  {
    name: "grievance-acknowledged",
    payload: {},
    at: "2026-05-18T09:00:00.000Z",
    actor: { type: "Insurer", id: "INS-HDFC-ERGO" },
  },
  // Insurer resolves the grievance
  {
    name: "grievance-resolved",
    payload: {},
    at: "2026-05-20T15:00:00.000Z",
    actor: { type: "Insurer", id: "INS-HDFC-ERGO" },
  },
];

export const reimbursementDeductionGrievance: Scenario = {
  id: "reimbursement-deduction-grievance",
  titleKey: "scenarios.reimbursementDeductionGrievance.title",
  summaryKey: "scenarios.reimbursementDeductionGrievance.summary",
  teachesKey: "scenarios.reimbursementDeductionGrievance.teaches",
  seedClaim,
  steps,
  expectedTerminalStatus: "partially-settled",
  expectedInteractionCount: 12,
};
