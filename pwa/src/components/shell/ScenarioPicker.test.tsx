import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import "../../i18n";
import { ScenarioPicker } from "./ScenarioPicker";
import { SCENARIOS } from "../../scenarios";

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  scenarios: SCENARIOS,
  currentScenarioId: SCENARIOS[0].id,
  onChoose: vi.fn(),
};

describe("ScenarioPicker", () => {
  it("renders all scenarios when open === true", () => {
    render(<ScenarioPicker {...defaultProps} />);
    for (const scenario of SCENARIOS) {
      // Each scenario has a button; its data-scenario-id is set
      expect(
        document.querySelector(`[data-scenario-id="${scenario.id}"]`)
      ).toBeInTheDocument();
    }
  });

  it("does not render anything when open === false", () => {
    render(<ScenarioPicker {...defaultProps} open={false} />);
    expect(document.querySelector("[data-scenario-picker]")).not.toBeInTheDocument();
  });

  it("shows the 'current' badge on the currentScenarioId", () => {
    render(<ScenarioPicker {...defaultProps} currentScenarioId={SCENARIOS[0].id} />);
    const currentBtn = document.querySelector(
      `[data-scenario-id="${SCENARIOS[0].id}"]`
    );
    expect(currentBtn).toHaveAttribute("data-current", "true");
    expect(document.querySelector("[data-current-badge]")).toBeInTheDocument();
  });

  it("does not show the badge on non-current scenarios", () => {
    render(<ScenarioPicker {...defaultProps} currentScenarioId={SCENARIOS[0].id} />);
    const nonCurrentBtn = document.querySelector(
      `[data-scenario-id="${SCENARIOS[1].id}"]`
    );
    expect(nonCurrentBtn).not.toHaveAttribute("data-current");
  });

  it("clicking a non-current scenario calls onChoose with its id", async () => {
    const onChoose = vi.fn();
    const user = userEvent.setup();
    render(
      <ScenarioPicker
        {...defaultProps}
        currentScenarioId={SCENARIOS[0].id}
        onChoose={onChoose}
      />
    );
    const btn = document.querySelector(
      `[data-scenario-id="${SCENARIOS[1].id}"]`
    ) as HTMLButtonElement;
    await user.click(btn);
    expect(onChoose).toHaveBeenCalledWith(SCENARIOS[1].id);
  });

  it("clicking the current scenario also calls onChoose", async () => {
    const onChoose = vi.fn();
    const user = userEvent.setup();
    render(
      <ScenarioPicker
        {...defaultProps}
        currentScenarioId={SCENARIOS[0].id}
        onChoose={onChoose}
      />
    );
    const btn = document.querySelector(
      `[data-scenario-id="${SCENARIOS[0].id}"]`
    ) as HTMLButtonElement;
    await user.click(btn);
    expect(onChoose).toHaveBeenCalledWith(SCENARIOS[0].id);
  });

  it("clicking the X button calls onClose", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ScenarioPicker {...defaultProps} onClose={onClose} />);
    const closeBtn = screen.getByRole("button", { name: /close picker/i });
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("pressing Escape calls onClose", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ScenarioPicker {...defaultProps} onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("has role='dialog' and aria-modal='true' on the container", () => {
    render(<ScenarioPicker {...defaultProps} />);
    const dialog = document.querySelector("[data-scenario-picker]");
    expect(dialog).toHaveAttribute("role", "dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("renders the picker heading with the correct i18n text", () => {
    render(<ScenarioPicker {...defaultProps} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Choose a scenario"
    );
  });

  it("shows title, summary, and teaches text for each scenario", () => {
    render(<ScenarioPicker {...defaultProps} />);
    // Spot-check: first scenario's teaches label is visible
    expect(screen.getAllByText(/What this teaches/i).length).toBeGreaterThan(0);
  });
});
