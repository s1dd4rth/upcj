import { useTranslation } from "react-i18next";
import type { DocVM } from "../../state/selectors";
import { ownerHue, ownerLabelKey } from "../../theme/owners";

export interface DocChecklistProps {
  docs: DocVM[];
}

type PhaseKey =
  | "beforeAdmission"
  | "atHospital"
  | "dischargeSettlement"
  | "cashless"
  | "reimbursement"
  | "other";

function phaseKeyForStep(relevantAtStep: string): PhaseKey {
  const first = relevantAtStep.trim().charAt(0);
  switch (first) {
    case "1": return "beforeAdmission";
    case "2": return "atHospital";
    case "3": return "dischargeSettlement";
    case "A": return "cashless";
    case "B": return "reimbursement";
    default: return "other";
  }
}

const PHASE_ORDER: PhaseKey[] = [
  "beforeAdmission",
  "atHospital",
  "dischargeSettlement",
  "cashless",
  "reimbursement",
  "other",
];

export function DocChecklist({ docs }: DocChecklistProps): React.ReactElement {
  const { t } = useTranslation();

  if (docs.length === 0) {
    return (
      <p className="doc-checklist-empty">{t("ui.doc.empty")}</p>
    );
  }

  // Group docs by phase
  const grouped = new Map<PhaseKey, DocVM[]>();
  for (const doc of docs) {
    const phase = phaseKeyForStep(doc.relevantAtStep);
    if (!grouped.has(phase)) {
      grouped.set(phase, []);
    }
    grouped.get(phase)!.push(doc);
  }

  const presentPhases = PHASE_ORDER.filter((p) => grouped.has(p));

  return (
    <div className="doc-checklist">
      {presentPhases.map((phase) => (
        <section
          key={phase}
          data-phase={phase}
          className="doc-checklist-phase"
        >
          <h3 className="doc-checklist-phase-label">
            {t(`ui.doc.phases.${phase}`)}
          </h3>
          <ul className="doc-checklist-list">
            {grouped.get(phase)!.map((doc) => (
              <li
                key={doc.docId}
                data-doc-id={doc.docId}
                className="doc-checklist-item"
              >
                <span className="doc-name">
                  {t(doc.nameKey, { defaultValue: doc.nameKey })}
                </span>
                <span
                  className="doc-status-badge"
                  data-status={doc.status}
                >
                  {t(`ui.doc.status.${doc.status}`)}
                </span>
                <span
                  className="doc-responsible-chip"
                  data-owner={doc.responsible}
                  style={{ color: ownerHue(doc.responsible) }}
                >
                  {t(ownerLabelKey(doc.responsible))}
                </span>
                <span className="doc-relevant-at">
                  {t("ui.doc.relevantAt", { step: doc.relevantAtStep })}
                </span>
                {doc.notes !== undefined && (
                  <details className="doc-notes-details">
                    <summary className="doc-notes-summary">
                      {t("ui.doc.whyNeeded")}
                    </summary>
                    <p className="doc-notes-text">{doc.notes}</p>
                  </details>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
