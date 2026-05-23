import { cashlessPlannedHappy } from "./cashless-planned-happy";
import type { Scenario } from "./types";

export type { Scenario } from "./types";

export const SCENARIOS: readonly Scenario[] = [cashlessPlannedHappy];
export const DEFAULT_SCENARIO_ID = cashlessPlannedHappy.id;

export function getScenario(id: string): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? cashlessPlannedHappy;
}
