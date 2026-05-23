import { cashlessPlannedHappy } from "./cashless-planned-happy";
import { cashlessEmergencyQuery } from "./cashless-emergency-query";
import type { Scenario } from "./types";

export type { Scenario } from "./types";

export const SCENARIOS: readonly Scenario[] = [cashlessPlannedHappy, cashlessEmergencyQuery];
export const DEFAULT_SCENARIO_ID = cashlessPlannedHappy.id;

export function getScenario(id: string): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? cashlessPlannedHappy;
}
