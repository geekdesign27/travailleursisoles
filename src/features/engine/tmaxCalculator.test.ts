import { describe, it, expect } from "vitest";
import { calculateTmax, evaluateLevel3 } from "./tmaxCalculator";
import type { ZoneRisque } from "@/constants/suvaMatrix";

describe("calculateTmax", () => {
  it("returns positive tmax when rescue is feasible", () => {
    const result = calculateTmax({
      delaiTypeBlessure: 60,
      tempsSecouristes: 10,
      tempsAmbulance: 15,
      tempsSauvetage: 20,
    });
    expect(result.tmax).toBe(15);
    expect(result.feasible).toBe(true);
  });

  it("returns zero tmax (not feasible)", () => {
    const result = calculateTmax({
      delaiTypeBlessure: 45,
      tempsSecouristes: 15,
      tempsAmbulance: 15,
      tempsSauvetage: 15,
    });
    expect(result.tmax).toBe(0);
    expect(result.feasible).toBe(false);
  });

  it("returns negative tmax (not feasible)", () => {
    const result = calculateTmax({
      delaiTypeBlessure: 30,
      tempsSecouristes: 15,
      tempsAmbulance: 15,
      tempsSauvetage: 15,
    });
    expect(result.tmax).toBe(-15);
    expect(result.feasible).toBe(false);
  });

  it("handles all zeros", () => {
    const result = calculateTmax({
      delaiTypeBlessure: 0,
      tempsSecouristes: 0,
      tempsAmbulance: 0,
      tempsSauvetage: 0,
    });
    expect(result.tmax).toBe(0);
    expect(result.feasible).toBe(false);
  });

  it("handles large values", () => {
    const result = calculateTmax({
      delaiTypeBlessure: 1000,
      tempsSecouristes: 100,
      tempsAmbulance: 200,
      tempsSauvetage: 300,
    });
    expect(result.tmax).toBe(400);
    expect(result.feasible).toBe(true);
  });

  it("always sets reclassificationNeeded to false (pure calculation)", () => {
    const result = calculateTmax({
      delaiTypeBlessure: 10,
      tempsSecouristes: 20,
      tempsAmbulance: 30,
      tempsSauvetage: 40,
    });
    expect(result.reclassificationNeeded).toBe(false);
  });
});

describe("evaluateLevel3", () => {
  it("returns feasible and level-4 when tmax > 0", () => {
    const result = evaluateLevel3(15, "3a");
    expect(result.feasible).toBe(true);
    expect(result.reclassificationNeeded).toBe(false);
    expect(result.nextAction).toBe("level-4");
    expect(result.newZone).toBeUndefined();
  });

  it("returns feasible for tmax > 0 regardless of zone", () => {
    const zones: ZoneRisque[] = [2, "3a", "3b"];
    for (const zone of zones) {
      const result = evaluateLevel3(10, zone);
      expect(result.feasible).toBe(true);
      expect(result.nextAction).toBe("level-4");
    }
  });

  it("reclassifies zone 3a to zone 2 when tmax <= 0 (rule R4)", () => {
    const result = evaluateLevel3(0, "3a");
    expect(result.feasible).toBe(false);
    expect(result.reclassificationNeeded).toBe(true);
    expect(result.newZone).toBe(2);
    expect(result.nextAction).toBe("report");
  });

  it("reclassifies zone 3b to zone 2 when tmax <= 0 (rule R4)", () => {
    const result = evaluateLevel3(-5, "3b");
    expect(result.feasible).toBe(false);
    expect(result.reclassificationNeeded).toBe(true);
    expect(result.newZone).toBe(2);
    expect(result.nextAction).toBe("report");
  });

  it("keeps zone 2 as zone 2 when tmax <= 0", () => {
    const result = evaluateLevel3(0, 2);
    expect(result.feasible).toBe(false);
    expect(result.reclassificationNeeded).toBe(false);
    expect(result.newZone).toBe(2);
    expect(result.nextAction).toBe("report");
  });

  it("returns not feasible for negative tmax with zone 3a", () => {
    const result = evaluateLevel3(-20, "3a");
    expect(result.feasible).toBe(false);
    expect(result.reclassificationNeeded).toBe(true);
    expect(result.newZone).toBe(2);
  });

  it("handles tmax exactly zero as not feasible", () => {
    const result = evaluateLevel3(0, "3b");
    expect(result.feasible).toBe(false);
  });

  it("handles tmax of 1 as feasible (boundary)", () => {
    const result = evaluateLevel3(1, "3a");
    expect(result.feasible).toBe(true);
    expect(result.nextAction).toBe("level-4");
  });
});
