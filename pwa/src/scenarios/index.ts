import { cashlessPlannedHappy } from "./cashless-planned-happy";
import { cashlessEmergencyQuery } from "./cashless-emergency-query";
import { reimbursementDeductionGrievance } from "./reimbursement-deduction-grievance";
import { cashlessRejectedSlaBreach } from "./cashless-rejected-sla-breach";
import type { Scenario } from "./types";

export type { Scenario } from "./types";

export const SCENARIOS: readonly Scenario[] = [cashlessPlannedHappy, cashlessEmergencyQuery, reimbursementDeductionGrievance, cashlessRejectedSlaBreach];
export const DEFAULT_SCENARIO_ID = cashlessPlannedHappy.id;

export function getScenario(id: string): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? cashlessPlannedHappy;
}
