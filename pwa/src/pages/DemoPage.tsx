import { useReducer, useEffect, useMemo, useState } from "react";
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
import { DesignLensProvider } from "../components/lens/DesignLensProvider";
import { AnnotationList } from "../components/lens/AnnotationList";
import { MarginCallouts } from "../components/lens/MarginCallouts";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_INTERVAL = 2500; // ms per step at speed 1x (normal motion)

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

  // Lens is driven entirely by the URL param so deep-links work.
  const lensEnabled = searchParams.get("lens") === "on";

  const onToggleLens = () => {
    const next = !lensEnabled;
    const params = new URLSearchParams(searchParams);
    if (next) params.set("lens", "on");
    else params.delete("lens");
    setSearchParams(params, { replace: true });
  };

  const initialCursor = clamp(
    parseInt(searchParams.get("step") ?? "0", 10) || 0,
    getScenario(initialScenarioId).steps.length
  );

  // /demo defaults to auto; /product defaults to manual
  const initialPlaybackMode = mode === "demo" ? "auto" : "manual";

  const [state, dispatch] = useReducer(playbackReducer, undefined, () => ({
    scenarioId: initialScenarioId,
    cursor: initialCursor,
    mode: initialPlaybackMode as "manual" | "auto",
    speed: 1,
  }));

  // Picker open state
  const [pickerOpen, setPickerOpen] = useState(false);

  // Sync playback state back to URL (preserves lens param if present)
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("scenario", state.scenarioId);
        next.set("step", String(state.cursor));
        return next;
      },
      { replace: true }
    );
  }, [state.scenarioId, state.cursor, setSearchParams]);

  const scenario = getScenario(state.scenarioId);

  // Auto-play timer — fires on each step when mode === "auto"
  useEffect(() => {
    if (state.mode !== "auto") return;
    if (state.cursor >= scenario.steps.length) return;

    const reduced =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? (window.matchMedia("(prefers-reduced-motion: reduce)").matches ?? false)
        : false;
    const base = reduced ? BASE_INTERVAL * 3 : BASE_INTERVAL;
    const ms = base / state.speed;

    const timer = window.setTimeout(() => dispatch({ type: "NEXT" }), ms);
    return () => window.clearTimeout(timer);
  }, [state.mode, state.cursor, state.speed, scenario.steps.length]);

  // When reaching the end in auto mode, flip to manual so the demo doesn't
  // sit "playing" indefinitely.
  useEffect(() => {
    if (state.mode === "auto" && state.cursor >= scenario.steps.length) {
      dispatch({ type: "SET_MODE", mode: "manual" });
    }
  }, [state.mode, state.cursor, scenario.steps.length]);

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
    <DesignLensProvider enabled={mode === "demo" && lensEnabled}>
      <>
      <AppShell
        mode={mode}
        header={
          <Header
            mode={mode}
            statusLabel={t(`journey.states.${vm.claim.status}`)}
            mostUrgentSlaPhrase={
              vm.slaClocks[0]?.deadline ?? undefined
            }
            scenarioTitle={mode !== "product" ? t(scenario.titleKey) : undefined}
            onOpenScenarioPicker={
              mode !== "product" ? () => setPickerOpen(true) : undefined
            }
            lensEnabled={mode === "demo" ? lensEnabled : undefined}
            onToggleLens={mode === "demo" ? onToggleLens : undefined}
            languageSwitcher={
              mode === "product"
                ? <div data-testid="language-switcher-slot" />
                : undefined
            }
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
                mode={mode}
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
              {mode === "demo" && lensEnabled && (
                <AnnotationList
                  state={vm.claim.status}
                  scenarioId={state.scenarioId}
                  cursor={state.cursor}
                />
              )}
            </>
          ),
          activity: <ActivityFeed entries={vm.activityFeed} />,
          docs: <DocChecklist docs={vm.docChecklist} />,
        }}
        engineTrace={mode === "demo" ? <EngineTrace vm={vm.engineTrace} /> : undefined}
        cockpitRailLeft={
          <JourneyRail
            status={vm.claim.status}
            cursorByStatus={cursorByStatus}
            onJumpToCursor={(cursor) => dispatch({ type: "JUMP", cursor })}
          />
        }
        marginCallouts={
          mode === "demo" && lensEnabled
            ? <MarginCallouts
                state={vm.claim.status}
                scenarioId={state.scenarioId}
                cursor={state.cursor}
              />
            : undefined
        }
      />
      {mode !== "product" && (
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
      )}
    </>
    </DesignLensProvider>
  );
}
