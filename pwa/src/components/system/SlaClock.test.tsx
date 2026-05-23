import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "../../../src/i18n";
import "../../i18n";
import { SlaClock } from "./SlaClock";
import type { SlaClockVM } from "../../state/selectors";

const vm = (overrides: Partial<SlaClockVM> = {}): SlaClockVM => ({
  slaId: "SLA-pre-auth-response",
  owner: "tpa",
  status: "comfortable",
  rawState: "active",
  startedAt: "2026-04-20T11:00:00.000Z",
  deadline:  "2026-04-20T23:00:00.000Z",
  nowIso:    "2026-04-20T11:30:00.000Z",
  ...overrides,
});

describe("SlaClock", () => {
  it("comfortable: renders the 'has time' phrase and sets data-bucket", () => {
    render(<SlaClock vm={vm({ status: "comfortable" })} />);
    // owner label should appear in phrase
    expect(screen.getByText(/has time/i)).toBeInTheDocument();
    expect(document.querySelector('[data-bucket="comfortable"]')).toBeInTheDocument();
  });

  it("approaching: renders 'should be acting now' phrase and data-bucket", () => {
    render(<SlaClock vm={vm({ status: "approaching" })} />);
    expect(screen.getByText(/should be acting now/i)).toBeInTheDocument();
    expect(document.querySelector('[data-bucket="approaching"]')).toBeInTheDocument();
  });

  it("due-soon: renders 'running out of time' phrase and data-bucket", () => {
    render(<SlaClock vm={vm({ status: "due-soon" })} />);
    expect(screen.getByText(/running out of time/i)).toBeInTheDocument();
    expect(document.querySelector('[data-bucket="due-soon"]')).toBeInTheDocument();
  });

  it("breached: renders breach phrase with owner, 'breach', and remedy; sets data-bucket; no urgency bar", () => {
    const breachedVm = vm({
      status: "breached",
      rawState: "breached",
      remedy: "escalate to ombudsman",
    });
    render(<SlaClock vm={breachedVm} />);
    const root = document.querySelector('[data-bucket="breached"]');
    expect(root).toBeInTheDocument();
    // phrase should contain 'breach'
    expect(screen.getByText(/breach/i)).toBeInTheDocument();
    // owner label should appear (at least once — likely in chip + phrase)
    expect(screen.getAllByText(/TPA/i).length).toBeGreaterThan(0);
    // remedy should appear
    expect(screen.getByText(/escalate to ombudsman/i)).toBeInTheDocument();
    // no urgency bar (data-urgency-bar)
    expect(document.querySelector('[data-urgency-bar]')).not.toBeInTheDocument();
  });

  it("sets data-owner on the owner chip", () => {
    render(<SlaClock vm={vm({ owner: "tpa" })} />);
    const chip = document.querySelector('[data-owner="tpa"]');
    expect(chip).toBeInTheDocument();
  });

  it("precise={true}: shows exact remaining duration matching /\\d+\\s*[hm]/", () => {
    render(<SlaClock vm={vm()} precise={true} />);
    // should render something like "11h 30m left"
    const container = document.body;
    expect(container.textContent).toMatch(/\d+\s*[hm]/);
  });
});
