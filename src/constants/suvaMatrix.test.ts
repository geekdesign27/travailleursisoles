import { describe, it, expect } from "vitest";
import {
  SUVA_MATRIX,
  getZoneFromMatrix,
  type GravityLevel,
  type ProbabilityLevel,
} from "./suvaMatrix";

describe("SUVA Matrix", () => {
  it("has exactly 5 gravity levels", () => {
    expect(Object.keys(SUVA_MATRIX)).toHaveLength(5);
  });

  it("has exactly 5 probability levels per gravity", () => {
    for (const gravity of Object.values(SUVA_MATRIX)) {
      expect(Object.keys(gravity)).toHaveLength(5);
    }
  });

  it("contains exactly 25 cells", () => {
    let count = 0;
    for (const gravity of Object.values(SUVA_MATRIX)) {
      count += Object.keys(gravity).length;
    }
    expect(count).toBe(25);
  });

  it("all zones are valid (1, 2, 3a, 3b, or 4)", () => {
    const validZones = new Set([1, 2, "3a", "3b", 4]);
    for (const gravity of Object.values(SUVA_MATRIX)) {
      for (const zone of Object.values(gravity)) {
        expect(validZones.has(zone)).toBe(true);
      }
    }
  });

  // Specific cell validation based on SUVA 44094.F
  it("Zone 1 at V-E (worst case)", () => {
    expect(getZoneFromMatrix("V", "E")).toBe(1);
  });

  it("Zone 4 at I-A (best case)", () => {
    expect(getZoneFromMatrix("I", "A")).toBe(4);
  });

  it("Zone 2 at III-E", () => {
    expect(getZoneFromMatrix("III", "E")).toBe(2);
  });

  it("Zone 3a at IV-C", () => {
    expect(getZoneFromMatrix("IV", "C")).toBe("3a");
  });

  it("Zone 3b at II-C", () => {
    expect(getZoneFromMatrix("II", "C")).toBe("3b");
  });

  // Verify monotonicity: higher gravity and higher probability → more dangerous zone
  it("higher gravity with same probability gives equal or worse zone", () => {
    const zoneOrder: Record<string, number> = {
      "4": 0,
      "3b": 1,
      "3a": 2,
      "2": 3,
      "1": 4,
    };
    const gravities: GravityLevel[] = ["I", "II", "III", "IV", "V"];
    const probabilities: ProbabilityLevel[] = ["A", "B", "C", "D", "E"];

    for (const p of probabilities) {
      for (let g = 0; g < gravities.length - 1; g++) {
        const currentZone = getZoneFromMatrix(gravities[g], p);
        const nextZone = getZoneFromMatrix(gravities[g + 1], p);
        expect(zoneOrder[String(currentZone)]).toBeLessThanOrEqual(
          zoneOrder[String(nextZone)],
        );
      }
    }
  });
});
