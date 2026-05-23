import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "../../i18n";
import { StateScreen } from "./StateScreen";
import type { ClaimStatus } from "../../engine-adapter";
import { STATE_CONTENT } from "./state-content";
import { cashlessPlannedHappy as S } from "../../scenarios/cashless-planned-happy";
import { selectClaimAt, selectSlaClocks } from "../../state/selectors";

const at = (cursor: number) => ({
  claim: selectClaimAt(S, cursor),
  slaClocks: selectSlaClocks(S, cursor),
});

describe("StateScreen", () => {
  it("renders Neutral archetype for pre-admission", () => {
    const { claim, slaClocks } = at(0);
    render(<StateScreen status="pre-admission" claim={claim} slaClocks={slaClocks} />);
    expect(document.querySelector('[data-archetype="neutral"]')).toBeInTheDocument();
    expect(screen.getByText(/decided to seek treatment/i)).toBeInTheDocument();
  });

  it("renders Waiting archetype for pre-auth-pending with a who-we're-waiting-on block", () => {
    // cursor 4 = after pre-auth-filed; claim.status === "pre-auth-pending"
    const { claim, slaClocks } = at(4);
    render(<StateScreen status="pre-auth-pending" claim={claim} slaClocks={slaClocks} />);
    expect(document.querySelector('[data-archetype="waiting"]')).toBeInTheDocument();
    // some owner appears
    expect(document.querySelector('[data-owner]')).toBeInTheDocument();
  });

  it("renders the Settled terminal screen as a settlement statement", () => {
    const { claim, slaClocks } = at(S.steps.length);
    render(<StateScreen status="settled" claim={claim} slaClocks={slaClocks} />);
    expect(document.querySelector('[data-archetype="terminal"][data-terminal-screen="settled"]')).toBeInTheDocument();
    // a "Settled" indicator is visible
    expect(screen.getByText(/Settled/i)).toBeInTheDocument();
    // the settlement statement shows the paid amount (95000 → ₹95,000)
    expect(screen.getByText(/₹95,000/)).toBeInTheDocument();
  });

  it.skip("STATE_CONTENT covers every ClaimStatus — un-skipped in Task 2.4", () => {
    const all: ClaimStatus[] = [
      "pre-admission","intimated","admission-advised","in-treatment-cashless",
      "in-treatment-reimbursement","pre-auth-pending","discharged","in-adjudication",
      "in-query","awaiting-patient-action","settled","partially-settled",
      "withdrawn","closed-without-settlement","rejected",
    ];
    for (const s of all) expect(STATE_CONTENT[s]).toBeDefined();
  });
});
