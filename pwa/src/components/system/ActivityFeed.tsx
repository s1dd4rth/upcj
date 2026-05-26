import { useTranslation } from "react-i18next";
import type { ActivityEntryVM } from "../../state/selectors";
import { ownerHue, ownerLabelKey } from "../../theme/owners";
import { formatIndianDateTime } from "../../format/intl";

export interface ActivityFeedProps {
  entries: ActivityEntryVM[];
}

export function ActivityFeed({ entries }: ActivityFeedProps): React.ReactElement {
  const { t, i18n } = useTranslation();

  if (entries.length === 0) {
    return (
      <p className="activity-feed-empty">{t("ui.activity.empty")}</p>
    );
  }

  return (
    <ol className="activity-feed">
      {entries.map((entry) => (
        <li
          key={entry.interactionId}
          data-activity-entry
          className="activity-feed-entry"
          style={{ borderLeft: "1px solid var(--hairline)" }}
        >
          <span
            className="activity-feed-owner"
            data-owner={entry.actor}
            style={{ color: ownerHue(entry.actor) }}
          >
            {t(ownerLabelKey(entry.actor))}
          </span>
          <time className="activity-feed-time" dateTime={entry.atIso}>
            {formatIndianDateTime(entry.atIso, { language: i18n.language })}
          </time>
          <span className="activity-feed-phrase">
            {t(entry.plainTextKey)}
          </span>
        </li>
      ))}
    </ol>
  );
}
