import { useState, useEffect } from "react";

export const COCKPIT_QUERY = "(min-width: 900px)";

/**
 * Returns true when the viewport is at least 900 px wide (cockpit/desktop layout).
 * Tracks changes via matchMedia — updates without full re-render of the tree.
 */
export function useIsWide(): boolean {
  const [isWide, setIsWide] = useState<boolean>(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia(COCKPIT_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mql = window.matchMedia(COCKPIT_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsWide(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isWide;
}
