import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DesignLensProvider } from "./DesignLensProvider";
import { LensIndexCtx } from "./LensIndexContext";
import { Annotatable } from "./Annotatable";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function renderWithLens(
  enabled: boolean,
  indexFor: (id: string) => number | undefined = () => undefined,
  id = "test-element",
) {
  return render(
    <DesignLensProvider enabled={enabled}>
      <LensIndexCtx.Provider value={{ indexFor }}>
        <Annotatable id={id}>
          <span data-testid="child">content</span>
        </Annotatable>
      </LensIndexCtx.Provider>
    </DesignLensProvider>,
  );
}

// ---------------------------------------------------------------------------
// tests
// ---------------------------------------------------------------------------

describe("Annotatable", () => {
  it("renders children directly with no wrapper when lens is disabled", () => {
    const { container } = renderWithLens(false);
    // The child must be present
    expect(screen.getByTestId("child")).toBeInTheDocument();
    // No data-annotatable wrapper should exist
    expect(container.querySelector("[data-annotatable]")).not.toBeInTheDocument();
  });

  it("renders the annotatable wrapper when lens is enabled", () => {
    const { container } = renderWithLens(true, () => undefined, "my-id");
    const wrapper = container.querySelector('[data-annotatable="my-id"]');
    expect(wrapper).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders NO badge when there is no matching annotation index", () => {
    const { container } = renderWithLens(true, () => undefined);
    expect(container.querySelector("[data-annotation-badge]")).not.toBeInTheDocument();
  });

  it("renders a badge with the correct number when an index is provided", () => {
    const { container } = renderWithLens(true, (id) => (id === "test-element" ? 2 : undefined));
    const badge = container.querySelector("[data-annotation-badge]");
    expect(badge).toBeInTheDocument();
    expect(badge?.textContent).toBe("2");
  });

  it("renders outside a DesignLensProvider as a transparent passthrough (no throw)", () => {
    // Annotatable must not throw when there is no provider in the tree
    const { container } = render(
      <Annotatable id="orphan">
        <span data-testid="orphan-child">text</span>
      </Annotatable>,
    );
    expect(screen.getByTestId("orphan-child")).toBeInTheDocument();
    expect(container.querySelector("[data-annotatable]")).not.toBeInTheDocument();
  });
});
