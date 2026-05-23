import { useTranslation } from "react-i18next";
import type { Principle } from "./annotations";
import styles from "./lens.module.css";

export interface MarginCalloutProps {
  /** 1-based display index — matches the number in AnnotationList. */
  index: number;
  /** i18n key for the annotation body text. */
  textKey: string;
  /** Design principle tag. */
  principle: Principle;
  /**
   * The `data-annotatable` id of the element this callout annotates.
   * When set, adds `data-has-target="true"` and a CSS leader-line cue.
   */
  targetElementId?: string;
}

/**
 * A single margin callout rendered in the cockpit's right-rail gutter.
 *
 * Design constraints:
 *  - NO dimming, NO opacity changes, NO overlap with primary content.
 *  - Sits in the gutter alongside its target.
 *  - A `::before` pseudo-element draws a dashed hairline pointing left,
 *    gesturing toward the target.
 */
export function MarginCallout({
  index,
  textKey,
  principle,
  targetElementId,
}: MarginCalloutProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <aside
      data-margin-callout
      data-index={index}
      data-has-target={targetElementId ? "true" : undefined}
      className={styles.marginCallout}
    >
      <header className={styles.calloutHeader}>
        <span data-callout-index className={styles.calloutIndex} aria-hidden="true">
          {index}
        </span>
      </header>
      <p className={styles.calloutText}>{t(textKey)}</p>
      <small data-principle className={styles.calloutPrinciple}>
        {principle}
      </small>
    </aside>
  );
}
