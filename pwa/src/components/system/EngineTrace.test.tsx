import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "../../i18n";
import { EngineTrace } from "./EngineTrace";
import type { EngineTraceVM } from "../../state/selectors";

const sampleVm: EngineTraceVM = {
  eventApplied: {
    name: "ClaimIntimated",
    payload: { policyNumber: "POL-001", hospitalCode: "HOSP-042" },
  },
  statusBefore: "pre-admission",
  statusAfter: "intimated",
  newInteractionId: "INT-001",
};

describe("EngineTrace", () => {
  it("renders nothing when vm is null", () => {
    const { container } = render(<EngineTrace vm={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a <details data-engine-trace> with summary and content when vm is provided", () => {
    render(<EngineTrace vm={sampleVm} />);
    const details = document.querySelector("[data-engine-trace]");
    expect(details).toBeInTheDocument();
    expect(details!.tagName).toBe("DETAILS");

    // Summary text
    expect(screen.getByText("What just changed?")).toBeInTheDocument();

    // Event name
    expect(screen.getByText(/ClaimIntimated/)).toBeInTheDocument();

    // Payload JSON - check at least one key appears in a pre element
    const pre = document.querySelector("pre");
    expect(pre).toBeInTheDocument();
    expect(pre!.textContent).toContain("POL-001");

    // Status transition
    expect(screen.getByText(/pre-admission/)).toBeInTheDocument();
    expect(screen.getByText(/intimated/)).toBeInTheDocument();

    // New interaction id
    expect(screen.getByText(/INT-001/)).toBeInTheDocument();
  });

  it("sets open attribute when expanded={true}", () => {
    render(<EngineTrace vm={sampleVm} expanded={true} />);
    const details = document.querySelector("[data-engine-trace]") as HTMLDetailsElement;
    expect(details.open).toBe(true);
  });
});
