import { useReducer, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { playbackReducer } from "../state/playback";
import {
  selectClaimAt,
  selectSlaClocks,
  selectDocChecklist,
  selectActivityFeed,
  selectEngineTrace,
  selectCurrentState,
} from "../state/selectors";
import { getScenario, DEFAULT_SCENARIO_ID } from "../scenarios";

import { AppShell } from "../components/shell/AppShell";
import { Header } from "../components/shell/Header";
import { StateScreen } from "../components/patient/StateScreen";
import { JourneyBar } from "../components/system/JourneyBar";
import { ActivityFeed } from "../components/system/ActivityFeed";
import { DocChecklist } from "../components/system/DocChecklist";
import { EngineTrace } from "../components/system/EngineTrace";

// ---------------------------------------------------------------------------
// PresenterControls — small inline component for manual step navigation
// ---------------------------------------------------------------------------

interface PresenterControlsProps {
  cursor: number;
  max: number;
  onNext: () => void;
  onBack: () => void;
}

function PresenterControls({ cursor, max, onNext, onBack }: PresenterControlsProps) {
  const { t } = useTranslation();
  return (
    <div className="presenter-controls" data-presenter-controls>
      <button
        type="button"
        onClick={onBack}
        disabled={cursor === 0}
        aria-label={t("ui.actions.back")}
      >
        {t("ui.actions.back")}
      </button>
      <span className="presenter-step-indicator" aria-live="polite">
        {cursor} / {max}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={cursor >= max}
        aria-label={t("ui.actions.next")}
      >
        {t("ui.actions.next")}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// clamp helper
// ---------------------------------------------------------------------------

function clamp(n: number, max: number): number {
  return Math.max(0, Math.min(n, max));
}

// ---------------------------------------------------------------------------
// DemoPage
// ---------------------------------------------------------------------------

export default function DemoPage({ mode = "demo" }: { mode?: "demo" | "product" }) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialScenarioId = searchParams.get("scenario") || DEFAULT_SCENARIO_ID;
  const lens = searchParams.get("lens") === "on";

  const initialCursor = clamp(
    parseInt(searchParams.get("step") ?? "0", 10) || 0,
    getScenario(initialScenarioId).steps.length
  );

  const [state, dispatch] = useReducer(playbackReducer, undefined, () => ({
    scenarioId: initialScenarioId,
    cursor: initialCursor,
    mode: "manual" as const,
    speed: 1,
  }));

  // Sync state back to URL
  useEffect(() => {
    setSearchParams(
      {
        scenario: state.scenarioId,
        step: String(state.cursor),
        ...(lens ? { lens: "on" } : {}),
      },
      { replace: true }
    );
  }, [state.scenarioId, state.cursor, lens, setSearchParams]);

  const scenario = getScenario(state.scenarioId);

  // Build view model — wrap in try/catch so replay failures render an error state
  let viewModel:
    | {
        claim: ReturnType<typeof selectClaimAt>;
        slaClocks: ReturnType<typeof selectSlaClocks>;
        docChecklist: ReturnType<typeof selectDocChecklist>;
        activityFeed: ReturnType<typeof selectActivityFeed>;
        engineTrace: ReturnType<typeof selectEngineTrace>;
        currentState: ReturnType<typeof selectCurrentState>;
      }
    | null = null;
  let error: string | null = null;

  try {
    const claim = selectClaimAt(scenario, state.cursor);
    const slaClocks = selectSlaClocks(scenario, state.cursor);
    const docChecklist = selectDocChecklist(scenario, state.cursor);
    const activityFeed = selectActivityFeed(scenario, state.cursor);
    const engineTrace = selectEngineTrace(scenario, state.cursor);
    const currentState = selectCurrentState(scenario, state.cursor);
    viewModel = { claim, slaClocks, docChecklist, activityFeed, engineTrace, currentState };
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error || !viewModel) {
    return (
      <main data-testid="replay-error">
        <h1>{t("ui.errors.replayFailed")}</h1>
        <pre>{error}</pre>
      </main>
    );
  }

  const vm = viewModel;

  return (
    <AppShell
      mode={mode}
      header={
        <Header
          mode={mode}
          statusLabel={t(`journey.states.${vm.claim.status}`)}
          mostUrgentSlaPhrase={
            vm.slaClocks[0]?.deadline ?? undefined
          }
          scenarioTitle={t(scenario.titleKey)}
          onOpenScenarioPicker={() => {
            /* Task 4.2 */
          }}
        />
      }
      tabs={{
        status: (
          <>
            <StateScreen
              status={vm.claim.status}
              claim={vm.claim}
              slaClocks={vm.slaClocks}
            />
            <JourneyBar status={vm.claim.status} />
            <PresenterControls
              cursor={state.cursor}
              max={scenario.steps.length}
              onNext={() => dispatch({ type: "NEXT" })}
              onBack={() => dispatch({ type: "BACK" })}
            />
          </>
        ),
        activity: <ActivityFeed entries={vm.activityFeed} />,
        docs: <DocChecklist docs={vm.docChecklist} />,
      }}
      engineTrace={mode === "demo" ? <EngineTrace vm={vm.engineTrace} /> : undefined}
    />
  );
}
