import { advance } from "./advance.js";
import type { Claim, Event, ReplayResult, Interaction } from "./types.js";

export function replay(initialClaim: Claim, events: Event[]): ReplayResult {
  let claim = initialClaim;
  const interactions: Interaction[] = [];
  for (let i = 0; i < events.length; i++) {
    const r = advance(claim, events[i]!);
    if (!r.ok) {
      return { ok: false, error: r.error, processedCount: i };
    }
    claim = r.claim;
    interactions.push(...r.interactions);
  }
  return { ok: true, claim, interactions };
}
