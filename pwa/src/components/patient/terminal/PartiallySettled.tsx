import { useTranslation } from "react-i18next";
import type { Claim } from "../../../engine-adapter";

interface Deduction {
  amount: number;
  reason: string;
  category?: string;
}

interface PartiallySettledProps {
  claim: Claim;
}

function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export function PartiallySettled({ claim }: PartiallySettledProps) {
  const { t } = useTranslation();

  const interactions = claim.interactions ?? [];

  const partiallySettledInteraction = interactions.find(
    (i) => i.eventName === "claim-partially-settled"
  );

  const settledAmount =
    typeof partiallySettledInteraction?.payload.settledAmount === "number"
      ? (partiallySettledInteraction.payload.settledAmount as number)
      : null;

  const deductions: Deduction[] = Array.isArray(partiallySettledInteraction?.payload.deductions)
    ? (partiallySettledInteraction.payload.deductions as Deduction[])
    : [];

  const totalDeducted = deductions.reduce((sum, d) => sum + d.amount, 0);

  // Claimed amount: use pre-auth approved if present, otherwise derive from settled + deducted
  const preAuthApproved = interactions.find((i) => i.eventName === "pre-auth-approved");
  const claimedAmount =
    typeof preAuthApproved?.payload.approvedAmount === "number"
      ? (preAuthApproved.payload.approvedAmount as number)
      : settledAmount !== null
        ? settledAmount + totalDeducted
        : null;

  const settledAt = partiallySettledInteraction?.timestamp ?? null;

  // Grievance status
  const grievanceFiled = interactions.find((i) => i.eventName === "grievance-filed");
  const grievanceAcknowledged = interactions.find((i) => i.eventName === "grievance-acknowledged");
  const grievanceResolved = interactions.find((i) => i.eventName === "grievance-resolved");

  function grievanceStatusLabel(): string {
    if (grievanceResolved) return t("ui.terminal.partiallySettled.grievance.resolved", "Grievance resolved.");
    if (grievanceAcknowledged) return t("ui.terminal.partiallySettled.grievance.acknowledged", "Grievance acknowledged by the insurer — awaiting resolution.");
    if (grievanceFiled) return t("ui.terminal.partiallySettled.grievance.filed", "Grievance filed — awaiting acknowledgement from the insurer.");
    return "";
  }

  return (
    <section
      className="partially-settled-screen"
      data-archetype="terminal"
      data-terminal-screen="partiallySettled"
      aria-label={t("stateContent.partially-settled.headline")}
    >
      <header className="partially-settled-header">
        <h2 className="partially-settled-badge" aria-label="Partially settled">
          {t("ui.terminal.partiallySettled.badge", "Partially settled")}
        </h2>
        <p className="partially-settled-explanation">
          {t("stateContent.partially-settled.explanation")}
        </p>
      </header>

      <dl className="partially-settled-statement">
        {claimedAmount !== null && (
          <div className="partially-settled-statement-row">
            <dt>{t("ui.terminal.partiallySettled.claimed", "Claimed")}</dt>
            <dd>{formatINR(claimedAmount)}</dd>
          </div>
        )}

        {settledAmount !== null && (
          <div className="partially-settled-statement-row">
            <dt>{t("ui.terminal.partiallySettled.paid", "Paid")}</dt>
            <dd>{formatINR(settledAmount)}</dd>
          </div>
        )}

        {deductions.length > 0 && (
          <div className="partially-settled-statement-row partially-settled-deductions">
            <dt>{t("ui.terminal.partiallySettled.deductions", "Deductions")}</dt>
            <dd>
              <ul
                className="partially-settled-deduction-list"
                style={{ margin: 0, padding: 0, listStyle: "none" }}
              >
                {deductions.map((d, i) => (
                  <li key={i} className="partially-settled-deduction-item">
                    <span className="deduction-amount">{formatINR(d.amount)}</span>
                    {" — "}
                    <span className="deduction-reason">{d.reason}</span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}

        {totalDeducted > 0 && (
          <div className="partially-settled-statement-row partially-settled-total-deducted">
            <dt>{t("ui.terminal.partiallySettled.totalDeducted", "Total deducted")}</dt>
            <dd>{formatINR(totalDeducted)}</dd>
          </div>
        )}

        {settledAt !== null && (
          <div className="partially-settled-statement-row">
            <dt>{t("ui.terminal.partiallySettled.paidOn", "Paid on")}</dt>
            <dd>
              <time dateTime={settledAt}>
                {new Date(settledAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </dd>
          </div>
        )}
      </dl>

      <section className="partially-settled-remedy" aria-label="What you can do">
        <h3>{t("ui.terminal.partiallySettled.remedyTitle", "What you can do")}</h3>
        {grievanceFiled ? (
          <p className="partially-settled-grievance-status" aria-label="Grievance status">
            {grievanceStatusLabel()}
          </p>
        ) : (
          <p className="partially-settled-remedy-body">
            {t(
              "ui.terminal.partiallySettled.remedyBody",
              "If you disagree with the deduction, you can file a grievance. Each level has a regulated response window."
            )}
          </p>
        )}
      </section>
    </section>
  );
}
