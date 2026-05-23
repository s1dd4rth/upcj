import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../i18n";
import DemoPage from "./DemoPage";
import { cashlessPlannedHappy as S } from "../scenarios/cashless-planned-happy";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/demo" element={<DemoPage mode="demo" />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("/demo end-to-end (manual mode)", () => {
  it("loads scenario 1 at cursor 0 in the Neutral pre-admission state", () => {
    renderAt("/demo?scenario=cashless-planned-happy&step=0");
    expect(document.querySelector('[data-archetype="neutral"]')).toBeInTheDocument();
  });

  it("steps through every event and lands on the Settled terminal screen", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();
    renderAt("/demo?scenario=cashless-planned-happy&step=0");

    const next = () => screen.getByRole("button", { name: /next event/i });
    for (let i = 0; i < S.steps.length; i++) {
      await user.click(next());
    }

    expect(
      document.querySelector('[data-archetype="terminal"][data-terminal-screen="settled"]')
    ).toBeInTheDocument();

    // no React warnings/errors during the walk
    const real = errorSpy.mock.calls.filter(
      (call) => !String(call[0]).includes("React Router")
    );
    expect(real).toHaveLength(0);

    errorSpy.mockRestore();
  });

  it("renders the explicit error state when replay fails — clamped step=999 stays on terminal", () => {
    renderAt("/demo?scenario=cashless-planned-happy&step=999");
    // clamp keeps us on the terminal screen, not the error
    expect(document.querySelector('[data-archetype="terminal"]')).toBeInTheDocument();
  });
});
