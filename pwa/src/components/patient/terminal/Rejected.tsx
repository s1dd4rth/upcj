import { useTranslation } from "react-i18next";
import type { Claim } from "../../../engine-adapter";

interface RejectedProps {
  claim: Claim;
}

export function Rejected({ claim }: RejectedProps) {
  const { t } = useTranslation();

  const interactions = claim.interactions ?? [];

  // Find the rejection reason from pre-auth-rejected or claim-rejected (whichever is present)
  const claimRejectedInteraction = interactions.find(
    (i) => i.eventName === "claim-rejected"
  );
  const preAuthRejectedInteraction = interactions.find(
    (i) => i.eventName === "pre-auth-rejected"
  );

  const rejectionReason =
    typeof claimRejectedInteraction?.payload.reason === "string"
      ? (claimRejectedInteraction.payload.reason as string)
      : typeof preAuthRejectedInteraction?.payload.reason === "string"
        ? (preAuthRejectedInteraction.payload.reason as string)
        : null;

  // Grievance status
  const grievanceFiled = interactions.find((i) => i.eventName === "grievance-filed");
  const grievanceAcknowledged = interactions.find((i) => i.eventName === "grievance-acknowledged");
  const grievanceEscalated = interactions.find((i) => i.eventName === "grievance-escalated");
  const grievanceResolved = interactions.find((i) => i.eventName === "grievance-resolved");

  const grievanceLevel =
    typeof grievanceFiled?.payload.level === "number"
      ? (grievanceFiled.payload.level as number)
      : 1;

  function grievanceStatusLabel(): string {
    if (grievanceResolved) return t("ui.terminal.rejected.grievance.resolved", "Grievance resolved.");
    if (grievanceEscalated) return t("ui.terminal.rejected.grievance.escalated", "Grievance escalated to level {{level}} — awaiting response.", { level: grievanceLevel + 1 });
    if (grievanceAcknowledged) return t("ui.terminal.rejected.grievance.acknowledged", "Grievance acknowledged — awaiting resolution.");
    if (grievanceFiled) return t("ui.terminal.rejected.grievance.filed", "Grievance filed — awaiting acknowledgement.");
    return "";
  }

  return (
    <section
      className="rejected-screen"
      data-archetype="terminal"
      data-terminal-screen="rejected"
      aria-label={t("stateContent.rejected.headline")}
    >
      <header className="rejected-header">
        <h2
          className="rejected-badge"
          aria-label="Rejected"
          style={{ color: "var(--warn)" }}
        >
          {t("ui.terminal.rejected.badge", "Decision: not approved")}
        </h2>
        <p className="rejected-explanation">
          {t("stateContent.rejected.explanation")}
        </p>
      </header>

      {rejectionReason && (
        <section className="rejected-reason" aria-label="Reason given">
          <h3>{t("ui.terminal.rejected.reasonTitle", "Reason given by the insurer")}</h3>
          <p className="rejected-reason-text">{rejectionReason}</p>
        </section>
      )}

      <section className="rejected-remedy" aria-label="What you can do">
        <h3>{t("ui.terminal.rejected.remedyTitle", "What you can do")}</h3>
        {grievanceFiled ? (
          <p className="rejected-grievance-status" aria-label="Grievance status">
            {grievanceStatusLabel()}
          </p>
        ) : (
          <p className="rejected-remedy-body">
            {t(
              "ui.terminal.rejected.remedyBody",
              "You can file a grievance — there is a regulated escalation ladder. Many cases that look closed at this point are resolved through it."
            )}
          </p>
        )}
      </section>
    </section>
  );
}
