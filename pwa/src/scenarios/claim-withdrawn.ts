import type { Scenario } from "./types";
import type { Claim, Event } from "../engine-adapter";

const seedClaim: Claim = {
  id: "CLM-DEMO-CLAIM-WITHDRAWN",
  specVersion: "v1",
  status: "pre-admission",
  path: "undecided",
  admissionType: "planned",
  patientId: "PAT-DEMO-5",
  policyId: "POL-DEMO-1",
  hospitalId: "HOS-APOLLO-DELHI",
  tpaId: "TPA-MEDI-ASSIST",
  insurerId: "INS-STAR-HEALTH",
  interactions: [],
} as Claim;

const steps: Event[] = [
  // Patient intimates hospitalisation for a planned surgery
  {
    name: "intimate-hospitalisation",
    payload: { method: "online-portal", tpaReferenceNumber: "TPA-REF-DEMO-005" },
    at: "2026-05-10T09:00:00.000Z",
    actor: { type: "Patient", id: "PAT-DEMO-5" },
  },
  // Doctor signs admission advice
  {
    name: "doctor-signs-admission-advice",
    payload: { documentId: "DOC-005-E" },
    at: "2026-05-10T10:00:00.000Z",
    actor: { type: "Doctor", id: "DOC-DEMO-5" },
  },
  // Patient withdraws — surgery cancelled, family decided not to proceed
  {
    name: "claim-withdrawn",
    payload: {},
    at: "2026-05-11T08:00:00.000Z",
    actor: { type: "Patient", id: "PAT-DEMO-5" },
  },
];

export const claimWithdrawn: Scenario = {
  id: "claim-withdrawn",
  titleKey: "scenarios.claimWithdrawn.title",
  summaryKey: "scenarios.claimWithdrawn.summary",
  teachesKey: "scenarios.claimWithdrawn.teaches",
  seedClaim,
  steps,
  expectedTerminalStatus: "withdrawn",
  expectedInteractionCount: 3,
};
