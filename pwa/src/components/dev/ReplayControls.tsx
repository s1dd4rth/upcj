import { useState } from "react";
import { useTranslation } from "react-i18next";
import { adapter } from "../../engine-adapter";
import type { Claim } from "../../engine-adapter";
import type { Scenario } from "../../scenarios/types";

export interface ReplayControlsProps {
  scenario: Scenario;
  steppedClaim: Claim; // current claim from cursor-by-cursor replay
}

type ReplayStatus = "idle" | "ok" | "drift" | "error";

interface ReplayResult {
  status: ReplayStatus;
  message?: string;
}

/**
 * "Verify replay determinism" button.
 * Runs adapter.replay(seedClaim, allSteps) and deep-compares with steppedClaim.
 */
export function ReplayControls({
  scenario,
  steppedClaim,
}: ReplayControlsProps): React.ReactElement {
  const { t } = useTranslation();
  const [result, setResult] = useState<ReplayResult>({ status: "idle" });

  function handleVerify() {
    const r = adapter.replay(scenario.seedClaim, scenario.steps);
    if (!r.ok) {
      setResult({ status: "error", message: String(r.error) });
      return;
    }
    const isDeterministic =
      JSON.stringify(r.claim) === JSON.stringify(steppedClaim);
    setResult({ status: isDeterministic ? "ok" : "drift" });
  }

  const statusColor =
    result.status === "ok"
      ? "var(--ok, green)"
      : result.status === "idle"
        ? "var(--ink-muted)"
        : "var(--warn, orangered)";

  const statusText =
    result.status === "ok"
      ? `✓ ${t("dev.verifyOk")}`
      : result.status === "drift"
        ? `✗ ${t("dev.verifyFailed")}`
        : result.status === "error"
          ? `✗ replay failed: ${result.message}`
          : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--s-3)", flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={handleVerify}
        style={{
          background: "none",
          border: "1px solid var(--hairline)",
          borderRadius: "var(--s-2)",
          padding: "var(--s-2) var(--s-3)",
          cursor: "pointer",
          fontSize: "var(--t-xs)",
          color: "var(--ink)",
          minHeight: "36px",
        }}
      >
        {t("dev.verifyReplay")}
      </button>
      {statusText && (
        <span
          data-replay-status={result.status}
          style={{ fontSize: "var(--t-xs)", color: statusColor }}
        >
          {statusText}
        </span>
      )}
    </div>
  );
}
