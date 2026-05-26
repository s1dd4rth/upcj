import { useTranslation } from "react-i18next";
import type { StateContent } from "../state-content";

interface NeutralProps {
  entry: StateContent;
}

export function Neutral({ entry }: NeutralProps) {
  const { t } = useTranslation();

  return (
    <div className="neutral-archetype" data-tone={entry.tone}>
      <h2 className="neutral-headline">{t(entry.headlineKey)}</h2>
      <p className="neutral-explanation">{t(entry.explanationKey)}</p>
      <p className="neutral-affirmation" aria-label="status affirmation">
        {t("ui.archetype.neutral.affirmation")}
      </p>
    </div>
  );
}
