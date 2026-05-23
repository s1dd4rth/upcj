import { useReducer, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { playbackReducer } from "../state/playback";
import {
  selectClaimAt,
  selectSlaClocks,
  selectAllSlaClocks,
  selectDocChecklist,
  selectActivityFeed,
  selectEngineTrace,
  selectCurrentState,
} from "../state/selectors";
import { getScenario, DEFAULT_SCENARIO_ID, SCENARIOS } from "../scenarios";
import type { ClaimStatus } from "../engine-adapter";

import { AppShell } from "../components/shell/AppShell";
import { Header } from "../components/shell/Header";
import { ScenarioPicker } from "../components/shell/ScenarioPicker";
import { PresenterControls } from "../components/shell/PresenterControls";
import { StateScreen } from "../components/patient/StateScreen";
import { JourneyBar } from "../components/system/JourneyBar";
import { JourneyRail } from "../components/system/JourneyRail";
import { ActivityFeed } from "../components/system/ActivityFeed";
import { DocChecklist } from "../components/system/DocChecklist";
import { EngineTrace } from "../components/system/EngineTrace";
import { EngineView } from "../components/dev/EngineView";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(n: number, max: number): number {
  return Math.max(0, Math.min(n, max));
}

// ---------------------------------------------------------------------------
// DevPage
// ---------------------------------------------------------------------------

export default function DevPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialScenarioId = searchParams.get("scenario") || DEFAULT_SCENARIO_ID;

  const initialCursor = clamp(
    parseInt(searchParams.get("step") ?? "0", 10) || 0,
    getScenario(initialScenarioId).steps.length
  );

  // /dev defaults to manual mode (devs want deliberate stepping)
  const [state, dispatch] = useReducer(playbackReducer, undefined, () => ({
    scenarioId: initialScenarioId,
    cursor: initialCursor,
    mode: "manual" as const,
    speed: 1,
  }));

  const [pickerOpen, setPickerOpen] = useState(false);

  // Sync state back to URL
  useEffect(() => {
    setSearchParams(
      {
        scenario: state.scenarioId,
        step: String(state.cursor),
      },
      { replace: true }
    );
  }, [state.scenarioId, state.cursor, setSearchParams]);

  const scenario = getScenario(state.scenarioId);

  // Compute earliest cursor for each status seen in this scenario.
  const cursorByStatus = useMemo(() => {
    const map: Partial<Record<ClaimStatus, number>> = {};
    for (let c = 0; c <= scenario.steps.length; c++) {
      try {
        const s = selectClaimAt(scenario, c).status;
        if (map[s] === undefined) map[s] = c;
      } catch { /* ignore replay errors */ }
    }
    return map;
  }, [scenario]);

  // Build view model
  let viewModel:
    | {
        claim: ReturnType<typeof selectClaimAt>;
        slaClocks: ReturnType<typeof selectSlaClocks>;
        allSlaClocks: ReturnType<typeof selectAllSlaClocks>;
        docChecklist: ReturnType<typeof selectDocChecklist>;
        activityFeed: ReturnType<typeof selectActivityFeed>;
        engineTrace: ReturnType<typeof selectEngineTrace>;
        currentState: ReturnType<typeof selectCurrentState>;
        fullReplayClaim: ReturnType<typeof selectClaimAt>;
      }
    | null = null;
  let error: string | null = null;

  try {
    const claim = selectClaimAt(scenario, state.cursor);
    const slaClocks = selectSlaClocks(scenario, state.cursor);
    const allSlaClocks = selectAllSlaClocks(scenario, state.cursor);
    const docChecklist = selectDocChecklist(scenario, state.cursor);
    const activityFeed = selectActivityFeed(scenario, state.cursor);
    const engineTrace = selectEngineTrace(scenario, state.cursor);
    const currentState = selectCurrentState(scenario, state.cursor);
    // fullReplayClaim: the terminal state obtained by applying ALL steps one-by-one.
    // Used to verify replay determinism — compares against adapter.replay(seedClaim, allSteps).
    const fullReplayClaim = selectClaimAt(scenario, scenario.steps.length);
    viewModel = { claim, slaClocks, allSlaClocks, docChecklist, activityFeed, engineTrace, currentState, fullReplayClaim };
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
    <>
      <AppShell
        mode="dev"
        header={
          <Header
            mode="demo"
            statusLabel={t(`journey.states.${vm.claim.status}`)}
            mostUrgentSlaPhrase={vm.slaClocks[0]?.deadline ?? undefined}
            scenarioTitle={t(scenario.titleKey)}
            onOpenScenarioPicker={() => setPickerOpen(true)}
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
                mode="demo"
                cursor={state.cursor}
                max={scenario.steps.length}
                playbackMode={state.mode}
                speed={state.speed}
                onNext={() => dispatch({ type: "NEXT" })}
                onBack={() => dispatch({ type: "BACK" })}
                onTogglePlayback={() =>
                  dispatch({
                    type: "SET_MODE",
                    mode: state.mode === "auto" ? "manual" : "auto",
                  })
                }
                onSetSpeed={(speed) => dispatch({ type: "SET_SPEED", speed })}
              />
              {/* EngineView — dev-only, rendered in the Status pane below PresenterControls.
                  Mobile: visible in the Status tab, scrollable below the controls.
                  Cockpit: visible in the center column, below the StateScreen. */}
              <div
                style={{
                  marginTop: "var(--s-6)",
                  borderTop: "1px solid var(--hairline)",
                  paddingTop: "var(--s-4)",
                }}
              >
                <EngineView
                  scenario={scenario}
                  cursor={state.cursor}
                  claim={vm.claim}
                  allSlaClocks={vm.allSlaClocks}
                  engineTrace={vm.engineTrace}
                  fullReplayClaim={vm.fullReplayClaim}
                />
              </div>
            </>
          ),
          activity: <ActivityFeed entries={vm.activityFeed} />,
          docs: <DocChecklist docs={vm.docChecklist} />,
        }}
        engineTrace={<EngineTrace vm={vm.engineTrace} />}
        cockpitRailLeft={
          <JourneyRail
            status={vm.claim.status}
            cursorByStatus={cursorByStatus}
            onJumpToCursor={(cursor) => dispatch({ type: "JUMP", cursor })}
          />
        }
      />
      <ScenarioPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        scenarios={SCENARIOS}
        currentScenarioId={state.scenarioId}
        onChoose={(scenarioId) => {
          dispatch({ type: "LOAD_SCENARIO", scenarioId });
          setPickerOpen(false);
        }}
      />
    </>
  );
}
