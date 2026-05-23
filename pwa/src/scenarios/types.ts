import type { Claim, Event } from "../engine-adapter";

export interface Scenario {
  id: string;                   // url-safe slug, e.g. "cashless-planned-happy"
  titleKey: string;             // i18n key, e.g. "scenarios.cashlessPlannedHappy.title"
  summaryKey: string;
  teachesKey: string;           // "what this scenario demonstrates"
  seedClaim: Claim;
  steps: Event[];               // real engine events; the app replays prefixes
  expectedTerminalStatus: Claim["status"];
  expectedInteractionCount: number;
}
