import { useTranslation } from "react-i18next";
import type { ClaimStatus } from "../../engine-adapter";

export interface JourneyBarProps {
  status: ClaimStatus;
}

type Phase = "intake" | "admission" | "treatment" | "discharge" | "dialogue" | "closeout";

const PHASES: Phase[] = ["intake", "admission", "treatment", "discharge", "dialogue", "closeout"];

const PHASE_STATUSES: Record<Phase, ClaimStatus[]> = {
  intake:    ["pre-admission", "intimated"],
  admission: ["admission-advised", "pre-auth-pending"],
  treatment: ["in-treatment-cashless", "in-treatment-reimbursement"],
  discharge: ["discharged", "in-adjudication"],
  dialogue:  ["in-query", "awaiting-patient-action"],
  closeout:  ["settled", "partially-settled", "rejected", "withdrawn", "closed-without-settlement"],
};

/** Ordered list of all 15 statuses in journey order. */
const ALL_STATUSES: ClaimStatus[] = PHASES.flatMap((p) => PHASE_STATUSES[p]);

function phaseOf(status: ClaimStatus): Phase {
  for (const phase of PHASES) {
    if ((PHASE_STATUSES[phase] as ClaimStatus[]).includes(status)) return phase;
  }
  return "intake";
}

type PhaseState = "complete" | "current" | "future";

function phaseState(phase: Phase, currentPhase: Phase): PhaseState {
  const phaseIdx = PHASES.indexOf(phase);
  const currentIdx = PHASES.indexOf(currentPhase);
  if (phaseIdx < currentIdx) return "complete";
  if (phaseIdx === currentIdx) return "current";
  return "future";
}

export function JourneyBar({ status }: JourneyBarProps): React.ReactElement {
  const { t } = useTranslation();
  const currentPhase = phaseOf(status);
  const isCloseout = (PHASE_STATUSES.closeout as ClaimStatus[]).includes(status);

  return (
    <div className="journey-bar" data-status={status}>
      <div className="journey-phases" role="list">
        {PHASES.map((phase) => {
          const state = phaseState(phase, currentPhase);
          const isTerminal = phase === "closeout" && isCloseout;
          return (
            <div
              key={phase}
              role="listitem"
              className="journey-phase-segment"
              data-phase={phase}
              data-state={state}
              data-active={state === "current" ? "true" : undefined}
              data-terminal={isTerminal ? "true" : undefined}
            >
              {t(`journey.phases.${phase}`)}
            </div>
          );
        })}
      </div>

      <details className="journey-all-states">
        <summary>{t("journey.showAll")}</summary>
        <ol className="journey-states-list">
          {ALL_STATUSES.map((s) => (
            <li
              key={s}
              data-status-item={s}
              data-current={s === status ? "true" : undefined}
            >
              {t(`journey.states.${s}`)}
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
