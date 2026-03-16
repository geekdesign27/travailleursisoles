import { describe, it, expect } from "vitest";
import { evaluateLevel1Gate } from "./gateEvaluator";
import { REGULATED_WORK_CATEGORIES } from "@/constants/regulatedWork";

describe("evaluateLevel1Gate", () => {
  // Test all 14 categories individually
  REGULATED_WORK_CATEGORIES.forEach((category) => {
    it(`blocks Zone 1 for category ${category.id}: ${category.label}`, () => {
      const result = evaluateLevel1Gate([String(category.id)], false);

      expect(result.blocked).toBe(true);
      expect(result.zone).toBe(1);
      expect(result.reason).toContain(category.label);
      expect(result.reference).toBe(category.reference);
    });
  });

  it("blocks Zone 1 for minor workers", () => {
    const result = evaluateLevel1Gate([], true);

    expect(result.blocked).toBe(true);
    expect(result.zone).toBe(1);
    expect(result.reason).toContain("mineur");
    expect(result.reference).toBe("OLT 4, art. 4 al. 1");
  });

  it("returns not blocked when nothing is checked and not minor", () => {
    const result = evaluateLevel1Gate([], false);

    expect(result.blocked).toBe(false);
    expect(result.zone).toBeNull();
    expect(result.reason).toBe("");
    expect(result.reference).toBe("");
  });

  it("blocks Zone 1 when multiple categories are checked", () => {
    const result = evaluateLevel1Gate(["1", "3", "7"], false);

    expect(result.blocked).toBe(true);
    expect(result.zone).toBe(1);
    expect(result.reason).toContain("3 travaux réglementés");
  });

  it("prioritizes minor over categories when both are set", () => {
    const result = evaluateLevel1Gate(["1"], true);

    expect(result.blocked).toBe(true);
    expect(result.zone).toBe(1);
    expect(result.reason).toContain("mineur");
    expect(result.reference).toBe("OLT 4, art. 4 al. 1");
  });
});
