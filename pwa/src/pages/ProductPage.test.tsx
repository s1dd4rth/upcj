import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../i18n";
import DemoPage from "./DemoPage";

function renderProduct(path = "/product") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/product" element={<DemoPage mode="product" />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("/product zero-chrome", () => {
  it("renders without any data-demo-chrome elements", () => {
    renderProduct();
    expect(document.querySelector("[data-demo-chrome]")).toBeNull();
  });

  it("does not render the engine-trace disclosure", () => {
    renderProduct();
    expect(document.querySelector("[data-engine-trace]")).toBeNull();
  });

  it("renders the language-switcher slot", () => {
    renderProduct();
    expect(
      document.querySelector('[data-testid="language-switcher-slot"]')
    ).toBeInTheDocument();
  });

  it("renders Next/Back controls (they are present, just quiet)", () => {
    renderProduct();
    // Next button exists
    expect(
      document.querySelector('button[data-action="next"], button[aria-label*="Next" i]')
    ).toBeInTheDocument();
  });

  it("renders the presenter controls with data-mode=product (quiet styling)", () => {
    renderProduct();
    const controls = document.querySelector("[data-presenter-controls]");
    expect(controls).toBeInTheDocument();
    expect(controls).toHaveAttribute("data-mode", "product");
  });

  it("does not render the scenario title button", () => {
    renderProduct();
    // In product mode the scenario title button is not passed to Header
    const demoChromeRow = document.querySelector("[data-demo-chrome]");
    expect(demoChromeRow).toBeNull();
  });
});
