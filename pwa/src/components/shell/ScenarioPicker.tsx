import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { Scenario } from "../../scenarios/types";

export interface ScenarioPickerProps {
  open: boolean;
  onClose: () => void;
  scenarios: readonly Scenario[];
  currentScenarioId: string;
  onChoose: (scenarioId: string) => void;
}

export function ScenarioPicker({
  open,
  onClose,
  scenarios,
  currentScenarioId,
  onChoose,
}: ScenarioPickerProps): React.ReactElement | null {
  const { t } = useTranslation();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Capture the triggering element so we can restore focus on close
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      // Move focus to the heading after the element has rendered
      window.requestAnimationFrame(() => {
        headingRef.current?.focus();
      });
    } else {
      // Restore focus to the element that opened the picker
      if (triggerRef.current && typeof triggerRef.current.focus === "function") {
        triggerRef.current.focus();
        triggerRef.current = null;
      }
    }
  }, [open]);

  // Escape key closes the picker
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="scenario-picker-heading"
      data-scenario-picker
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflowY: "auto",
        backgroundColor: "var(--color-surface, #fbfbf9)",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <h1
          id="scenario-picker-heading"
          ref={headingRef}
          tabIndex={-1}
          style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}
        >
          {t("ui.scenarioPicker.title")}
        </h1>
        <button
          type="button"
          aria-label={t("ui.scenarioPicker.close")}
          data-action="close-picker"
          onClick={onClose}
          style={{ fontSize: "1.25rem", lineHeight: 1, padding: "0.25rem 0.5rem" }}
        >
          ✕
        </button>
      </div>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {scenarios.map((scenario) => {
          const isCurrent = scenario.id === currentScenarioId;
          return (
            <li key={scenario.id}>
              <button
                type="button"
                data-scenario-id={scenario.id}
                data-current={isCurrent ? "true" : undefined}
                onClick={() => onChoose(scenario.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "1rem",
                  border: isCurrent
                    ? "2px solid var(--color-accent, #1a6b44)"
                    : "1px solid var(--color-border, #d4d4d0)",
                  borderRadius: "0.5rem",
                  background: isCurrent
                    ? "var(--color-accent-subtle, #f0f9f5)"
                    : "var(--color-surface, #fbfbf9)",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.375rem",
                  }}
                >
                  <strong style={{ fontSize: "1rem" }}>
                    {t(scenario.titleKey)}
                  </strong>
                  {isCurrent && (
                    <span
                      data-current-badge
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        padding: "0.125rem 0.5rem",
                        borderRadius: "999px",
                        background: "var(--color-accent, #1a6b44)",
                        color: "var(--color-on-accent, #fff)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t("ui.scenarioPicker.current")}
                    </span>
                  )}
                </div>
                <p style={{ margin: "0 0 0.5rem", fontSize: "0.875rem", opacity: 0.8 }}>
                  {t(scenario.summaryKey)}
                </p>
                <p style={{ margin: 0, fontSize: "0.8125rem", opacity: 0.65 }}>
                  <strong>{t("ui.scenarioPicker.teaches")}:</strong>{" "}
                  {t(scenario.teachesKey)}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
