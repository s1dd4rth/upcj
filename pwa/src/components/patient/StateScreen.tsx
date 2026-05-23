import type { Claim, ClaimStatus } from "../../engine-adapter";
import type { SlaClockVM } from "../../state/selectors";
import { STATE_CONTENT } from "./state-content";
import { Neutral } from "./archetypes/Neutral";
import { Waiting } from "./archetypes/Waiting";
import { Settled } from "./terminal/Settled";

interface StateScreenProps {
  status: ClaimStatus;
  claim: Claim;
  slaClocks: SlaClockVM[];
}

function Phase2Fallback() {
  return (
    <div data-archetype="neutral">
      Phase 2 will fill this in.
    </div>
  );
}

export function StateScreen({ status, claim, slaClocks }: StateScreenProps) {
  const entry = STATE_CONTENT[status];

  if (!entry) {
    return <Phase2Fallback />;
  }

  // Filter SLA clocks to the surfaced IDs if specified
  const surfacedClocks =
    entry.surfaceSlaIds && entry.surfaceSlaIds.length > 0
      ? slaClocks.filter((vm) => entry.surfaceSlaIds!.includes(vm.slaId))
      : slaClocks;

  if (entry.archetype === "terminal") {
    const terminalScreen = entry.terminalScreen;

    if (terminalScreen === "settled") {
      return (
        <div data-archetype="terminal" data-terminal-screen="settled">
          <Settled claim={claim} />
        </div>
      );
    }

    // Other terminal screens — Phase 2 fallback
    return (
      <div data-archetype="terminal" data-terminal-screen={terminalScreen ?? "unknown"}>
        <Phase2Fallback />
      </div>
    );
  }

  if (entry.archetype === "waiting") {
    return (
      <div data-archetype="waiting">
        <Waiting entry={entry} slaClocks={surfacedClocks} />
      </div>
    );
  }

  if (entry.archetype === "neutral") {
    return (
      <div data-archetype="neutral">
        <Neutral entry={entry} />
      </div>
    );
  }

  // active or any unknown archetype — Phase 2 fallback
  return <Phase2Fallback />;
}
