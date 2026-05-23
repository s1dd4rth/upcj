import { useTranslation } from "react-i18next";
import type { Claim } from "../../../engine-adapter";
import type { StateContent } from "../state-content";

interface ClosedProps {
  entry: StateContent;
  claim: Claim;
}

export function Closed({ entry, claim }: ClosedProps) {
  const { t } = useTranslation();

  const isWithdrawn = claim.status === "withdrawn";

  return (
    <section
      className="closed-screen"
      data-archetype="terminal"
      data-terminal-screen="closed"
      aria-label={t(entry.headlineKey)}
    >
      <header className="closed-header">
        <h2 className="closed-badge" aria-label="Closed">
          {t("ui.terminal.closed.badge", "Closed")}
        </h2>
        <p className="closed-explanation">{t(entry.explanationKey)}</p>
      </header>

      <section className="closed-reason" aria-label="Reason">
        <h3>{t("ui.terminal.closed.reasonTitle", "Reason")}</h3>
        <p className="closed-reason-text">
          {isWithdrawn
            ? t("ui.terminal.closed.reason.withdrawn", "Withdrawn by patient")
            : t("ui.terminal.closed.reason.closedNoSettlement", "Closed without settlement")}
        </p>
      </section>

      <section className="closed-next" aria-label="What this means">
        {isWithdrawn ? (
          <p className="closed-next-body">
            {t(
              "ui.terminal.closed.next.withdrawn",
              "If circumstances change, you can intimate a new claim. The framework retains nothing that prevents that."
            )}
          </p>
        ) : (
          <p className="closed-next-body">
            {t(
              "ui.terminal.closed.next.closedNoSettlement",
              "The insurer has closed this file without settlement. If you believe this was incorrect, you can file a grievance — there are regulated routes."
            )}
          </p>
        )}
      </section>
    </section>
  );
}
