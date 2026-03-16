import { describe, it, expect } from "vitest";
import { determineCognitiveLoad, validateAlertTool } from "./alertValidator";

describe("determineCognitiveLoad", () => {
  it("returns C1 when selected", () => {
    expect(determineCognitiveLoad({ selectedLevel: "C1" })).toBe("C1");
  });

  it("returns C2 when selected", () => {
    expect(determineCognitiveLoad({ selectedLevel: "C2" })).toBe("C2");
  });

  it("returns C3 when selected", () => {
    expect(determineCognitiveLoad({ selectedLevel: "C3" })).toBe("C3");
  });
});

describe("validateAlertTool", () => {
  it("Zone 1: always incompatible", () => {
    const result = validateAlertTool({
      zone: 1,
      equipmentType: "pti",
      coverage: "bonne",
      cognitiveLoad: "C1",
    });
    expect(result.compatible).toBe(false);
    expect(result.status).toBe("incompatible");
    expect(result.measures.length).toBeGreaterThan(0);
  });

  it("Zone 4: always compatible", () => {
    const result = validateAlertTool({
      zone: 4,
      equipmentType: "alerte_manuelle",
      coverage: "faible",
      cognitiveLoad: "C3",
    });
    expect(result.compatible).toBe(true);
    expect(result.status).toBe("compatible");
    expect(result.measures).toHaveLength(0);
  });

  it("Zone 2 + good coverage + C1: compatible", () => {
    const result = validateAlertTool({
      zone: 2,
      equipmentType: "pti",
      coverage: "bonne",
      cognitiveLoad: "C1",
    });
    expect(result.compatible).toBe(true);
    expect(result.status).toBe("compatible");
  });

  it("Zone 2 + low coverage + C3: incompatible", () => {
    const result = validateAlertTool({
      zone: 2,
      equipmentType: "gsm_smartphone",
      coverage: "faible",
      cognitiveLoad: "C3",
    });
    expect(result.compatible).toBe(false);
    expect(result.status).toBe("incompatible");
    expect(result.measures.length).toBeGreaterThan(0);
  });

  it("Zone 2 + no coverage: incompatible regardless of cognitive load", () => {
    const result = validateAlertTool({
      zone: 2,
      equipmentType: "pti",
      coverage: "aucune",
      cognitiveLoad: "C1",
    });
    expect(result.compatible).toBe(false);
    expect(result.status).toBe("incompatible");
  });

  it("Zone 2 + good coverage + C2: with_reserves", () => {
    const result = validateAlertTool({
      zone: 2,
      equipmentType: "pti",
      coverage: "bonne",
      cognitiveLoad: "C2",
    });
    expect(result.compatible).toBe(true);
    expect(result.status).toBe("with_reserves");
    expect(result.measures.length).toBeGreaterThan(0);
  });

  it("Zone 2 + good coverage + C3: with_reserves with automatic device recommendation", () => {
    const result = validateAlertTool({
      zone: 2,
      equipmentType: "pti",
      coverage: "bonne",
      cognitiveLoad: "C3",
    });
    expect(result.compatible).toBe(true);
    expect(result.status).toBe("with_reserves");
    expect(result.measures.length).toBeGreaterThanOrEqual(2);
  });

  it("Zone 2 + medium coverage + C3: incompatible", () => {
    const result = validateAlertTool({
      zone: 2,
      equipmentType: "gsm_smartphone",
      coverage: "moyenne",
      cognitiveLoad: "C3",
    });
    expect(result.compatible).toBe(false);
    expect(result.status).toBe("incompatible");
  });

  it("Zone 3a + good coverage + C1: compatible", () => {
    const result = validateAlertTool({
      zone: "3a",
      equipmentType: "pti",
      coverage: "bonne",
      cognitiveLoad: "C1",
    });
    expect(result.compatible).toBe(true);
    expect(result.status).toBe("compatible");
  });

  it("Zone 3b + medium coverage + C2: compatible", () => {
    const result = validateAlertTool({
      zone: "3b",
      equipmentType: "radio",
      coverage: "moyenne",
      cognitiveLoad: "C2",
    });
    expect(result.compatible).toBe(true);
    expect(result.status).toBe("compatible");
  });

  it("Zone 3a + any coverage + C3: with_reserves", () => {
    const result = validateAlertTool({
      zone: "3a",
      equipmentType: "homme_mort",
      coverage: "bonne",
      cognitiveLoad: "C3",
    });
    expect(result.compatible).toBe(true);
    expect(result.status).toBe("with_reserves");
    expect(result.measures.length).toBeGreaterThan(0);
  });

  it("Zone 3b + low coverage + C1: with_reserves", () => {
    const result = validateAlertTool({
      zone: "3b",
      equipmentType: "gsm_smartphone",
      coverage: "faible",
      cognitiveLoad: "C1",
    });
    expect(result.compatible).toBe(true);
    expect(result.status).toBe("with_reserves");
  });

  it("Zone 2 + manual alert + good coverage + C2: suggests automatic device", () => {
    const result = validateAlertTool({
      zone: 2,
      equipmentType: "alerte_manuelle",
      coverage: "bonne",
      cognitiveLoad: "C2",
    });
    expect(result.status).toBe("with_reserves");
    const hasAutoRecommendation = result.measures.some((m) =>
      m.includes("détection automatique"),
    );
    expect(hasAutoRecommendation).toBe(true);
  });

  it("Zone 2 + medium coverage + C1: with_reserves", () => {
    const result = validateAlertTool({
      zone: 2,
      equipmentType: "pti",
      coverage: "moyenne",
      cognitiveLoad: "C1",
    });
    expect(result.compatible).toBe(true);
    expect(result.status).toBe("with_reserves");
  });
});
