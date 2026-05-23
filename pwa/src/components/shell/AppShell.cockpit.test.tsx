/**
 * Tests for the responsive cockpit layout (Task 3.1).
 * At min-width 900px the shell reflows into a 3-column grid;
 * at narrow widths it stays in the mobile tab-based layout.
 */
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppShell } from "./AppShell";
import { Header } from "./Header";

// Stable panes with unique testids
const statusPane = <div data-testid="cockpit-status">Status content</div>;
const activityPane = <div data-testid="cockpit-activity">Activity content</div>;
const docsPane = <div data-testid="cockpit-docs">Docs content</div>;
const engineTracePane = <div data-testid="cockpit-trace">Trace content</div>;

const defaultTabs = {
  status: statusPane,
  activity: activityPane,
  docs: docsPane,
};

const defaultHeader = (
  <Header mode="demo" statusLabel="Pre-auth pending" scenarioTitle="Cashless · planned" />
);

/** Build a matchMedia mock that reports the given matches value. */
function mockMatchMedia(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  const mql = {
    matches,
    media: "(min-width: 900px)",
    onchange: null,
    addEventListener: (_type: string, cb: (e: MediaQueryListEvent) => void) => {
      listeners.push(cb);
    },
    removeEventListener: (_type: string, cb: (e: MediaQueryListEvent) => void) => {
      const idx = listeners.indexOf(cb);
      if (idx !== -1) listeners.splice(idx, 1);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    /** Test helper — fire a change event */
    _fire: (newMatches: boolean) => {
      const event = { matches: newMatches } as MediaQueryListEvent;
      for (const l of listeners) l(event);
    },
  };
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockReturnValue(mql),
  });
  return mql;
}

describe("AppShell cockpit layout", () => {
  beforeEach(() => {
    // Reset matchMedia between tests
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: undefined,
    });
  });

  describe("narrow viewport (matchMedia returns false)", () => {
    it("renders data-layout=mobile on the root", () => {
      mockMatchMedia(false);
      render(
        <AppShell mode="demo" header={defaultHeader} tabs={defaultTabs} />,
      );
      const root = document.querySelector("[data-layout]");
      expect(root).toHaveAttribute("data-layout", "mobile");
    });

    it("MobileTabs nav is present in the DOM", () => {
      mockMatchMedia(false);
      render(
        <AppShell mode="demo" header={defaultHeader} tabs={defaultTabs} />,
      );
      // MobileTabs renders a <nav> element
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("only the active tab's content is in the DOM (lazy-mount preserved)", () => {
      mockMatchMedia(false);
      render(
        <AppShell mode="demo" header={defaultHeader} tabs={defaultTabs} />,
      );
      // Default tab is "status"
      expect(screen.getByTestId("cockpit-status")).toBeInTheDocument();
      expect(screen.queryByTestId("cockpit-activity")).not.toBeInTheDocument();
      expect(screen.queryByTestId("cockpit-docs")).not.toBeInTheDocument();
    });

    it("cockpit rail elements are NOT in the DOM at narrow widths", () => {
      mockMatchMedia(false);
      render(
        <AppShell mode="demo" header={defaultHeader} tabs={defaultTabs} />,
      );
      expect(document.querySelector("[data-cockpit-rail-left]")).toBeNull();
      expect(document.querySelector("[data-cockpit-rail-right]")).toBeNull();
      expect(document.querySelector("[data-cockpit-center]")).toBeNull();
    });
  });

  describe("wide viewport (matchMedia returns true)", () => {
    it("renders data-layout=cockpit on the root", () => {
      mockMatchMedia(true);
      render(
        <AppShell mode="demo" header={defaultHeader} tabs={defaultTabs} />,
      );
      const root = document.querySelector("[data-layout]");
      expect(root).toHaveAttribute("data-layout", "cockpit");
    });

    it("data-cockpit-center element is in the DOM", () => {
      mockMatchMedia(true);
      render(
        <AppShell mode="demo" header={defaultHeader} tabs={defaultTabs} />,
      );
      expect(document.querySelector("[data-cockpit-center]")).not.toBeNull();
    });

    it("data-cockpit-rail-left placeholder is in the DOM", () => {
      mockMatchMedia(true);
      render(
        <AppShell mode="demo" header={defaultHeader} tabs={defaultTabs} />,
      );
      expect(document.querySelector("[data-cockpit-rail-left]")).not.toBeNull();
    });

    it("data-cockpit-rail-right is in the DOM", () => {
      mockMatchMedia(true);
      render(
        <AppShell mode="demo" header={defaultHeader} tabs={defaultTabs} />,
      );
      expect(document.querySelector("[data-cockpit-rail-right]")).not.toBeNull();
    });

    it("MobileTabs nav is NOT in the DOM at wide widths", () => {
      mockMatchMedia(true);
      render(
        <AppShell mode="demo" header={defaultHeader} tabs={defaultTabs} />,
      );
      expect(screen.queryByRole("navigation")).toBeNull();
    });

    it("status pane content appears inside data-cockpit-center regardless of activeTab", () => {
      mockMatchMedia(true);
      render(
        <AppShell
          mode="demo"
          header={defaultHeader}
          tabs={defaultTabs}
          activeTab="docs" // simulate user had navigated to docs in mobile
        />,
      );
      const center = document.querySelector("[data-cockpit-center]");
      expect(center).not.toBeNull();
      // Status pane should be rendered inside the center column
      const statusEl = screen.getByTestId("cockpit-status");
      expect(center).toContainElement(statusEl);
    });

    it("activity and docs panes appear inside data-cockpit-rail-right", () => {
      mockMatchMedia(true);
      render(
        <AppShell mode="demo" header={defaultHeader} tabs={defaultTabs} />,
      );
      const railRight = document.querySelector("[data-cockpit-rail-right]");
      expect(railRight).not.toBeNull();
      expect(railRight).toContainElement(screen.getByTestId("cockpit-activity"));
      expect(railRight).toContainElement(screen.getByTestId("cockpit-docs"));
    });

    it("engineTrace renders inside data-cockpit-center at wide widths", () => {
      mockMatchMedia(true);
      render(
        <AppShell
          mode="demo"
          header={defaultHeader}
          tabs={defaultTabs}
          engineTrace={engineTracePane}
        />,
      );
      const center = document.querySelector("[data-cockpit-center]");
      expect(center).toContainElement(screen.getByTestId("cockpit-trace"));
    });
  });

  describe("viewport resize — narrow to wide", () => {
    it("switches from mobile to cockpit layout when viewport widens", async () => {
      const mql = mockMatchMedia(false);
      render(
        <AppShell mode="demo" header={defaultHeader} tabs={defaultTabs} />,
      );

      // Starts mobile
      expect(document.querySelector("[data-layout]")).toHaveAttribute("data-layout", "mobile");

      // Simulate viewport resize above 900px
      act(() => {
        mql._fire(true);
      });

      expect(document.querySelector("[data-layout]")).toHaveAttribute("data-layout", "cockpit");
      expect(document.querySelector("[data-cockpit-center]")).not.toBeNull();
    });
  });
});
