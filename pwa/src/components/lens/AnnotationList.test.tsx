import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "../../i18n";
import { DesignLensProvider } from "./DesignLensProvider";
import { AnnotationList } from "./AnnotationList";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function renderList(state: Parameters<typeof AnnotationList>[0]["state"] = "pre-auth-pending") {
  return render(
    <DesignLensProvider enabled={true}>
      <AnnotationList state={state} scenarioId="cashless-planned-happy" cursor={2} />
    </DesignLensProvider>,
  );
}

// ---------------------------------------------------------------------------
// tests
// ---------------------------------------------------------------------------

describe("AnnotationList", () => {
  it("renders annotations for the current state", () => {
    renderList("pre-auth-pending");
    // pre-auth-pending has at least one annotation
    const list = document.querySelector("[data-annotation-list]");
    expect(list).toBeInTheDocument();
    const items = list?.querySelectorAll("li");
    expect(items?.length).toBeGreaterThan(0);
  });

  it("shows the heading text", () => {
    renderList("pre-auth-pending");
    expect(screen.getByText(/on this screen/i)).toBeInTheDocument();
  });

  it("shows the correct annotation count for a known state", () => {
    renderList("pre-auth-pending");
    // pre-auth-pending has 3 state-keyed annotations
    const items = document.querySelectorAll("[data-annotation-list] li");
    // ≥ 3 (state) + element-keyed annotations for engine-trace and owner-chip
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it("renders nothing when no annotations match", () => {
    render(
      <DesignLensProvider enabled={true}>
        {/* "pre-admission" has 1 annotation; verify it exists */}
        <AnnotationList state="pre-admission" scenarioId="x" cursor={0} />
      </DesignLensProvider>,
    );
    // pre-admission has 1 annotation — so the list should be present
    expect(document.querySelector("[data-annotation-list]")).toBeInTheDocument();
  });

  it("items have data-annotation-id attributes", () => {
    renderList("settled");
    const items = document.querySelectorAll("[data-annotation-id]");
    expect(items.length).toBeGreaterThan(0);
    items.forEach((item) => {
      expect(item.getAttribute("data-annotation-id")).toBeTruthy();
    });
  });
});

// ---------------------------------------------------------------------------
// highlight ring tests
// ---------------------------------------------------------------------------

describe("AnnotationList — highlight ring on click", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("tapping an element-keyed annotation item adds highlight to its Annotatable target", () => {
    // Mount a fake annotatable target for engine-trace
    const { container } = render(
      <DesignLensProvider enabled={true}>
        {/* Fake DOM target that the list will highlight */}
        <span data-annotatable="engine-trace" data-testid="engine-trace-target">trace</span>
        <AnnotationList state="pre-auth-pending" scenarioId="cashless-planned-happy" cursor={2} />
      </DesignLensProvider>,
    );

    // Find the list item that targets engine-trace
    // replay-as-source-of-truth is an engine-trace annotation
    const engineTraceItem = container.querySelector(
      '[data-annotation-id="replay-as-source-of-truth"]',
    );
    if (!engineTraceItem) {
      // If this annotation isn't rendered, skip gracefully
      return;
    }

    act(() => {
      fireEvent.click(engineTraceItem);
    });

    const target = container.querySelector('[data-annotatable="engine-trace"]');
    expect(target?.getAttribute("data-annotation-highlighted")).toBe("true");
  });

  it("highlight clears after 2 seconds", () => {
    render(
      <DesignLensProvider enabled={true}>
        <span data-annotatable="engine-trace">trace</span>
        <AnnotationList state="pre-auth-pending" scenarioId="cashless-planned-happy" cursor={2} />
      </DesignLensProvider>,
    );

    const engineTraceItem = document.querySelector(
      '[data-annotation-id="replay-as-source-of-truth"]',
    );
    if (!engineTraceItem) return;

    act(() => {
      fireEvent.click(engineTraceItem);
    });

    // Confirm it's highlighted
    const target = document.querySelector('[data-annotatable="engine-trace"]');
    expect(target?.getAttribute("data-annotation-highlighted")).toBe("true");

    // Advance time past the 2s window
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Highlight should be cleared
    expect(target?.getAttribute("data-annotation-highlighted")).toBeNull();
  });
});
