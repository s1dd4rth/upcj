import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import "../../i18n";
import { JourneyRail } from "./JourneyRail";
import type { ClaimStatus } from "../../engine-adapter";

describe("JourneyRail", () => {
  it("renders 6 phase sections and 15 state items", () => {
    const cbs: Partial<Record<ClaimStatus, number>> = {
      "pre-admission": 0,
      "intimated": 1,
    };
    render(
      <JourneyRail status="intimated" cursorByStatus={cbs} onJumpToCursor={() => {}} />
    );
    expect(document.querySelectorAll("h3").length).toBe(6);
    expect(document.querySelectorAll("[data-state]").length).toBe(15);
  });

  it("marks the current state with data-active='true'", () => {
    render(
      <JourneyRail
        status="pre-auth-pending"
        cursorByStatus={{}}
        onJumpToCursor={() => {}}
      />
    );
    expect(
      document.querySelector('[data-state="pre-auth-pending"][data-active="true"]')
    ).toBeInTheDocument();
  });

  it("all other states have data-active='false'", () => {
    render(
      <JourneyRail status="intimated" cursorByStatus={{}} onJumpToCursor={() => {}} />
    );
    const activeTrue = document.querySelectorAll("[data-active='true']");
    expect(activeTrue.length).toBe(1);
    expect(activeTrue[0]).toHaveAttribute("data-state", "intimated");
  });

  it("reachable states are buttons that dispatch JUMP", async () => {
    const user = userEvent.setup();
    const jump = vi.fn();
    render(
      <JourneyRail
        status="pre-auth-pending"
        cursorByStatus={{
          "pre-admission": 0,
          "intimated": 1,
          "admission-advised": 2,
          "pre-auth-pending": 3,
        }}
        onJumpToCursor={jump}
      />
    );
    await user.click(screen.getByRole("button", { name: /pre-admission/i }));
    expect(jump).toHaveBeenCalledWith(0);
  });

  it("unreachable states are not buttons", () => {
    render(
      <JourneyRail
        status="intimated"
        cursorByStatus={{ "pre-admission": 0, "intimated": 1 }}
        onJumpToCursor={() => {}}
      />
    );
    // "settled" was never reached; it should not be a button
    const settled = document.querySelector('[data-state="settled"]');
    expect(settled?.tagName.toLowerCase()).not.toBe("button");
  });

  it("renders terminal states with the closeout phase emphasis", () => {
    render(
      <JourneyRail
        status="settled"
        cursorByStatus={{ "pre-admission": 0, "settled": 7 }}
        onJumpToCursor={() => {}}
      />
    );
    const settled = document.querySelector('[data-state="settled"][data-active="true"]');
    expect(settled).toBeInTheDocument();
    // settled should be inside the closeout phase section
    expect(settled?.closest("[data-phase='closeout']")).toBeInTheDocument();
  });

  it("complete states have data-complete='true'", () => {
    // At pre-auth-pending (index 3), pre-admission (0), intimated (1), admission-advised (2)
    // should be marked complete.
    render(
      <JourneyRail
        status="pre-auth-pending"
        cursorByStatus={{
          "pre-admission": 0,
          "intimated": 1,
          "admission-advised": 2,
          "pre-auth-pending": 3,
        }}
        onJumpToCursor={() => {}}
      />
    );
    expect(
      document.querySelector('[data-state="pre-admission"][data-complete="true"]')
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-state="intimated"][data-complete="true"]')
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-state="admission-advised"][data-complete="true"]')
    ).toBeInTheDocument();
    // current is not complete
    expect(
      document.querySelector('[data-state="pre-auth-pending"][data-complete="false"]')
    ).toBeInTheDocument();
  });

  it("reachable state button passes correct cursor on click", async () => {
    const user = userEvent.setup();
    const jump = vi.fn();
    render(
      <JourneyRail
        status="in-treatment-cashless"
        cursorByStatus={{
          "pre-admission": 0,
          "intimated": 1,
          "admission-advised": 2,
          "pre-auth-pending": 3,
          "in-treatment-cashless": 4,
        }}
        onJumpToCursor={jump}
      />
    );
    await user.click(screen.getByRole("button", { name: /intimated/i }));
    expect(jump).toHaveBeenCalledWith(1);
  });
});
