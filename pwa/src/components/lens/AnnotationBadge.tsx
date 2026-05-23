import styles from "./lens.module.css";

export interface AnnotationBadgeProps {
  number: number;
}

/**
 * Small circular badge rendered as a child of an Annotatable wrapper.
 * Positioned absolutely (top:-8px, right:-8px) so it sits in the
 * margin — not overlapping the content itself.
 *
 * Background: var(--accent), text: var(--bg).
 * No dimming of surrounding content.
 */
export function AnnotationBadge({ number }: AnnotationBadgeProps): React.ReactElement {
  return (
    <span
      data-annotation-badge
      className={styles.badge}
      aria-label={`Design annotation ${number}`}
    >
      {number}
    </span>
  );
}
