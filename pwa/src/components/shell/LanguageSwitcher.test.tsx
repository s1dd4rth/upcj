import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import "../../i18n";
import { i18n } from "../../i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

// jsdom's localStorage is a no-op object (no Storage methods) in this project's
// vitest setup — stub it with a minimal in-memory implementation so we can
// assert writes without depending on the real Web Storage API.
const _store: Record<string, string> = {};
const localStorageMock: Pick<Storage, "setItem" | "getItem" | "removeItem"> = {
  setItem: vi.fn((k: string, v: string) => { _store[k] = v; }),
  getItem: vi.fn((k: string) => _store[k] ?? null),
  removeItem: vi.fn((k: string) => { delete _store[k]; }),
};

vi.stubGlobal("localStorage", localStorageMock);

describe("LanguageSwitcher", () => {
  beforeEach(async () => {
    // Reset mock state and calls
    vi.clearAllMocks();
    delete _store["upcj.lang"];
    // Ensure we start each test in English
    await i18n.changeLanguage("en");
    document.documentElement.setAttribute("lang", "en");
  });

  it("renders both language buttons with their own labels regardless of active language", async () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText(/English/i)).toBeInTheDocument();
    expect(screen.getByText(/हिन्दी/)).toBeInTheDocument();
  });

  it("clicking Hindi switches the active language and updates <html lang> and localStorage", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);
    await user.click(screen.getByRole("button", { name: /हिन्दी/ }));
    expect(document.documentElement.getAttribute("lang")).toBe("hi");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("upcj.lang", "hi");
    expect(i18n.language).toBe("hi");

    // switch back so other tests aren't affected
    await user.click(screen.getByRole("button", { name: /English/ }));
  });

  it("sets aria-pressed correctly", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);
    expect(screen.getByRole("button", { name: /English/ }).getAttribute("aria-pressed")).toBe("true");
    await user.click(screen.getByRole("button", { name: /हिन्दी/ }));
    expect(screen.getByRole("button", { name: /हिन्दी/ }).getAttribute("aria-pressed")).toBe("true");
    // switch back
    await user.click(screen.getByRole("button", { name: /English/ }));
  });

  it("has a group role and accessible label", () => {
    render(<LanguageSwitcher />);
    const group = screen.getByRole("group", { name: /Language/i });
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute("data-language-switcher");
  });

  it("clicking English writes 'en' to localStorage and updates html lang", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);
    // First switch to Hindi
    await user.click(screen.getByRole("button", { name: /हिन्दी/ }));
    expect(localStorageMock.setItem).toHaveBeenCalledWith("upcj.lang", "hi");
    // Now switch back to English
    await user.click(screen.getByRole("button", { name: /English/ }));
    expect(localStorageMock.setItem).toHaveBeenCalledWith("upcj.lang", "en");
    expect(document.documentElement.getAttribute("lang")).toBe("en");
  });

  it("language labels always render in their own script, regardless of active language", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    // While English is active
    expect(screen.getByRole("button", { name: /English/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /हिन्दी/ })).toBeInTheDocument();

    // Switch to Hindi
    await user.click(screen.getByRole("button", { name: /हिन्दी/ }));

    // Labels still rendered in their own scripts
    expect(screen.getByRole("button", { name: /English/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /हिन्दी/ })).toBeInTheDocument();

    // switch back
    await user.click(screen.getByRole("button", { name: /English/ }));
  });
});
