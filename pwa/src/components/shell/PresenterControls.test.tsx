import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import "../../i18n";
import { PresenterControls } from "./PresenterControls";

const defaultProps = {
  mode: "demo" as const,
  cursor: 3,
  max: 10,
  playbackMode: "manual" as const,
  speed: 1,
  onNext: vi.fn(),
  onBack: vi.fn(),
  onTogglePlayback: vi.fn(),
  onSetSpeed: vi.fn(),
};

describe("PresenterControls", () => {
  describe("mode='product'", () => {
    it("renders Back and Next buttons", () => {
      render(<PresenterControls {...defaultProps} mode="product" />);
      expect(screen.getByRole("button", { name: /previous event/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /next event/i })).toBeInTheDocument();
    });

    it("does NOT render the Play/Pause button", () => {
      render(<PresenterControls {...defaultProps} mode="product" />);
      expect(
        document.querySelector("[data-action='toggle-playback']")
      ).not.toBeInTheDocument();
    });

    it("does NOT render the Speed button", () => {
      render(<PresenterControls {...defaultProps} mode="product" />);
      expect(
        document.querySelector("[data-action='speed']")
      ).not.toBeInTheDocument();
    });

    it("has data-mode='product' on the root", () => {
      render(<PresenterControls {...defaultProps} mode="product" />);
      expect(document.querySelector("[data-presenter-controls]")).toHaveAttribute(
        "data-mode",
        "product"
      );
    });
  });

  describe("mode='demo'", () => {
    it("renders Back, Next, Play/Pause, and Speed buttons", () => {
      render(<PresenterControls {...defaultProps} mode="demo" />);
      expect(screen.getByRole("button", { name: /previous event/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /next event/i })).toBeInTheDocument();
      expect(
        document.querySelector("[data-action='toggle-playback']")
      ).toBeInTheDocument();
      expect(
        document.querySelector("[data-action='speed']")
      ).toBeInTheDocument();
    });

    it("Play/Pause shows 'Play' label when playbackMode is 'manual'", () => {
      render(<PresenterControls {...defaultProps} playbackMode="manual" />);
      expect(document.querySelector("[data-action='toggle-playback']")).toHaveTextContent(
        "Play"
      );
    });

    it("Play/Pause shows 'Pause' label when playbackMode is 'auto'", () => {
      render(<PresenterControls {...defaultProps} playbackMode="auto" />);
      expect(document.querySelector("[data-action='toggle-playback']")).toHaveTextContent(
        "Pause"
      );
    });

    it("clicking Play/Pause calls onTogglePlayback", async () => {
      const onTogglePlayback = vi.fn();
      const user = userEvent.setup();
      render(
        <PresenterControls
          {...defaultProps}
          onTogglePlayback={onTogglePlayback}
        />
      );
      const btn = document.querySelector(
        "[data-action='toggle-playback']"
      ) as HTMLButtonElement;
      await user.click(btn);
      expect(onTogglePlayback).toHaveBeenCalledOnce();
    });

    it("aria-pressed is false when playbackMode is 'manual'", () => {
      render(<PresenterControls {...defaultProps} playbackMode="manual" />);
      const btn = document.querySelector("[data-action='toggle-playback']");
      expect(btn).toHaveAttribute("aria-pressed", "false");
    });

    it("aria-pressed is true when playbackMode is 'auto'", () => {
      render(<PresenterControls {...defaultProps} playbackMode="auto" />);
      const btn = document.querySelector("[data-action='toggle-playback']");
      expect(btn).toHaveAttribute("aria-pressed", "true");
    });

    describe("Speed cycling: 1 → 2 → 0.5 → 1", () => {
      it("at speed=1 calls onSetSpeed(2)", async () => {
        const onSetSpeed = vi.fn();
        const user = userEvent.setup();
        render(
          <PresenterControls {...defaultProps} speed={1} onSetSpeed={onSetSpeed} />
        );
        const btn = document.querySelector("[data-action='speed']") as HTMLButtonElement;
        await user.click(btn);
        expect(onSetSpeed).toHaveBeenCalledWith(2);
      });

      it("at speed=2 calls onSetSpeed(0.5)", async () => {
        const onSetSpeed = vi.fn();
        const user = userEvent.setup();
        render(
          <PresenterControls {...defaultProps} speed={2} onSetSpeed={onSetSpeed} />
        );
        const btn = document.querySelector("[data-action='speed']") as HTMLButtonElement;
        await user.click(btn);
        expect(onSetSpeed).toHaveBeenCalledWith(0.5);
      });

      it("at speed=0.5 calls onSetSpeed(1)", async () => {
        const onSetSpeed = vi.fn();
        const user = userEvent.setup();
        render(
          <PresenterControls {...defaultProps} speed={0.5} onSetSpeed={onSetSpeed} />
        );
        const btn = document.querySelector("[data-action='speed']") as HTMLButtonElement;
        await user.click(btn);
        expect(onSetSpeed).toHaveBeenCalledWith(1);
      });
    });

    it("data-speed attribute reflects current speed", () => {
      render(<PresenterControls {...defaultProps} speed={2} />);
      const btn = document.querySelector("[data-action='speed']");
      expect(btn).toHaveAttribute("data-speed", "2");
    });

    it("data-playback-mode attribute reflects current playback mode", () => {
      render(<PresenterControls {...defaultProps} playbackMode="auto" />);
      const btn = document.querySelector("[data-action='toggle-playback']");
      expect(btn).toHaveAttribute("data-playback-mode", "auto");
    });

    it("has data-mode='demo' on the root", () => {
      render(<PresenterControls {...defaultProps} mode="demo" />);
      expect(document.querySelector("[data-presenter-controls]")).toHaveAttribute(
        "data-mode",
        "demo"
      );
    });
  });

  describe("Back/Next button states", () => {
    it("Back is disabled when cursor is 0", () => {
      render(<PresenterControls {...defaultProps} cursor={0} />);
      expect(
        document.querySelector("[data-action='back']")
      ).toBeDisabled();
    });

    it("Next is disabled when cursor equals max", () => {
      render(<PresenterControls {...defaultProps} cursor={10} max={10} />);
      expect(
        document.querySelector("[data-action='next']")
      ).toBeDisabled();
    });

    it("clicking Next calls onNext", async () => {
      const onNext = vi.fn();
      const user = userEvent.setup();
      render(<PresenterControls {...defaultProps} cursor={3} max={10} onNext={onNext} />);
      await user.click(document.querySelector("[data-action='next']") as HTMLButtonElement);
      expect(onNext).toHaveBeenCalledOnce();
    });

    it("clicking Back calls onBack", async () => {
      const onBack = vi.fn();
      const user = userEvent.setup();
      render(<PresenterControls {...defaultProps} cursor={3} max={10} onBack={onBack} />);
      await user.click(document.querySelector("[data-action='back']") as HTMLButtonElement);
      expect(onBack).toHaveBeenCalledOnce();
    });
  });
});
