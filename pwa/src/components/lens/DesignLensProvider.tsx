import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { ClaimStatus } from "../../engine-adapter";
import { ANNOTATIONS, type Annotation } from "./annotations";

interface DesignLensContext {
  enabled: boolean;
  annotationsFor: (args: {
    state?: ClaimStatus;
    scenarioId?: string;
    cursor?: number;
    elementId?: string;
  }) => Annotation[];
}

const Ctx = createContext<DesignLensContext | null>(null);

export const MAX_ANNOTATIONS_PER_SCREEN = 4;

export function DesignLensProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const value = useMemo<DesignLensContext>(
    () => ({
      enabled,
      annotationsFor: ({ state, scenarioId, cursor, elementId }) => {
        const matches = ANNOTATIONS.filter((a) => {
          if (a.key.state && a.key.state !== state) return false;
          if (
            a.key.step &&
            (a.key.step.scenarioId !== scenarioId || a.key.step.cursor !== cursor)
          )
            return false;
          if (a.key.elementId && a.key.elementId !== elementId) return false;
          return true;
        });
        if (matches.length > MAX_ANNOTATIONS_PER_SCREEN) {
          if (typeof window !== "undefined" && import.meta.env?.DEV) {
            // eslint-disable-next-line no-console
            console.warn(
              `DesignLens: ${matches.length} annotations matched for {state:${state}, scenarioId:${scenarioId}, cursor:${cursor}, elementId:${elementId}} — capping to ${MAX_ANNOTATIONS_PER_SCREEN}. Trim the data.`,
            );
          }
        }
        return matches.slice(0, MAX_ANNOTATIONS_PER_SCREEN);
      },
    }),
    [enabled],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDesignLens(): DesignLensContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDesignLens must be used inside DesignLensProvider");
  return ctx;
}
