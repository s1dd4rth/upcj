import { useTranslation } from "react-i18next";
import type { ClaimStatus } from "../../engine-adapter";

export interface JourneyRailProps {
  /** Currently selected status (current cursor's claim status). */
  status: ClaimStatus;
  /**
   * Maps ClaimStatus → the earliest cursor at which that status was reached.
   * Absent entries = not yet reached = inert (cannot click).
   */
  cursorByStatus: Partial<Record<ClaimStatus, number>>;
  onJumpToCursor: (cursor: number) => void;
}

// ---------------------------------------------------------------------------
// Phase / state layout — mirrors JourneyBar's grouping
// ---------------------------------------------------------------------------

type Phase = "intake" | "admission" | "treatment" | "discharge" | "dialogue" | "closeout";

const PHASES: Phase[] = [
  "intake",
  "admission",
  "treatment",
  "discharge",
  "dialogue",
  "closeout",
];

const PHASE_STATUSES: Record<Phase, ClaimStatus[]> = {
  intake:    ["pre-admission", "intimated"],
  admission: ["admission-advised", "pre-auth-pending"],
  treatment: ["in-treatment-cashless", "in-treatment-reimbursement"],
  discharge: ["discharged", "in-adjudication"],
  dialogue:  ["in-query", "awaiting-patient-action"],
  closeout:  ["settled", "partially-settled", "rejected", "withdrawn", "closed-without-settlement"],
};

const ALL_STATUSES: ClaimStatus[] = PHASES.flatMap((p) => PHASE_STATUSES[p]);

/** Index of a status in the ordered list — used to determine "before / after current". */
const STATUS_ORDER: Record<ClaimStatus, number> = Object.fromEntries(
  ALL_STATUSES.map((s, i) => [s, i])
) as Record<ClaimStatus, number>;

// ---------------------------------------------------------------------------
// Terminal state color tokens per status
// ---------------------------------------------------------------------------

const TERMINAL_VAR: Partial<Record<ClaimStatus, string>> = {
  "settled":                  "var(--ok)",
  "partially-settled":        "var(--warn)",
  "rejected":                 "var(--warn)",
  "withdrawn":                "var(--ink-muted)",
  "closed-without-settlement":"var(--ink-muted)",
};

// ---------------------------------------------------------------------------
// JourneyRail
// ---------------------------------------------------------------------------

export function JourneyRail({
  status: currentStatus,
  cursorByStatus,
  onJumpToCursor,
}: JourneyRailProps): React.ReactElement {
  const { t } = useTranslation();

  const currentIdx = STATUS_ORDER[currentStatus];

  return (
    <nav aria-label={t("journey.rail.label")} className="journey-rail">
      {PHASES.map((phase) => {
        const isCloseoutPhase = phase === "closeout";
        return (
          <section
            key={phase}
            data-phase={phase}
            className="journey-rail-phase"
          >
            <h3 className="journey-rail-phase-label">
              {t(`journey.phases.${phase}`)}
            </h3>
            <ol className="journey-rail-states">
              {PHASE_STATUSES[phase].map((s) => {
                const isCurrent = s === currentStatus;
                const cursor = cursorByStatus[s];
                const isReachable = cursor !== undefined;
                const stateIdx = STATUS_ORDER[s];

                // A state is "complete" if it has been reached AND its index is
                // strictly before the current status index.
                const isComplete = isReachable && stateIdx < currentIdx;

                // Terminal colour override (only in closeout phase, when reached)
                const terminalColor = isCloseoutPhase && isReachable
                  ? TERMINAL_VAR[s]
                  : undefined;

                const indicator = isComplete ? "✓" : "·";

                const innerContent = (
                  <>
                    <span
                      className="journey-rail-dot"
                      aria-hidden="true"
                    >
                      {indicator}
                    </span>
                    <span className="journey-rail-state-label">
                      {t(`journey.states.${s}`)}
                    </span>
                  </>
                );

                const sharedProps = {
                  "data-state": s,
                  "data-active": isCurrent ? "true" : "false",
                  "data-reachable": isReachable ? "true" : "false",
                  "data-complete": isComplete ? "true" : "false",
                  className: "journey-rail-item",
                  style: terminalColor
                    ? ({ "--terminal-color": terminalColor } as React.CSSProperties)
                    : undefined,
                };

                if (isReachable) {
                  return (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => onJumpToCursor(cursor!)}
                        {...sharedProps}
                      >
                        {innerContent}
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={s}>
                    <div {...sharedProps}>
                      {innerContent}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </nav>
  );
}
