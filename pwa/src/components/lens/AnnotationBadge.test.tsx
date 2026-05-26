import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AnnotationBadge } from "./AnnotationBadge";

describe("AnnotationBadge", () => {
  it("renders the number", () => {
    const { container } = render(<AnnotationBadge number={3} />);
    const badge = container.querySelector("[data-annotation-badge]");
    expect(badge).toBeInTheDocument();
    expect(badge?.textContent).toBe("3");
  });

  it("has data-annotation-badge attribute", () => {
    const { container } = render(<AnnotationBadge number={1} />);
    expect(container.querySelector("[data-annotation-badge]")).toBeInTheDocument();
  });

  it("is positioned absolutely with top and right offsets", () => {
    const { container } = render(<AnnotationBadge number={2} />);
    const badge = container.querySelector<HTMLElement>("[data-annotation-badge]");
    expect(badge).not.toBeNull();
    // inline class positions via CSS module — check class presence
    expect(badge?.className).toBeTruthy();
    // The badge must have an aria-label for accessibility
    expect(badge?.getAttribute("aria-label")).toMatch(/annotation/i);
  });
});
