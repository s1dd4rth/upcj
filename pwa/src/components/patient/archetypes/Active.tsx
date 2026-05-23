import { useTranslation } from "react-i18next";
import type { StateContent } from "../state-content";

interface ActiveProps {
  entry: StateContent;
}

export function Active({ entry }: ActiveProps) {
  const { t } = useTranslation();

  const actionLabel = entry.action
    ? t(entry.action.labelKey)
    : t("ui.archetype.active.defaultActionLabel", "Submit the requested information");

  return (
    <div
      className="active-archetype"
      data-archetype="active"
      data-tone={entry.tone}
      style={{
        background: "var(--active-surface)",
        borderLeft: "4px solid var(--active-tint)",
        padding: "1.5rem",
        borderRadius: "0.5rem",
      }}
    >
      <h2 className="active-headline" style={{ marginTop: 0 }}>
        {t(entry.headlineKey)}
      </h2>
      <p className="active-explanation">{t(entry.explanationKey)}</p>
      <button
        className="active-cta"
        type="button"
        onClick={() => {}}
        style={{
          display: "inline-block",
          marginTop: "1rem",
          padding: "0.75rem 1.5rem",
          background: "var(--active-tint)",
          color: "var(--on-active)",
          border: "none",
          borderRadius: "0.375rem",
          fontWeight: 600,
          fontSize: "1rem",
          cursor: "pointer",
        }}
        aria-label={actionLabel}
      >
        {actionLabel}
      </button>
    </div>
  );
}
