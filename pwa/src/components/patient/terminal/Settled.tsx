import { useTranslation } from "react-i18next";
import type { Claim } from "../../../engine-adapter";
import { formatINR, formatIndianDate } from "../../../format/intl";

interface SettledProps {
  claim: Claim;
}

export function Settled({ claim }: SettledProps) {
  const { t, i18n } = useTranslation();

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
        <h2 className="settled-badge" aria-label={t("ui.terminal.settled.badge")}>
          {t("ui.terminal.settled.badge")}
        </h2>
        <p className="settled-explanation">{t("stateContent.settled.explanation")}</p>
      </header>

      <dl className="settled-statement">
        {claimedAmount !== null && (
          <>
            <div className="settled-statement-row">
              <dt>{t("ui.terminal.settled.claimed")}</dt>
              <dd>{formatINR(claimedAmount, { language: i18n.language })}</dd>
            </div>
            <div className="settled-statement-row">
              <dt>{t("ui.terminal.settled.approved")}</dt>
              <dd>{formatINR(claimedAmount, { language: i18n.language })}</dd>
            </div>
          </>
        )}

        {settledAmount !== null && (
          <div className="settled-statement-row">
            <dt>{t("ui.terminal.settled.paid")}</dt>
            <dd>{formatINR(settledAmount, { language: i18n.language })}</dd>
          </div>
        )}

        {deduction !== null && deduction > 0 && (
          <div className="settled-statement-row settled-statement-deduction">
            <dt>{t("ui.terminal.settled.deduction")}</dt>
            <dd>{formatINR(deduction, { language: i18n.language })}</dd>
          </div>
        )}

        {settledAt !== null && (
          <div className="settled-statement-row">
            <dt>{t("ui.terminal.settled.paidOn")}</dt>
            <dd>
              <time dateTime={settledAt}>
                {formatIndianDate(settledAt, { language: i18n.language })}
              </time>
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
