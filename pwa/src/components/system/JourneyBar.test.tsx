import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "../../i18n";
import { JourneyBar } from "./JourneyBar";

describe("JourneyBar", () => {
  it("renders 6 phase segments labelled per i18n keys", () => {
    render(<JourneyBar status="pre-admission" />);
    // all 6 phase labels should be visible
    expect(screen.getByText("Intake")).toBeInTheDocument();
    expect(screen.getByText("Admission")).toBeInTheDocument();
    expect(screen.getByText("Treatment")).toBeInTheDocument();
    expect(screen.getByText("Discharge")).toBeInTheDocument();
    expect(screen.getByText("Queries")).toBeInTheDocument();
    expect(screen.getByText("Closeout")).toBeInTheDocument();
  });

  it("'intimated' makes intake current, all others future", () => {
    render(<JourneyBar status="intimated" />);
    const intakeSegment = document.querySelector('[data-phase="intake"]');
    expect(intakeSegment).toHaveAttribute("data-state", "current");

    const futurePhases = ["admission", "treatment", "discharge", "dialogue", "closeout"];
    for (const phase of futurePhases) {
      expect(document.querySelector(`[data-phase="${phase}"]`)).toHaveAttribute("data-state", "future");
    }
  });

  it("'settled' makes closeout current+terminal; all 5 other phases are complete", () => {
    render(<JourneyBar status="settled" />);
    const closeout = document.querySelector('[data-phase="closeout"]');
    expect(closeout).toHaveAttribute("data-state", "current");
    expect(closeout).toHaveAttribute("data-terminal", "true");

    const completePhases = ["intake", "admission", "treatment", "discharge", "dialogue"];
    for (const phase of completePhases) {
      expect(document.querySelector(`[data-phase="${phase}"]`)).toHaveAttribute("data-state", "complete");
    }
  });

  it("'Show all 15 states' details element contains all 15 status labels", () => {
    render(<JourneyBar status="pre-admission" />);
    const details = screen.getByText("Show all 15 states").closest("details");
    expect(details).toBeInTheDocument();

    const allLabels = [
      "Pre-admission",
      "Intimated",
      "Admission advised",
      "Pre-auth pending",
      "In treatment (cashless)",
      "In treatment (reimbursement)",
      "Discharged",
      "In adjudication",
      "In query",
      "Awaiting patient action",
      "Settled",
      "Partially settled",
      "Rejected",
      "Withdrawn",
      "Closed without settlement",
    ];
    for (const label of allLabels) {
      expect(details).toHaveTextContent(label);
    }
  });
});
