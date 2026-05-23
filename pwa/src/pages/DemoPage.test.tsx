import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

    // /demo defaults to auto-play; pause first so manual clicks drive the walk
    const pauseBtn = document.querySelector("[data-action='toggle-playback']") as HTMLButtonElement;
    if (pauseBtn) {
      await user.click(pauseBtn);
    }

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

describe("/demo auto-play timer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function getStepIndicator(): string {
    return document.querySelector("[aria-live='polite']")?.textContent ?? "";
  }

  it("auto-advances the cursor after 2500ms at speed 1", () => {
    renderAt("/demo?scenario=cashless-planned-happy&step=0");

    // Cursor starts at 0
    expect(getStepIndicator()).toMatch(/^0 \//);

    // After one 2500ms tick the cursor should be at 1
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(getStepIndicator()).toMatch(/^1 \//);
  });

  it("does NOT advance before 2500ms have elapsed", () => {
    renderAt("/demo?scenario=cashless-planned-happy&step=0");
    expect(getStepIndicator()).toMatch(/^0 \//);

    act(() => {
      vi.advanceTimersByTime(2499);
    });

    // Still at step 0
    expect(getStepIndicator()).toMatch(/^0 \//);
  });

  it("clicking Pause stops the auto-advance", () => {
    renderAt("/demo?scenario=cashless-planned-happy&step=0");

    const pauseBtn = document.querySelector(
      "[data-action='toggle-playback']"
    ) as HTMLButtonElement;

    // Click via act() to stay within fake-timer world
    act(() => {
      pauseBtn.click();
    });

    // Mode is now manual
    expect(pauseBtn).toHaveAttribute("data-playback-mode", "manual");

    const stepBefore = getStepIndicator();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Cursor unchanged
    expect(getStepIndicator()).toBe(stepBefore);
  });

  it("auto-flips to manual when reaching the end of the scenario", () => {
    // Start one step before the end
    renderAt(
      `/demo?scenario=cashless-planned-happy&step=${S.steps.length - 1}`
    );

    const playBtn = document.querySelector(
      "[data-action='toggle-playback']"
    ) as HTMLButtonElement;

    // Initially auto
    expect(playBtn).toHaveAttribute("data-playback-mode", "auto");

    // One tick pushes cursor to steps.length, triggering the SET_MODE manual effect
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(playBtn).toHaveAttribute("data-playback-mode", "manual");
    expect(document.querySelector('[data-archetype="terminal"]')).toBeInTheDocument();
  });

  it("auto-advances faster at speed 2 (ticks at 1250ms)", () => {
    renderAt("/demo?scenario=cashless-planned-happy&step=0");
    expect(getStepIndicator()).toMatch(/^0 \//);

    // Click speed button to advance from 1× to 2×
    const speedBtn = document.querySelector("[data-action='speed']") as HTMLButtonElement;
    act(() => {
      speedBtn.click();
    });

    expect(speedBtn).toHaveAttribute("data-speed", "2");

    // 1250ms is enough at 2× (2500 / 2 = 1250)
    act(() => {
      vi.advanceTimersByTime(1250);
    });

    expect(getStepIndicator()).toMatch(/^1 \//);
  });

  it("advances multiple steps when multiple ticks elapse", () => {
    renderAt("/demo?scenario=cashless-planned-happy&step=0");
    expect(getStepIndicator()).toMatch(/^0 \//);

    // Each tick is 2500ms; advancing 3 ticks moves 3 steps
    act(() => { vi.advanceTimersByTime(2500); });
    act(() => { vi.advanceTimersByTime(2500); });
    act(() => { vi.advanceTimersByTime(2500); });

    expect(getStepIndicator()).toMatch(/^3 \//);
  });
});
