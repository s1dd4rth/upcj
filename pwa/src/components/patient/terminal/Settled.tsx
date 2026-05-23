import { useTranslation } from "react-i18next";
import type { Claim } from "../../../engine-adapter";

interface SettledProps {
  claim: Claim;
}

function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export function Settled({ claim }: SettledProps) {
  const { t } = useTranslation();

  const interactions = claim.interactions ?? [];

  // Extract amounts from interaction payloads
  const preAuthApproved = interactions.find((i) => i.eventName === "pre-auth-approved");
  const claimSettled = interactions.find((i) => i.eventName === "claim-settled");

  const approvedAmount =
    typeof preAuthApproved?.payload.approvedAmount === "number"
      ? (preAuthApproved.payload.approvedAmount as number)
      : null;

  const settledAmount =
    typeof claimSettled?.payload.settledAmount === "number"
      ? (claimSettled.payload.settledAmount as number)
      : null;

  // "Claimed" is not a distinct field in cashless — the pre-auth approval is the closest
  // proxy. We use approvedAmount as both claimed and approved; deduction only shown if > 0.
  const claimedAmount = approvedAmount;

  const deduction =
    claimedAmount !== null && settledAmount !== null && claimedAmount > settledAmount
      ? claimedAmount - settledAmount
      : null;

  const settledAt = claimSettled?.timestamp ?? null;

  return (
    <section
      className="settled-screen"
      data-terminal-screen="settled"
      aria-label={t("stateContent.settled.headline")}
    >
      <header className="settled-header">
        <h2 className="settled-badge" aria-label="Settled">
          {t("ui.terminal.settled.badge", "Settled")}
        </h2>
        <p className="settled-explanation">{t("stateContent.settled.explanation")}</p>
      </header>

      <dl className="settled-statement">
        {claimedAmount !== null && (
          <>
            <div className="settled-statement-row">
              <dt>{t("ui.terminal.settled.claimed", "Claimed")}</dt>
              <dd>{formatINR(claimedAmount)}</dd>
            </div>
            <div className="settled-statement-row">
              <dt>{t("ui.terminal.settled.approved", "Approved")}</dt>
              <dd>{formatINR(claimedAmount)}</dd>
            </div>
          </>
        )}

        {settledAmount !== null && (
          <div className="settled-statement-row">
            <dt>{t("ui.terminal.settled.paid", "Paid")}</dt>
            <dd>{formatINR(settledAmount)}</dd>
          </div>
        )}

        {deduction !== null && deduction > 0 && (
          <div className="settled-statement-row settled-statement-deduction">
            <dt>{t("ui.terminal.settled.deduction", "Deduction")}</dt>
            <dd>{formatINR(deduction)}</dd>
          </div>
        )}

        {settledAt !== null && (
          <div className="settled-statement-row">
            <dt>{t("ui.terminal.settled.paidOn", "Paid on")}</dt>
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
    </section>
  );
}
