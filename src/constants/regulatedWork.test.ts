import { describe, it, expect } from "vitest";
import { REGULATED_WORK_CATEGORIES } from "./regulatedWork";

describe("Regulated Work Categories", () => {
  it("has exactly 14 categories", () => {
    expect(REGULATED_WORK_CATEGORIES).toHaveLength(14);
  });

  it("all categories have unique IDs", () => {
    const ids = REGULATED_WORK_CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(14);
  });

  it("all categories have label, reference, and description", () => {
    for (const cat of REGULATED_WORK_CATEGORIES) {
      expect(cat.label).toBeTruthy();
      expect(cat.reference).toBeTruthy();
      expect(cat.description).toBeTruthy();
    }
  });

  it("includes personnel mineur (< 18 ans)", () => {
    const mineur = REGULATED_WORK_CATEGORIES.find((c) =>
      c.label.includes("mineur"),
    );
    expect(mineur).toBeDefined();
  });

  it("includes travaux en réservoirs", () => {
    const reservoirs = REGULATED_WORK_CATEGORIES.find((c) =>
      c.label.includes("réservoirs"),
    );
    expect(reservoirs).toBeDefined();
  });
});
