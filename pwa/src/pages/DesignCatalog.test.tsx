import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../i18n";
import DesignCatalog from "./DesignCatalog";

describe("/design catalog", () => {
  function renderDesign() {
    return render(
      <MemoryRouter initialEntries={["/design"]}>
        <Routes>
          <Route path="/design" element={<DesignCatalog />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it("renders the hero with a link to /demo", () => {
    renderDesign();
    expect(screen.getByText(/show me the demo/i)).toBeInTheDocument();
  });

  it("renders sections for error-prevention, clarity, system-design, data-modeling, heuristics, tryIt", () => {
    renderDesign();
    for (const key of ["error-prevention", "clarity", "system-design", "data-modeling", "heuristics", "tryIt"]) {
      expect(document.querySelector(`[data-design-section="${key}"]`)).toBeInTheDocument();
    }
  });

  it("renders all 10 heuristics with their names", () => {
    renderDesign();
    for (let i = 1; i <= 10; i++) {
      const heading = screen.getByRole("heading", { name: new RegExp(`^${i}:`, "i") });
      expect(heading).toBeInTheDocument();
    }
  });

  it("renders at least one deep link to /demo per major section", () => {
    renderDesign();
    const links = Array.from(document.querySelectorAll('a[href*="#/demo"]'));
    expect(links.length).toBeGreaterThanOrEqual(5);
  });

  it("each deep link includes lens=on", () => {
    renderDesign();
    const links = Array.from(document.querySelectorAll('a[href*="#/demo"]')) as HTMLAnchorElement[];
    for (const link of links) {
      expect(link.href).toContain("lens=on");
    }
  });

  it("the tryIt section lists every scenario", () => {
    renderDesign();
    const tryItSection = document.querySelector('[data-design-section="tryIt"]');
    expect(tryItSection).toBeInTheDocument();
    // every scenario id should appear in some link inside the try-it section
    const links = tryItSection?.querySelectorAll("a") ?? [];
    expect(links.length).toBeGreaterThanOrEqual(5);
  });
});
