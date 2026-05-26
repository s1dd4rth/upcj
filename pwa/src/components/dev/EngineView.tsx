import { useTranslation } from "react-i18next";
import { adapter, ENGINE_VERSION } from "../../engine-adapter";
import type { Claim, ValidationError } from "../../engine-adapter";
import type { SlaClockVM, EngineTraceVM } from "../../state/selectors";
import type { Scenario } from "../../scenarios/types";
import { SlaClock } from "../system/SlaClock";
import { SpecHashBadge } from "./SpecHashBadge";
import { ClaimJson } from "./ClaimJson";
import { ReplayControls } from "./ReplayControls";

export interface EngineViewProps {
  scenario: Scenario;
  cursor: number;
  claim: Claim;
  allSlaClocks: SlaClockVM[];
  engineTrace: EngineTraceVM | null;
  /** The claim at scenario.steps.length (terminal state). Used for replay determinism check. */
  fullReplayClaim: Claim;
}

const REPO_URL = "https://github.com/s1dd4rth/upcj";
const SPEC_URL =
  "https://github.com/s1dd4rth/upcj/blob/main/docs/superpowers/specs/2026-05-13-upcj-demo-pwa-design.md";

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--s-2)",
  flexWrap: "wrap",
};

const labelStyle: React.CSSProperties = {
  fontSize: "var(--t-xs)",
  color: "var(--ink-muted)",
  fontWeight: 600,
  minWidth: "9ch",
};

const sectionStyle: React.CSSProperties = {
  borderTop: "1px solid var(--hairline)",
  paddingTop: "var(--s-3)",
  marginTop: "var(--s-3)",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={rowStyle}>
      <span style={labelStyle}>{label}</span>
      <span style={{ fontSize: "var(--t-xs)" }}>{children}</span>
    </div>
  );
}

/**
 * EngineView — the developer-facing panel that surfaces everything the engine
 * sees and does at the current cursor position.
 */
export function EngineView({
  scenario,
  cursor,
  claim,
  allSlaClocks,
  engineTrace,
  fullReplayClaim,
}: EngineViewProps): React.ReactElement {
  const { t } = useTranslation();

  const validateResult = adapter.validate(claim);
  const specHash = adapter.specHash();

  return (
    <section
      data-engine-view
      style={{
        fontSize: "var(--t-xs)",
        color: "var(--ink)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--s-2)",
      }}
    >
      {/* ── Spec hash + engine version ──────────────────────────────── */}
      <div style={rowStyle}>
        <span style={labelStyle}>{t("dev.specHash")}</span>
        <SpecHashBadge />
      </div>
      <Row label={t("dev.engineVersion")}>
        <code>v{ENGINE_VERSION}</code>
      </Row>

      {/* ── Event applied at cursor N ───────────────────────────────── */}
      <div style={sectionStyle}>
        <div style={{ ...labelStyle, marginBottom: "var(--s-2)" }}>
          {t("dev.eventApplied")} (cursor {cursor})
        </div>
        {engineTrace ? (
          <>
            <div style={rowStyle}>
              <code style={{ fontSize: "var(--t-xs)" }}>{engineTrace.eventApplied.name}</code>
            </div>
            <pre
              style={{
                fontSize: "var(--t-xs)",
                background: "var(--bg)",
                border: "1px solid var(--hairline)",
                borderRadius: "var(--s-1)",
                padding: "var(--s-2)",
                overflowX: "auto",
                marginTop: "var(--s-1)",
                lineHeight: 1.5,
              }}
            >
              {JSON.stringify(engineTrace.eventApplied.payload, null, 2)}
            </pre>
          </>
        ) : (
          <span style={{ color: "var(--ink-muted)" }}>{t("dev.noEventYet")}</span>
        )}
      </div>

      {/* ── Validate result ─────────────────────────────────────────── */}
      <div style={sectionStyle}>
        {validateResult.ok ? (
          <div style={{ ...rowStyle, color: "var(--ok, green)" }}>
            <span>✓</span>
            <span>{t("dev.validateOk")}</span>
          </div>
        ) : (
          <div>
            <div style={{ color: "var(--warn, orangered)", fontWeight: 600 }}>
              ✗ {t("dev.validateFailed")}
            </div>
            <ul style={{ margin: "var(--s-1) 0 0 var(--s-4)", padding: 0 }}>
              {(validateResult as { ok: false; errors: ValidationError[] }).errors.map(
                (err: ValidationError, i: number) => (
                  <li key={i} style={{ fontSize: "var(--t-xs)" }}>
                    {err.path}: {err.message}
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </div>

      {/* ── State transition ────────────────────────────────────────── */}
      {engineTrace && (
        <div style={sectionStyle}>
          <span style={labelStyle}>{t("dev.transition")}</span>
          <div style={{ ...rowStyle, marginTop: "var(--s-1)" }}>
            <code>{engineTrace.statusBefore}</code>
            <span style={{ color: "var(--ink-muted)" }}>→</span>
            <code>{engineTrace.statusAfter}</code>
          </div>
        </div>
      )}

      {/* ── New interaction id ──────────────────────────────────────── */}
      {engineTrace && engineTrace.newInteractionId && (
        <div style={sectionStyle}>
          <Row label={t("dev.newInteraction")}>
            <code>{engineTrace.newInteractionId}</code>
          </Row>
        </div>
      )}

      {/* ── SLAs (precise) ──────────────────────────────────────────── */}
      <div style={sectionStyle}>
        <div style={{ ...labelStyle, marginBottom: "var(--s-2)" }}>
          {t("dev.slasAll")} ({allSlaClocks.length})
        </div>
        {allSlaClocks.length === 0 ? (
          <span style={{ color: "var(--ink-muted)" }}>No SLAs active.</span>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
            {allSlaClocks.map((vm) => (
              <div key={vm.slaId}>
                <div style={{ color: "var(--ink-muted)", marginBottom: "var(--s-1)" }}>
                  {vm.slaId} ({vm.rawState})
                </div>
                <SlaClock vm={vm} precise={true} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Replay determinism ──────────────────────────────────────── */}
      {/* steppedClaim is the terminal state (all steps applied one-by-one),
          which is compared to adapter.replay(seedClaim, allSteps) to verify
          that full replay is deterministic / equivalent. */}
      <div style={sectionStyle}>
        <ReplayControls scenario={scenario} steppedClaim={fullReplayClaim} />
      </div>

      {/* ── Claim JSON ──────────────────────────────────────────────── */}
      <ClaimJson claim={claim} />

      {/* ── Spec hash full + links ──────────────────────────────────── */}
      <div style={sectionStyle}>
        <div style={{ ...labelStyle, marginBottom: "var(--s-2)" }}>
          {t("dev.specHash")} (full)
        </div>
        <code
          style={{
            fontSize: "var(--t-xs)",
            wordBreak: "break-all",
            color: "var(--ink-muted)",
          }}
        >
          {specHash}
        </code>
        <div style={{ marginTop: "var(--s-3)", display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "var(--t-xs)", color: "var(--accent)" }}
          >
            {t("dev.linksRepo")}
          </a>
          <a
            href={SPEC_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "var(--t-xs)", color: "var(--accent)" }}
          >
            {t("dev.linksSpec")}
          </a>
        </div>
      </div>
    </section>
  );
}
