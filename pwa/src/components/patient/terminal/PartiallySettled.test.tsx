import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "../../../i18n";
import { PartiallySettled } from "./PartiallySettled";
import { reimbursementDeductionGrievance as S } from "../../../scenarios/reimbursement-deduction-grievance";
import { selectClaimAt } from "../../../state/selectors";

// Replay to the end — claim is in partially-settled with full interactions
const claim = selectClaimAt(S, S.steps.length);

describe("PartiallySettled", () => {
  it("renders with data-terminal-screen=partiallySettled", () => {
    render(<PartiallySettled claim={claim} />);
    expect(document.querySelector('[data-terminal-screen="partiallySettled"]')).toBeInTheDocument();
  });

  it("shows the ₹75,000 paid amount", () => {
    render(<PartiallySettled claim={claim} />);
    expect(screen.getByText("₹75,000")).toBeInTheDocument();
  });

  it("lists the room-rent-cap deduction (₹15,000)", () => {
    render(<PartiallySettled claim={claim} />);
    expect(screen.getByText("₹15,000")).toBeInTheDocument();
    expect(screen.getByText(/Room rent cap exceeded/i)).toBeInTheDocument();
  });

  it("lists the sub-limit deduction (₹10,000)", () => {
    render(<PartiallySettled claim={claim} />);
    expect(screen.getByText("₹10,000")).toBeInTheDocument();
    expect(screen.getByText(/Sub-limit on diagnostics/i)).toBeInTheDocument();
  });

  it("shows grievance-resolved status when grievance has been resolved", () => {
    render(<PartiallySettled claim={claim} />);
    expect(screen.getByText(/Grievance resolved/i)).toBeInTheDocument();
  });
});
