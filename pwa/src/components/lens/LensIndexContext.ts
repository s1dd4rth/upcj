import { createContext, useContext } from "react";

/**
 * Provides badge index lookups from the annotation list to Annotatable wrappers.
 *
 * The AnnotationList is the source of truth: it computes the ordered array of
 * annotations visible on the current screen, assigns 1-based indices, then
 * exposes those via this context so AnnotationBadge can show the matching number.
 */
export interface LensIndexContextValue {
  /** Returns the 1-based display index for a given elementId, or undefined if none. */
  indexFor: (elementId: string) => number | undefined;
}

export const LensIndexCtx = createContext<LensIndexContextValue>({
  indexFor: () => undefined,
});

export function useLensIndex(): LensIndexContextValue {
  return useContext(LensIndexCtx);
}
