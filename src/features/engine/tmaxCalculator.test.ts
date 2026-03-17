import { describe, it, expect } from "vitest";
import { calculateTmax, evaluateLevel3 } from "./tmaxCalculator";
import type { ZoneRisque } from "@/constants/suvaMatrix";

describe("calculateTmax", () => {
  it("uses base 480 for zone 3a", () => {
    const result = calculateTmax({
      tempsSecouristes: 10,
      tempsAmbulance: 15,
      tempsSauvetage: 5,
      zone: "3a",
      gravite: "IV",
    });
    // 480 - 10 - 15 - 5 = 450
    expect(result.base).toBe(480);
    expect(result.tmax).toBe(450);
    expect(result.feasible).toBe(true);
  });

  it("uses base 240 for zone 3b", () => {
    const result = calculateTmax({
      tempsSecouristes: 10,
      tempsAmbulance: 15,
      tempsSauvetage: 5,
      zone: "3b",
      gravite: "III",
    });
    // 240 - 10 - 15 - 5 = 210
    expect(result.base).toBe(240);
    expect(result.tmax).toBe(210);
    expect(result.feasible).toBe(true);
  });

  it("returns negative tmax when delays exceed base", () => {
    const result = calculateTmax({
      tempsSecouristes: 100,
      tempsAmbulance: 100,
      tempsSauvetage: 100,
      zone: "3b",
      gravite: "II",
    });
    // 240 - 100 - 100 - 100 = -60
    expect(result.tmax).toBe(-60);
    expect(result.feasible).toBe(false);
  });

  it("returns not feasible when tmax <= 30 (SUVA threshold)", () => {
    const result = calculateTmax({
      tempsSecouristes: 100,
      tempsAmbulance: 100,
      tempsSauvetage: 50,
      zone: "3a",
      gravite: "IV",
    });
    // 480 - 100 - 100 - 50 = 230 → feasible
    expect(result.tmax).toBe(230);
    expect(result.feasible).toBe(true);

    const result2 = calculateTmax({
      tempsSecouristes: 200,
      tempsAmbulance: 150,
      tempsSauvetage: 100,
      zone: "3a",
      gravite: "IV",
    });
    // 480 - 200 - 150 - 100 = 30 → NOT feasible (threshold is > 30)
    expect(result2.tmax).toBe(30);
    expect(result2.feasible).toBe(false);
  });

  it("calculates intervalle as tmax - 15 min safety margin", () => {
    const result = calculateTmax({
      tempsSecouristes: 10,
      tempsAmbulance: 15,
      tempsSauvetage: 5,
      zone: "3a",
      gravite: "IV",
    });
    // t_max = 450, intervalle = 450 - 15 = 435
    expect(result.intervalle).toBe(435);
  });

  it("intervalle is never negative", () => {
    const result = calculateTmax({
      tempsSecouristes: 100,
      tempsAmbulance: 100,
      tempsSauvetage: 100,
      zone: "3b",
      gravite: "II",
    });
    expect(result.intervalle).toBe(0);
  });

  it("handles all zeros", () => {
    const result = calculateTmax({
      tempsSecouristes: 0,
      tempsAmbulance: 0,
      tempsSauvetage: 0,
      zone: "3a",
      gravite: "IV",
    });
    expect(result.tmax).toBe(480);
    expect(result.feasible).toBe(true);
  });

  it("always sets reclassificationNeeded to false (pure calculation)", () => {
    const result = calculateTmax({
      tempsSecouristes: 200,
      tempsAmbulance: 200,
      tempsSauvetage: 200,
      zone: "3a",
      gravite: "IV",
    });
    expect(result.reclassificationNeeded).toBe(false);
  });
});

describe("evaluateLevel3", () => {
  it("returns feasible and level-4 when tmax > 30", () => {
    const result = evaluateLevel3(100, "3a");
    expect(result.feasible).toBe(true);
    expect(result.reclassificationNeeded).toBe(false);
    expect(result.nextAction).toBe("level-4");
    expect(result.newZone).toBeUndefined();
  });

  it("returns feasible for tmax > 30 regardless of zone", () => {
    const zones: ZoneRisque[] = [2, "3a", "3b"];
    for (const zone of zones) {
      const result = evaluateLevel3(50, zone);
      expect(result.feasible).toBe(true);
      expect(result.nextAction).toBe("level-4");
    }
  });

  it("reclassifies zone 3a to zone 2 when tmax between 0 and 30", () => {
    const result = evaluateLevel3(20, "3a");
    expect(result.feasible).toBe(false);
    expect(result.reclassificationNeeded).toBe(true);
    expect(result.newZone).toBe(2);
    expect(result.nextAction).toBe("level-4");
  });

  it("reclassifies zone 3b to zone 2 when tmax < 0 (rule R4)", () => {
    const result = evaluateLevel3(-5, "3b");
    expect(result.feasible).toBe(false);
    expect(result.reclassificationNeeded).toBe(true);
    expect(result.newZone).toBe(2);
    expect(result.nextAction).toBe("level-4");
  });

  it("keeps zone 2 as zone 2 when tmax <= 0", () => {
    const result = evaluateLevel3(0, 2);
    expect(result.feasible).toBe(false);
    expect(result.reclassificationNeeded).toBe(false);
    expect(result.newZone).toBe(2);
    expect(result.nextAction).toBe("level-4");
  });

  it("handles tmax exactly 31 as feasible (boundary above 30)", () => {
    const result = evaluateLevel3(31, "3a");
    expect(result.feasible).toBe(true);
    expect(result.nextAction).toBe("level-4");
  });

  it("handles tmax exactly 30 as not feasible (boundary)", () => {
    const result = evaluateLevel3(30, "3b");
    expect(result.feasible).toBe(false);
    expect(result.reclassificationNeeded).toBe(true);
    expect(result.newZone).toBe(2);
  });
});
