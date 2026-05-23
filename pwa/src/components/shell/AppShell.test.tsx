import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import i18n from "../../i18n/index";
import { AppShell } from "./AppShell";
import { Header } from "./Header";
import { MobileTabs } from "./MobileTabs";

// Helper: stable pane nodes for testing
const statusPane = <div data-testid="pane-status">Status content</div>;
const activityPane = <div data-testid="pane-activity">Activity content</div>;
const docsPane = <div data-testid="pane-docs">Docs content</div>;

const defaultTabs = {
  status: statusPane,
  activity: activityPane,
  docs: docsPane,
};

const defaultHeader = (
  <Header mode="demo" statusLabel="Pre-auth pending" scenarioTitle="Cashless · planned" />
);

describe("AppShell", () => {
  it("renders a single header band", () => {
    render(
      <AppShell mode="demo" header={defaultHeader} tabs={defaultTabs} />
    );
    // Either by banner role (header element) or by data attribute
    const banners = document.querySelectorAll("[data-shell-header]");
    expect(banners.length).toBe(1);
  });

  it("renders three tabs labeled correctly", () => {
    render(
      <AppShell mode="demo" header={defaultHeader} tabs={defaultTabs} />
    );
    expect(screen.getByRole("button", { name: i18n.t("ui.tabs.status") })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: i18n.t("ui.tabs.activity") })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: i18n.t("ui.tabs.docs") })).toBeInTheDocument();
  });

  it("defaults to Status tab", () => {
    render(
      <AppShell mode="demo" header={defaultHeader} tabs={defaultTabs} />
    );
    expect(screen.getByTestId("pane-status")).toBeInTheDocument();
    expect(screen.queryByTestId("pane-activity")).not.toBeInTheDocument();
    expect(screen.queryByTestId("pane-docs")).not.toBeInTheDocument();
  });

  it("switching to Activity tab swaps the rendered panel", async () => {
    const user = userEvent.setup();
    render(
      <AppShell mode="demo" header={defaultHeader} tabs={defaultTabs} />
    );
    await user.click(screen.getByRole("button", { name: i18n.t("ui.tabs.activity") }));
    expect(screen.getByTestId("pane-activity")).toBeInTheDocument();
    expect(screen.queryByTestId("pane-status")).not.toBeInTheDocument();
  });

  it("engineTrace appears inline at the bottom of the Status panel only", async () => {
    const user = userEvent.setup();
    const trace = <div data-testid="trace">trace-content</div>;
    render(
      <AppShell mode="demo" header={defaultHeader} tabs={defaultTabs} engineTrace={trace} />
    );
    // On Status tab: trace is a descendant of the status pane area
    const traceEl = screen.getByTestId("trace");
    expect(traceEl).toBeInTheDocument();
    const statusEl = screen.getByTestId("pane-status");
    expect(statusEl.parentElement).toContainElement(traceEl);

    // Switch to Activity: trace should NOT be rendered
    await user.click(screen.getByRole("button", { name: i18n.t("ui.tabs.activity") }));
    expect(screen.queryByTestId("trace")).not.toBeInTheDocument();
  });

  describe("mode-driven Header behavior", () => {
    it("product mode: renders language switcher, no demo chrome", () => {
      render(
        <Header
          mode="product"
          statusLabel="Pre-auth pending"
          languageSwitcher={<div data-testid="lang" />}
        />
      );
      expect(screen.getByTestId("lang")).toBeInTheDocument();
      expect(document.querySelector("[data-demo-chrome]")).toBeNull();
    });

    it("demo mode: renders tappable scenario title; clicking calls onOpenScenarioPicker", async () => {
      const user = userEvent.setup();
      const handler = vi.fn();
      render(
        <Header
          mode="demo"
          statusLabel="Pre-auth pending"
          scenarioTitle="Cashless · planned"
          onOpenScenarioPicker={handler}
        />
      );
      const btn = screen.getByRole("button", { name: /Cashless · planned/i });
      expect(btn).toBeInTheDocument();
      await user.click(btn);
      expect(handler).toHaveBeenCalledOnce();
    });
  });

  it("MobileTabs sets aria-current='page' on the active tab", () => {
    const onChange = vi.fn();
    render(<MobileTabs activeTab="activity" onChange={onChange} />);
    const activityBtn = screen.getByRole("button", { name: i18n.t("ui.tabs.activity") });
    expect(activityBtn).toHaveAttribute("aria-current", "page");
    const statusBtn = screen.getByRole("button", { name: i18n.t("ui.tabs.status") });
    expect(statusBtn).not.toHaveAttribute("aria-current");
  });
});
