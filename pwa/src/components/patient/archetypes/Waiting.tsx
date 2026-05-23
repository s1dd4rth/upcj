import { useTranslation } from "react-i18next";
import type { StateContent } from "../state-content";
import type { SlaClockVM } from "../../../state/selectors";
import { ownerHue, ownerLabelKey } from "../../../theme/owners";

interface WaitingProps {
  entry: StateContent;
  slaClocks: SlaClockVM[];
}

export function Waiting({ entry, slaClocks }: WaitingProps) {
  const { t } = useTranslation();

  return (
    <div className="waiting-archetype" data-tone={entry.tone}>
      <h2 className="waiting-headline">{t(entry.headlineKey)}</h2>
      <p className="waiting-explanation">{t(entry.explanationKey)}</p>

      {slaClocks.length > 0 && (
        <section className="waiting-sla-block" aria-label="Who we're waiting on">
          <h3 className="waiting-sla-block-title">{t("ui.archetype.waiting.title", "Who we're waiting on")}</h3>
          <ul className="waiting-sla-list" style={{ listStyle: "none", padding: 0 }}>
            {slaClocks.map((vm) => (
              <li
                key={vm.slaId}
                className="waiting-sla-item"
                data-owner={vm.owner}
                data-sla-status={vm.status}
              >
                <span
                  className="waiting-owner-chip"
                  style={{ background: ownerHue(vm.owner) }}
                  aria-label={t(ownerLabelKey(vm.owner))}
                >
                  {t(ownerLabelKey(vm.owner))}
                </span>
                {vm.status === "breached" ? (
                  <span className="waiting-sla-phrase waiting-sla-breached">
                    {t("ui.sla.breached", {
                      owner: t(ownerLabelKey(vm.owner)),
                      when: vm.deadline ?? "—",
                      remedy: vm.remedy ?? "",
                    })}
                  </span>
                ) : (
                  <span className="waiting-sla-phrase">
                    {t("ui.sla.comfortable", {
                      owner: t(ownerLabelKey(vm.owner)),
                      when: vm.deadline ?? "—",
                    })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
