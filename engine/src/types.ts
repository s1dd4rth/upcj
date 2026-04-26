// Public type definitions. Mirror the JSON Schemas in spec/schemas/.

export type ValidationError = { path: string; message: string; schemaPath: string };

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: ValidationError[] };

export type SchemaName =
  | "claim" | "document" | "document-instance" | "deduction"
  | "step" | "sla" | "interaction" | "query" | "grievance"
  | "lifecycle" | "events" | "coverage";

export type ActorType = "Patient" | "Doctor" | "Hospital" | "ManagedCare" | "TPA" | "Insurer";

export type ActorReference = { type: ActorType; id: string };

export type ClaimStatus =
  | "pre-admission" | "intimated" | "admission-advised"
  | "in-treatment-cashless" | "in-treatment-reimbursement"
  | "pre-auth-pending" | "discharged" | "in-adjudication"
  | "in-query" | "awaiting-patient-action"
  | "settled" | "partially-settled"
  | "withdrawn" | "closed-without-settlement" | "rejected";

export type ClaimPath  = "undecided" | "cashless" | "reimbursement";

export type AdmissionType = "planned" | "emergency";

export type StepId =
  | "1.1" | "1.2" | "1.3"
  | "A.1" | "A.2" | "A.3" | "A.4" | "A.5"
  | "B.1" | "B.2" | "B.3" | "B.4" | "B.5"
  | "3.1" | "3.2" | "3.3" | "3.4";

export type Deduction = {
  amount: number;
  reason: string;
  category?: "room-rent-cap" | "sub-limit" | "co-pay" | "non-payable" | "exclusion" | "other";
};

export type DocumentInstance = {
  id: string;
  registryRef: string;
  validated?: boolean;
  collectedAt?: string;
  isOriginal?: boolean;
};

export type Interaction = {
  id: string;
  claimRef: string;
  timestamp: string;
  eventName: string;
  initiatingActor: ActorReference;
  respondingActor: ActorReference | null;
  nature: "Interaction" | "Document" | "Query" | "Grievance";
  payload: Record<string, unknown>;
  linkedSLAs: string[];
  outOfOrder?: boolean;
};

export type Query = {
  id: string;
  claimRef: string;
  raisedAt: string;
  directedTo: "Hospital" | "Patient";
  pathContext?: "cashless" | "reimbursement";
  description?: string;
  documentsRequested?: string[];
  respondedAt?: string;
  documentsSubmitted?: string[];
  status: "open" | "responded" | "resolved" | "escalated";
};

export type Grievance = {
  id: string;
  claimRef: string;
  raisedAt: string;
  level: 1 | 2 | 3;
  status: "open" | "acknowledged" | "resolved" | "escalated";
  raisedAgainst: "Hospital" | "TPA" | "Insurer";
  citedSLAs?: string[];
};

export type Claim = {
  id: string;
  specVersion: "v1";
  status: ClaimStatus;
  path: ClaimPath;
  admissionType: AdmissionType;
  currentStep?: StepId;
  intimationDate?: string;
  admissionDate?: string;
  dischargeDate?: string;
  amounts?: {
    claimed?: number;
    approved?: number;
    settled?: number;
    deductions?: Deduction[];
  };
  patientId: string;
  policyId: string;
  hospitalId?: string;
  doctorId?: string;
  tpaId?: string;
  insurerId?: string;
  documents?: DocumentInstance[];
  interactions?: Interaction[];
  queries?: Query[];
  grievances?: Grievance[];
};

export type Event = {
  name: string;
  payload: Record<string, unknown>;
  at: string;
  actor: ActorReference;
};

export type AdvanceError =
  | { kind: "claim-invalid";          errors: ValidationError[] }
  | { kind: "event-unknown";          eventName: string }
  | { kind: "payload-invalid";        eventName: string; errors: ValidationError[] }
  | { kind: "transition-illegal";     currentState: string; eventName: string }
  | { kind: "spec-version-mismatch";  expected: string; actual: string };

export type AdvanceResult =
  | { ok: true; claim: Claim; interactions: Interaction[] }
  | { ok: false; error: AdvanceError };

export type ReplayResult =
  | { ok: true; claim: Claim; interactions: Interaction[] }
  | { ok: false; error: AdvanceError; processedCount: number };

export type SLAStatus = {
  id: string;
  state: "pending" | "active" | "completed" | "breached";
  startedAt: string | null;
  deadline: string | null;
  endedAt: string | null;
  escalation?: { action: string; target: string };
};
