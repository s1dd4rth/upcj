import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import "../../i18n";
import { DocChecklist } from "./DocChecklist";
import type { DocVM } from "../../state/selectors";

const doc = (overrides: Partial<DocVM> = {}): DocVM => ({
  docId: "DOC-001",
  nameKey: "Insurance Policy Card / E-Card",
  status: "provided",
  responsible: "patient",
  relevantAtStep: "1.1 — OPD Consultation",
  ...overrides,
});

describe("DocChecklist", () => {
  it("groups docs by phase, not flat", () => {
    render(<DocChecklist docs={[
      doc({ docId: "DOC-001", relevantAtStep: "1.1 — OPD" }),
      doc({ docId: "DOC-005", relevantAtStep: "2.3 — Admission", responsible: "hospital", status: "required" }),
      doc({ docId: "DOC-006", relevantAtStep: "A.1 — Pre-auth filing", responsible: "hospital", status: "provided" }),
    ]}/>);
    expect(document.querySelectorAll("[data-phase]").length).toBeGreaterThanOrEqual(2);
    expect(document.querySelector('[data-phase="beforeAdmission"]')).toBeInTheDocument();
    expect(document.querySelector('[data-phase="cashless"]')).toBeInTheDocument();
  });

  it("renders the responsible-party chip with the owner color attribute", () => {
    render(<DocChecklist docs={[doc({ responsible: "hospital" })]} />);
    expect(document.querySelector('[data-owner="hospital"]')).toBeInTheDocument();
  });

  it("uses the right status badge per doc", () => {
    render(<DocChecklist docs={[
      doc({ docId: "DOC-001", status: "provided" }),
      doc({ docId: "DOC-005", status: "required" }),
    ]} />);
    expect(document.querySelector('[data-doc-id="DOC-001"] [data-status="provided"]')).toBeInTheDocument();
    expect(document.querySelector('[data-doc-id="DOC-005"] [data-status="required"]')).toBeInTheDocument();
  });

  it("reveals notes when 'Why is this needed?' is expanded", async () => {
    const user = userEvent.setup();
    render(<DocChecklist docs={[doc({ notes: "Carry it during hospitalisation." })]} />);

    // Notes text should exist in the DOM but be inside a closed <details>
    const notesText = screen.getByText(/carry it during hospitalisation/i);
    const detailsEl = notesText.closest("details") as HTMLDetailsElement;
    expect(detailsEl).not.toBeNull();
    expect(detailsEl.open).toBe(false);

    // Click the summary to expand
    await user.click(screen.getByText(/why is this needed/i));
    expect(detailsEl.open).toBe(true);
  });

  it("renders the empty-state when docs is []", () => {
    render(<DocChecklist docs={[]} />);
    expect(screen.getByText(/no documents required/i)).toBeInTheDocument();
  });
});
