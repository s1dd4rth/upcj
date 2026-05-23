import { useDesignLensSafe } from "./DesignLensProvider";
import { useLensIndex } from "./LensIndexContext";
import { AnnotationBadge } from "./AnnotationBadge";
import { useIsWide } from "../../hooks/useIsWide";
import styles from "./lens.module.css";

export interface AnnotatableProps {
  /**
   * Matches Annotation.key.elementId.  If the lens is enabled and annotations
   * exist for this id, a numbered badge is rendered in the top-right corner.
   */
  id: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Transparent passthrough when the lens is OFF — no extra wrapper, no overhead.
 *
 * When the lens is ON it renders:
 *   <span data-annotatable={id} style={{ position:"relative" }}>
 *     {children}
 *     {badge if annotations exist for this elementId}
 *   </span>
 *
 * The badge number comes from LensIndexCtx, which is provided by AnnotationList.
 * Tapping a list item temporarily adds the "highlighted" class via
 * data-annotation-highlighted attribute on this element.
 */
export function Annotatable({
  id,
  children,
  className,
}: AnnotatableProps): React.ReactElement {
  const { enabled } = useDesignLensSafe();
  const { indexFor } = useLensIndex();
  const isWide = useIsWide();

  // Transparent passthrough when lens is disabled
  if (!enabled) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }

  const index = indexFor(id);
  // At wide viewports the badge is suppressed; the margin callouts take its place.
  // The wrapper still renders so the annotation list / callout list can locate the target via data-annotatable.
  const showBadge = index !== undefined && !isWide;

  return (
    <span
      data-annotatable={id}
      className={[styles.annotatable, className].filter(Boolean).join(" ") || undefined}
      style={{ position: "relative", display: "inline-block" }}
    >
      {children}
      {showBadge && <AnnotationBadge number={index} />}
    </span>
  );
}
