import { describe, it, expect } from "vitest";
import { evaluateAptitudes, evaluateLevel2 } from "./riskEvaluator";
import type { GravityLevel, ProbabilityLevel } from "@/constants/suvaMatrix";

describe("evaluateAptitudes", () => {
  it("returns allValid true when all aptitudes are true", () => {
    const result = evaluateAptitudes(true, true, true);
    expect(result.allValid).toBe(true);
    expect(result.psychique).toBe(true);
    expect(result.physique).toBe(true);
    expect(result.intellectuelle).toBe(true);
  });

  it("returns allValid false when psychique is false", () => {
    const result = evaluateAptitudes(false, true, true);
    expect(result.allValid).toBe(false);
  });

  it("returns allValid false when physique is false", () => {
    const result = evaluateAptitudes(true, false, true);
    expect(result.allValid).toBe(false);
  });

  it("returns allValid false when intellectuelle is false", () => {
    const result = evaluateAptitudes(true, true, false);
    expect(result.allValid).toBe(false);
  });

  it("returns allValid false when all aptitudes are false", () => {
    const result = evaluateAptitudes(false, false, false);
    expect(result.allValid).toBe(false);
  });

  // Test all 8 combinations
  const combos: [boolean, boolean, boolean, boolean][] = [
    [false, false, false, false],
    [false, false, true, false],
    [false, true, false, false],
    [false, true, true, false],
    [true, false, false, false],
    [true, false, true, false],
    [true, true, false, false],
    [true, true, true, true],
  ];

  combos.forEach(([p, ph, i, expected]) => {
    it(`(${p}, ${ph}, ${i}) → allValid=${expected}`, () => {
      expect(evaluateAptitudes(p, ph, i).allValid).toBe(expected);
    });
  });
});

describe("evaluateLevel2", () => {
  it("returns Zone 1 (blocked) for V/E", () => {
    const result = evaluateLevel2("V", "E");
    expect(result.zone).toBe(1);
    expect(result.blocked).toBe(true);
    expect(result.nextAction).toBe("level-3");
  });

  it("returns Zone 1 (blocked) for V/D", () => {
    const result = evaluateLevel2("V", "D");
    expect(result.zone).toBe(1);
    expect(result.blocked).toBe(true);
  });

  it("returns Zone 1 (blocked) for IV/E", () => {
    const result = evaluateLevel2("IV", "E");
    expect(result.zone).toBe(1);
    expect(result.blocked).toBe(true);
  });

  it("returns Zone 2 for V/C", () => {
    const result = evaluateLevel2("V", "C");
    expect(result.zone).toBe(2);
    expect(result.blocked).toBe(false);
    expect(result.nextAction).toBe("level-3");
  });

  it("returns Zone 2 for IV/D", () => {
    const result = evaluateLevel2("IV", "D");
    expect(result.zone).toBe(2);
    expect(result.blocked).toBe(false);
    expect(result.nextAction).toBe("level-3");
  });

  it("returns Zone 3a for V/B", () => {
    const result = evaluateLevel2("V", "B");
    expect(result.zone).toBe("3a");
    expect(result.blocked).toBe(false);
    expect(result.nextAction).toBe("level-3");
  });

  it("returns Zone 3b for I/D", () => {
    const result = evaluateLevel2("I", "D");
    expect(result.zone).toBe("3b");
    expect(result.blocked).toBe(false);
    expect(result.nextAction).toBe("level-3");
  });

  it("returns Zone 4 (report) for I/A", () => {
    const result = evaluateLevel2("I", "A");
    expect(result.zone).toBe(4);
    expect(result.blocked).toBe(false);
    expect(result.nextAction).toBe("report");
  });

  it("returns Zone 4 (report) for II/A", () => {
    const result = evaluateLevel2("II", "A");
    expect(result.zone).toBe(4);
    expect(result.blocked).toBe(false);
    expect(result.nextAction).toBe("report");
  });

  it("returns Zone 4 (report) for I/C", () => {
    const result = evaluateLevel2("I", "C");
    expect(result.zone).toBe(4);
    expect(result.blocked).toBe(false);
    expect(result.nextAction).toBe("report");
  });

  // Verify all gravity/probability combinations return valid results
  const gravities: GravityLevel[] = ["I", "II", "III", "IV", "V"];
  const probabilities: ProbabilityLevel[] = ["A", "B", "C", "D", "E"];

  gravities.forEach((g) => {
    probabilities.forEach((p) => {
      it(`returns valid result for ${g}/${p}`, () => {
        const result = evaluateLevel2(g, p);
        expect(result.gravity).toBe(g);
        expect(result.probability).toBe(p);
        expect([1, 2, "3a", "3b", 4]).toContain(result.zone);
        expect(typeof result.blocked).toBe("boolean");
        expect(["report", "level-3"]).toContain(result.nextAction);
      });
    });
  });
});
