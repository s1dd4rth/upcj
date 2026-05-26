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
        <h2 className="closed-badge" aria-label={t("ui.terminal.closed.badge")}>
          {t("ui.terminal.closed.badge")}
        </h2>
        <p className="closed-explanation">{t(entry.explanationKey)}</p>
      </header>

      <section className="closed-reason" aria-label={t("ui.terminal.closed.reasonTitle")}>
        <h3>{t("ui.terminal.closed.reasonTitle")}</h3>
        <p className="closed-reason-text">
          {isWithdrawn
            ? t("ui.terminal.closed.reason.withdrawn")
            : t("ui.terminal.closed.reason.closedNoSettlement")}
        </p>
      </section>

      <section className="closed-next" aria-label={t("ui.terminal.closed.nextTitle")}>
        {isWithdrawn ? (
          <p className="closed-next-body">
            {t("ui.terminal.closed.next.withdrawn")}
          </p>
        ) : (
          <p className="closed-next-body">
            {t("ui.terminal.closed.next.closedNoSettlement")}
          </p>
        )}
      </section>
    </section>
  );
}
