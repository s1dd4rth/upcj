import { useMemo } from "react";
import { useDesignLens } from "./DesignLensProvider";
import type { Annotation } from "./annotations";
import type { ClaimStatus } from "../../engine-adapter";

// Element IDs to query for element-keyed annotations (mirrors AnnotationList)
const ELEMENT_IDS = ["engine-trace", "owner-chip"] as const;

/**
 * Shared hook: gathers and de-duplicates all annotations for the current screen.
 *
 *  • state-keyed: match by current claim status + scenario/cursor
 *  • element-keyed: match each registered elementId
 *
 * Returns a stable array (memoised). Used by both AnnotationList (mobile) and
 * MarginCallouts (desktop) so index numbering is always consistent.
 */
export function useScreenAnnotations({
  state,
  scenarioId,
  cursor,
}: {
  state: ClaimStatus;
  scenarioId: string;
  cursor: number;
}): Annotation[] {
  const { annotationsFor } = useDesignLens();

  return useMemo(() => {
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
}
