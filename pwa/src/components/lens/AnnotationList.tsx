import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { ClaimStatus } from "../../engine-adapter";
import { useDesignLens } from "./DesignLensProvider";
import type { Annotation } from "./annotations";
import { LensIndexCtx } from "./LensIndexContext";
import styles from "./lens.module.css";

export interface AnnotationListProps {
  /** Current claim status — used to filter state-keyed annotations. */
  state: ClaimStatus;
  scenarioId: string;
  cursor: number;
}

// Element IDs to query for element-keyed annotations
const ELEMENT_IDS = ["engine-trace", "owner-chip"] as const;

/** Locate the Annotatable wrapper in the DOM and toggle the highlight ring. */
function highlightElement(elementId: string, active: boolean): void {
  const el = document.querySelector(`[data-annotatable="${elementId}"]`);
  if (!el) return;
  if (active) {
    el.classList.add(styles.highlighted);
    el.setAttribute("data-annotation-highlighted", "true");
  } else {
    el.classList.remove(styles.highlighted);
    el.removeAttribute("data-annotation-highlighted");
  }
}

/**
 * AnnotationList
 *
 * 1. Gathers state-keyed AND element-keyed annotations for the current screen.
 * 2. De-duplicates by id and assigns 1-based positional indices.
 * 3. Provides those indices via LensIndexCtx so AnnotationBadge can show the
 *    matching number on each Annotatable wrapper.
 * 4. Renders a sticky `<aside>` at the bottom of the screen (NO dimming).
 * 5. Tapping a list item adds a temporary outline ring to its Annotatable
 *    target for 2 seconds, then removes it.
 */
export function AnnotationList({
  state,
  scenarioId,
  cursor,
}: AnnotationListProps): React.ReactElement {
  const { t } = useTranslation();
  const { annotationsFor } = useDesignLens();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Gather all annotations for this screen:
  //   • state-keyed: match by current status
  //   • element-keyed: match each registered elementId
  const annotations: Annotation[] = useMemo(() => {
    const stateMatches = annotationsFor({ state, scenarioId, cursor });
    const elementMatches: Annotation[] = [];
    for (const elementId of ELEMENT_IDS) {
      elementMatches.push(...annotationsFor({ elementId }));
    }

    // De-duplicate by id (state-keyed first, then element-keyed)
    const seen = new Set<string>();
    const all: Annotation[] = [];
    for (const a of [...stateMatches, ...elementMatches]) {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        all.push(a);
      }
    }
    return all;
  }, [annotationsFor, state, scenarioId, cursor]);

  // Build index map: elementId → 1-based position in the annotations array.
  // Only element-keyed annotations contribute to badge indices; state-keyed
  // annotations appear in the list but don't have a specific DOM anchor.
  const indexMap = useMemo(() => {
    const map = new Map<string, number>();
    annotations.forEach((a, i) => {
      if (a.key.elementId) {
        map.set(a.key.elementId, i + 1);
      }
    });
    return map;
  }, [annotations]);

  const indexFor = useCallback(
    (elementId: string): number | undefined => indexMap.get(elementId),
    [indexMap],
  );

  // Sync DOM highlight state when highlightedId changes
  useEffect(() => {
    if (highlightedId) {
      highlightElement(highlightedId, true);
    }
    return () => {
      if (highlightedId) {
        highlightElement(highlightedId, false);
      }
    };
  }, [highlightedId]);

  const handleItemClick = useCallback(
    (annotation: Annotation) => {
      const targetId = annotation.key.elementId;
      if (!targetId) return;

      // Clear any existing timer
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }

      // Remove previous highlight immediately
      if (highlightedId && highlightedId !== targetId) {
        highlightElement(highlightedId, false);
      }

      setHighlightedId(targetId);
      clearTimerRef.current = setTimeout(() => {
        setHighlightedId(null);
        clearTimerRef.current = null;
      }, 2000);
    },
    [highlightedId],
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }
    };
  }, []);

  if (annotations.length === 0) return <></>;

  return (
    <LensIndexCtx.Provider value={{ indexFor }}>
      <aside data-annotation-list className={styles.annotationList}>
        <p className={styles.listHeading}>{t("lens.list.heading")}</p>
        <ol className={styles.annotationOl}>
          {annotations.map((annotation, i) => (
            <li
              key={annotation.id}
              data-annotation-id={annotation.id}
              className={styles.annotationItem}
              onClick={() => handleItemClick(annotation)}
            >
              <span className={styles.itemIndex} aria-hidden="true">
                {i + 1}
              </span>
              <span className={styles.itemBody}>
                <span className={styles.itemText}>{t(annotation.textKey)}</span>
                <span className={styles.itemPrinciple}>{annotation.principle}</span>
              </span>
            </li>
          ))}
        </ol>
      </aside>
    </LensIndexCtx.Provider>
  );
}
