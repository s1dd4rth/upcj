import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "../../i18n";
import { ActivityFeed } from "./ActivityFeed";
import type { ActivityEntryVM } from "../../state/selectors";

const entry = (overrides: Partial<ActivityEntryVM> = {}): ActivityEntryVM => ({
  interactionId: "INT-001",
  actor: "patient",
  atIso: "2026-04-20T09:00:00.000Z",
  eventName: "intimate-hospitalisation",
  plainTextKey: "activity.intimate-hospitalisation",
  ...overrides,
});

describe("ActivityFeed", () => {
  it("renders one entry per interaction", () => {
    render(<ActivityFeed entries={[
      entry({ interactionId: "INT-001", actor: "patient", plainTextKey: "activity.intimate-hospitalisation" }),
      entry({ interactionId: "INT-002", actor: "hospital", plainTextKey: "activity.doctor-signs-admission-advice" }),
    ]} />);
    expect(document.querySelectorAll("[data-activity-entry]")).toHaveLength(2);
  });

  it("sets data-owner per entry", () => {
    render(<ActivityFeed entries={[entry({ actor: "tpa" })]} />);
    expect(document.querySelector('[data-activity-entry] [data-owner="tpa"]')).toBeInTheDocument();
  });

  it("renders the empty-state when entries is []", () => {
    render(<ActivityFeed entries={[]} />);
    expect(screen.getByText(/nothing has happened yet/i)).toBeInTheDocument();
  });

  it("never renders chat bubbles, avatars, or emoji-like decoration", () => {
    render(<ActivityFeed entries={[entry()]} />);
    // crude: no element with class containing "bubble" or "avatar"
    expect(document.querySelector('[class*="bubble"], [class*="avatar"]')).toBeNull();
  });
});
