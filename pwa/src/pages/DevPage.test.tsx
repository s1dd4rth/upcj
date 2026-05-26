import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../i18n";
import DevPage from "./DevPage";

function renderDev(initialPath = "/dev") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/dev" element={<DevPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("/dev engine view", () => {
  it("renders the spec hash", () => {
    renderDev();
    expect(document.querySelector("[data-spec-hash]")).toBeInTheDocument();
  });

  it("renders the validate result", () => {
    renderDev();
    expect(screen.getByText(/claim validates|validate errors/i)).toBeInTheDocument();
  });

  it("renders the replay-whole-claim button and clicking it shows ✓ deterministic", async () => {
    const user = userEvent.setup();
    renderDev();
    const btn = screen.getByRole("button", { name: /verify replay determinism/i });
    await user.click(btn);
    expect(screen.getByText(/deterministic/i)).toBeInTheDocument();
  });

  it("at cursor 0 shows 'no event applied yet'", () => {
    renderDev("/dev?scenario=cashless-planned-happy&step=0");
    expect(screen.getByText(/no event applied yet/i)).toBeInTheDocument();
  });

  it("at cursor > 0 shows the event name applied", async () => {
    const user = userEvent.setup();
    renderDev("/dev?scenario=cashless-planned-happy&step=0");
    // /dev defaults to manual mode — click Next once
    const next = screen.getByRole("button", { name: /next/i });
    await user.click(next);
    // The event name appears in a <code> element; getAllByText handles multiple matches
    // (the name also appears in ClaimJson's <pre> payload).
    const matches = screen.getAllByText(/intimate-hospitalisation/);
    expect(matches.length).toBeGreaterThan(0);
  });
});
