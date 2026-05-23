import { useTranslation } from "react-i18next";
import type { PlaybackMode } from "../../state/playback";

const SPEED_CYCLE: readonly number[] = [1, 2, 0.5];

function nextSpeed(current: number): number {
  const idx = SPEED_CYCLE.indexOf(current);
  return idx === -1 ? 1 : SPEED_CYCLE[(idx + 1) % SPEED_CYCLE.length];
}

export interface PresenterControlsProps {
  mode: "product" | "demo";
  cursor: number;
  max: number;
  playbackMode: PlaybackMode;
  speed: number;
  onNext: () => void;
  onBack: () => void;
  onTogglePlayback: () => void;
  onSetSpeed: (speed: number) => void;
}

export function PresenterControls({
  mode,
  cursor,
  max,
  playbackMode,
  speed,
  onNext,
  onBack,
  onTogglePlayback,
  onSetSpeed,
}: PresenterControlsProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div
      className="presenter-controls"
      data-presenter-controls
      data-mode={mode}
    >
      <button
        type="button"
        data-action="back"
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
        data-action="next"
        onClick={onNext}
        disabled={cursor >= max}
        aria-label={t("ui.actions.next")}
      >
        {t("ui.actions.next")}
      </button>

      {mode === "demo" && (
        <>
          <button
            type="button"
            data-action="toggle-playback"
            data-playback-mode={playbackMode}
            aria-pressed={playbackMode === "auto"}
            onClick={onTogglePlayback}
          >
            {playbackMode === "manual"
              ? t("ui.actions.playAuto")
              : t("ui.actions.pause")}
          </button>

          <button
            type="button"
            data-action="speed"
            data-speed={speed}
            onClick={() => onSetSpeed(nextSpeed(speed))}
          >
            {speed}×
          </button>
        </>
      )}
    </div>
  );
}
