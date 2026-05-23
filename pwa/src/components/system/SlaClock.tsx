import { useTranslation } from "react-i18next";
import type { SlaClockVM } from "../../state/selectors";
import { ownerHue, ownerLabelKey } from "../../theme/owners";

export interface SlaClockProps {
  vm: SlaClockVM;
  precise?: boolean;
}

function formatDeadline(isoOrNull: string | null): string {
  if (!isoOrNull) return "—";
  try {
    return new Date(isoOrNull).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return isoOrNull;
  }
}

/** Returns total milliseconds between two ISO strings (positive = a is before b). */
function msDiff(a: string, b: string): number {
  return new Date(b).getTime() - new Date(a).getTime();
}

function formatDuration(ms: number): string {
  const absMs = Math.abs(ms);
  const totalMinutes = Math.floor(absMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

/** Width % for the urgency bar (0–100). Returns null if bar should be hidden. */
function urgencyWidth(vm: SlaClockVM): number | null {
  if (vm.status === "breached") return null;
  if (!vm.startedAt || !vm.deadline) return 5;

  const total = new Date(vm.deadline).getTime() - new Date(vm.startedAt).getTime();
  if (total <= 0) return 95;
  const elapsed = (new Date(vm.nowIso).getTime() - new Date(vm.startedAt).getTime()) / total;
  return Math.min(Math.max(elapsed * 100, 2), 98);
}

export function SlaClock({ vm, precise = false }: SlaClockProps): React.ReactElement {
  const { t } = useTranslation();

  const ownerLabel = t(ownerLabelKey(vm.owner));
  const deadlineFormatted = formatDeadline(vm.deadline);

  // ── Precise (dev) mode ──────────────────────────────────────────────────
  if (precise) {
    const remainingMs = vm.deadline
      ? msDiff(vm.nowIso, vm.deadline)
      : null;

    let preciseText: string;
    if (remainingMs === null) {
      preciseText = "No deadline set";
    } else if (remainingMs >= 0) {
      preciseText = `${formatDuration(remainingMs)} left`;
    } else {
      preciseText = `Breached by ${formatDuration(remainingMs)}`;
    }

    return (
      <details data-bucket={vm.status} data-precise>
        <summary>{preciseText}</summary>
        <dl>
          <dt>Started</dt><dd>{vm.startedAt ?? "—"}</dd>
          <dt>Deadline</dt><dd>{vm.deadline ?? "—"}</dd>
          <dt>Now</dt><dd>{vm.nowIso}</dd>
        </dl>
      </details>
    );
  }

  // ── Default (product/demo) mode ─────────────────────────────────────────
  let phrase: string;
  if (vm.status === "comfortable") {
    phrase = t("ui.sla.comfortable", { owner: ownerLabel, when: deadlineFormatted });
  } else if (vm.status === "approaching") {
    phrase = t("ui.sla.approaching", { owner: ownerLabel, when: deadlineFormatted });
  } else if (vm.status === "due-soon") {
    phrase = t("ui.sla.dueSoon", { owner: ownerLabel, when: deadlineFormatted });
  } else {
    // breached
    phrase = t("ui.sla.breached", {
      owner: ownerLabel,
      when: deadlineFormatted,
      remedy: vm.remedy ?? "an escalation path is available",
    });
  }

  const barWidth = urgencyWidth(vm);

  return (
    <div data-bucket={vm.status} className="sla-clock">
      <span
        className="sla-owner-chip"
        data-owner={vm.owner}
        style={{ background: ownerHue(vm.owner) }}
      >
        {ownerLabel}
      </span>
      <span className="sla-phrase">{phrase}</span>
      {barWidth !== null && (
        <div
          className="sla-urgency-track"
          data-urgency-bar
          aria-hidden="true"
        >
          <div
            className="sla-urgency-fill"
            style={{ width: `${barWidth}%` }}
          />
        </div>
      )}
    </div>
  );
}
