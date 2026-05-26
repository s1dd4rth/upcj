import type { ClaimStatus } from "../../engine-adapter";
import { useIsWide } from "../../hooks/useIsWide";
import { useScreenAnnotations } from "./useScreenAnnotations";
import { MarginCallout } from "./MarginCallout";
import styles from "./lens.module.css";

export interface MarginCalloutsProps {
  state: ClaimStatus;
  scenarioId: string;
  cursor: number;
}

/**
 * Desktop design-lens: a vertical stack of margin callouts in the right gutter.
 *
 * Rendered ONLY at wide viewports (≥ 900 px). At narrow viewports this component
 * returns null — the mobile AnnotationList + badges take over.
 *
 * NO dimming. NO scrim. NO overlap with primary content.
 * The callouts sit in the cockpit's right-rail gutter provided by AppShell.
 */
export function MarginCallouts({
  state,
  scenarioId,
  cursor,
}: MarginCalloutsProps): React.ReactElement | null {
  const isWide = useIsWide();
  const annotations = useScreenAnnotations({ state, scenarioId, cursor });

  // Only shown at wide viewports; mobile uses AnnotationList
  if (!isWide) return null;
  if (annotations.length === 0) return null;

  return (
    <aside data-margin-callouts className={styles.marginCallouts}>
      {annotations.map((annotation, i) => (
        <MarginCallout
          key={annotation.id}
          index={i + 1}
          textKey={annotation.textKey}
          principle={annotation.principle}
          targetElementId={annotation.key.elementId}
        />
      ))}
    </aside>
  );
}
