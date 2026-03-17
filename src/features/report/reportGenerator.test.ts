import { describe, it, expect } from "vitest";
import type { Analysis } from "@/types/analysis.schema";
import {
  getManagementDecision,
  generateManagementActions,
  generateTechnicalSummary,
  formatPeriode,
  getEffectiveZone,
} from "./reportGenerator";

// Minimal valid analysis for testing
function makeAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    entreprise: "Acme SA",
    departement: "Production",
    responsable: "Jean Dupont",
    titre_activite: "Maintenance chaudière",
    description: "Entretien périodique",
    nombre_personnes: 1,
    periode_travail: "jour",
    frequence_activite: "hebdomadaire",
    status: "completed",
    currentStep: 7,
    currentLevel: 4,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-06-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("getManagementDecision", () => {
  it("returns 'interdit' for zone 1", () => {
    const analysis = makeAnalysis({
      level2Result: {
        gravity: "V",
        probability: "E",
        zone: 1,
        aptitudes: { psychique: true, physique: true, intellectuelle: true },
        dangerDescription: "a".repeat(150),
        dangerCategory: "mecanique",
      },
    });
    expect(getManagementDecision(analysis)).toBe("Travail isolé interdit");
  });

  it("returns 'autorisé sous conditions' for zone 2", () => {
    const analysis = makeAnalysis({
      level2Result: {
        gravity: "IV",
        probability: "D",
        zone: 2,
        aptitudes: { psychique: true, physique: true, intellectuelle: true },
        dangerDescription: "a".repeat(150),
        dangerCategory: "chute",
      },
    });
    expect(getManagementDecision(analysis)).toBe(
      "Travail isolé autorisé sous conditions",
    );
  });

  it("returns 'autorisé sous conditions' for zone 3a", () => {
    const analysis = makeAnalysis({
      level2Result: {
        gravity: "III",
        probability: "D",
        zone: "3a",
        aptitudes: { psychique: true, physique: true, intellectuelle: true },
        dangerDescription: "a".repeat(150),
        dangerCategory: "chimique",
      },
    });
    expect(getManagementDecision(analysis)).toBe(
      "Travail isolé autorisé sous conditions",
    );
  });

  it("returns 'autorisé' for zone 4", () => {
    const analysis = makeAnalysis({
      level2Result: {
        gravity: "I",
        probability: "A",
        zone: 4,
        aptitudes: { psychique: true, physique: true, intellectuelle: true },
        dangerDescription: "a".repeat(150),
        dangerCategory: "autre",
      },
    });
    expect(getManagementDecision(analysis)).toBe("Travail isolé autorisé");
  });

  it("returns incomplete when no level2Result", () => {
    const analysis = makeAnalysis();
    expect(getManagementDecision(analysis)).toContain("incomplète");
  });

  it("uses reclassified zone when tmax triggers reclassification", () => {
    const analysis = makeAnalysis({
      level2Result: {
        gravity: "III",
        probability: "D",
        zone: "3a",
        aptitudes: { psychique: true, physique: true, intellectuelle: true },
        dangerDescription: "a".repeat(150),
        dangerCategory: "mecanique",
      },
      level3Result: {
        operationalConditions: {
          couvertureReseau: "bonne",
          equipementDATI: "",
          centraleAlarme: false,
          delaiSecouristesJour: 10,
          delaiSecouristesNuit: 20,
          delaiSecoursPublics: 15,
          delaiTypeBlessure: 5,
          tempsSauvetage: 10,
        },
        tmaxResult: {
          tmax: -20,
          feasible: false,
          reclassificationNeeded: true,
          newZone: 2,
        },
      },
    });
    // Zone reclassified from 3a to 2
    expect(getManagementDecision(analysis)).toBe(
      "Travail isolé autorisé sous conditions",
    );
  });
});

describe("generateManagementActions", () => {
  it("generates zone 1 exigences", () => {
    const analysis = makeAnalysis({
      level2Result: {
        gravity: "V",
        probability: "E",
        zone: 1,
        aptitudes: { psychique: true, physique: true, intellectuelle: true },
        dangerDescription: "a".repeat(150),
        dangerCategory: "mecanique",
      },
    });
    const actions = generateManagementActions(analysis);
    expect(actions.length).toBeGreaterThan(0);
    expect(actions.every((a) => a.type === "exigence")).toBe(true);
    expect(actions[0].text).toContain("deuxième personne");
  });

  it("generates recommandation for night work", () => {
    const analysis = makeAnalysis({
      periode_travail: "nuit",
      level2Result: {
        gravity: "I",
        probability: "A",
        zone: 4,
        aptitudes: { psychique: true, physique: true, intellectuelle: true },
        dangerDescription: "a".repeat(150),
        dangerCategory: "autre",
      },
    });
    const actions = generateManagementActions(analysis);
    const nightAction = actions.find((a) => a.text.includes("Nuit"));
    expect(nightAction).toBeDefined();
    expect(nightAction!.type).toBe("recommandation");
  });

  it("includes reclassification exigence when tmax fails", () => {
    const analysis = makeAnalysis({
      level2Result: {
        gravity: "III",
        probability: "D",
        zone: "3a",
        aptitudes: { psychique: true, physique: true, intellectuelle: true },
        dangerDescription: "a".repeat(150),
        dangerCategory: "mecanique",
      },
      level3Result: {
        operationalConditions: {
          couvertureReseau: "bonne",
          equipementDATI: "",
          centraleAlarme: false,
          delaiSecouristesJour: 10,
          delaiSecouristesNuit: 20,
          delaiSecoursPublics: 15,
          delaiTypeBlessure: 5,
          tempsSauvetage: 10,
        },
        tmaxResult: {
          tmax: -20,
          feasible: false,
          reclassificationNeeded: true,
          newZone: 2,
        },
      },
    });
    const actions = generateManagementActions(analysis);
    const reclass = actions.find((a) => a.text.includes("reclassée"));
    expect(reclass).toBeDefined();
    expect(reclass!.type).toBe("exigence");
  });

  it("includes minor worker exigence", () => {
    const analysis = makeAnalysis({
      level1Result: {
        blocked: true,
        checkedCategories: [],
        isMinor: true,
      },
      level2Result: {
        gravity: "V",
        probability: "E",
        zone: 1,
        aptitudes: { psychique: true, physique: true, intellectuelle: true },
        dangerDescription: "a".repeat(150),
        dangerCategory: "mecanique",
      },
    });
    const actions = generateManagementActions(analysis);
    const minorAction = actions.find((a) => a.text.includes("mineur"));
    expect(minorAction).toBeDefined();
    expect(minorAction!.type).toBe("exigence");
  });

  it("numbers actions sequentially", () => {
    const analysis = makeAnalysis({
      level2Result: {
        gravity: "V",
        probability: "E",
        zone: 1,
        aptitudes: { psychique: false, physique: true, intellectuelle: true },
        dangerDescription: "a".repeat(150),
        dangerCategory: "mecanique",
      },
    });
    const actions = generateManagementActions(analysis);
    actions.forEach((action, idx) => {
      expect(action.number).toBe(idx + 1);
    });
  });
});

describe("generateTechnicalSummary", () => {
  it("returns null values when levels are missing", () => {
    const analysis = makeAnalysis();
    const summary = generateTechnicalSummary(analysis);
    expect(summary.gravity).toBeNull();
    expect(summary.probability).toBeNull();
    expect(summary.zone).toBeNull();
    expect(summary.tmax).toBeNull();
    expect(summary.cognitiveLoad).toBeNull();
    expect(summary.alertValidation).toBeNull();
  });

  it("populates gravity and probability from level2Result", () => {
    const analysis = makeAnalysis({
      level2Result: {
        gravity: "III",
        probability: "C",
        zone: "3b",
        aptitudes: { psychique: true, physique: true, intellectuelle: true },
        dangerDescription: "a".repeat(150),
        dangerCategory: "chimique",
      },
    });
    const summary = generateTechnicalSummary(analysis);
    expect(summary.gravity).not.toBeNull();
    expect(summary.gravity!.level).toBe("III");
    expect(summary.gravity!.label).toBe("Grave");
    expect(summary.probability).not.toBeNull();
    expect(summary.probability!.level).toBe("C");
    expect(summary.zone).not.toBeNull();
    expect(summary.zone!.zone).toBe("3b");
  });

  it("includes tmax data from level3Result", () => {
    const analysis = makeAnalysis({
      level2Result: {
        gravity: "III",
        probability: "C",
        zone: "3b",
        aptitudes: { psychique: true, physique: true, intellectuelle: true },
        dangerDescription: "a".repeat(150),
        dangerCategory: "chimique",
      },
      level3Result: {
        operationalConditions: {
          couvertureReseau: "bonne",
          equipementDATI: "PTI",
          centraleAlarme: true,
          delaiSecouristesJour: 5,
          delaiSecouristesNuit: 10,
          delaiSecoursPublics: 12,
          delaiTypeBlessure: 60,
          tempsSauvetage: 15,
        },
        tmaxResult: {
          tmax: 30,
          feasible: true,
          reclassificationNeeded: false,
        },
      },
    });
    const summary = generateTechnicalSummary(analysis);
    expect(summary.tmax).not.toBeNull();
    expect(summary.tmax!.value).toBe(30);
    expect(summary.tmax!.feasible).toBe(true);
    expect(summary.operationalConditions).not.toBeNull();
    expect(summary.operationalConditions!.couvertureReseau).toBe("bonne");
  });

  it("always includes R6 and R7 in applied rules", () => {
    const analysis = makeAnalysis();
    const summary = generateTechnicalSummary(analysis);
    const codes = summary.appliedRules.map((r) => r.code);
    expect(codes).toContain("R6");
    expect(codes).toContain("R7");
  });

  it("includes R1 when level1 is blocked", () => {
    const analysis = makeAnalysis({
      level1Result: {
        blocked: true,
        checkedCategories: ["1"],
        isMinor: false,
      },
      level2Result: {
        gravity: "V",
        probability: "E",
        zone: 1,
        aptitudes: { psychique: true, physique: true, intellectuelle: true },
        dangerDescription: "a".repeat(150),
        dangerCategory: "mecanique",
      },
    });
    const summary = generateTechnicalSummary(analysis);
    const codes = summary.appliedRules.map((r) => r.code);
    expect(codes).toContain("R1");
    expect(codes).toContain("R3"); // Zone 1 => R3
  });

  it("includes R5 when delay > 15 min in zone 2", () => {
    const analysis = makeAnalysis({
      level2Result: {
        gravity: "IV",
        probability: "D",
        zone: 2,
        aptitudes: { psychique: true, physique: true, intellectuelle: true },
        dangerDescription: "a".repeat(150),
        dangerCategory: "chute",
      },
      level3Result: {
        operationalConditions: {
          couvertureReseau: "bonne",
          equipementDATI: "",
          centraleAlarme: false,
          delaiSecouristesJour: 20,
          delaiSecouristesNuit: 25,
          delaiSecoursPublics: 15,
          delaiTypeBlessure: 60,
          tempsSauvetage: 10,
        },
        tmaxResult: {
          tmax: 15,
          feasible: true,
          reclassificationNeeded: false,
        },
      },
    });
    const summary = generateTechnicalSummary(analysis);
    const codes = summary.appliedRules.map((r) => r.code);
    expect(codes).toContain("R5");
  });

  it("includes cognitive load from level4Result", () => {
    const analysis = makeAnalysis({
      level2Result: {
        gravity: "II",
        probability: "B",
        zone: 4,
        aptitudes: { psychique: true, physique: true, intellectuelle: true },
        dangerDescription: "a".repeat(150),
        dangerCategory: "autre",
      },
      level4Result: {
        cognitiveLoad: "C2",
        equipmentType: "PTI",
        validationResult: {
          compatible: true,
          status: "compatible",
          measures: [],
          reason: "Zone 4 — OK",
        },
        correctiveMeasures: "",
      },
    });
    const summary = generateTechnicalSummary(analysis);
    expect(summary.cognitiveLoad).not.toBeNull();
    expect(summary.cognitiveLoad!.level).toBe("C2");
    expect(summary.cognitiveLoad!.label).toBe("Moyenne");
  });
});

describe("getEffectiveZone", () => {
  it("returns level2Result zone when no reclassification", () => {
    const analysis = makeAnalysis({
      level2Result: {
        gravity: "I",
        probability: "A",
        zone: 4,
        aptitudes: { psychique: true, physique: true, intellectuelle: true },
        dangerDescription: "a".repeat(150),
        dangerCategory: "autre",
      },
    });
    expect(getEffectiveZone(analysis)).toBe(4);
  });

  it("returns reclassified zone when tmax triggers it", () => {
    const analysis = makeAnalysis({
      level2Result: {
        gravity: "III",
        probability: "D",
        zone: "3a",
        aptitudes: { psychique: true, physique: true, intellectuelle: true },
        dangerDescription: "a".repeat(150),
        dangerCategory: "mecanique",
      },
      level3Result: {
        operationalConditions: {
          couvertureReseau: "bonne",
          equipementDATI: "",
          centraleAlarme: false,
          delaiSecouristesJour: 10,
          delaiSecouristesNuit: 20,
          delaiSecoursPublics: 15,
          delaiTypeBlessure: 5,
          tempsSauvetage: 10,
        },
        tmaxResult: {
          tmax: -20,
          feasible: false,
          reclassificationNeeded: true,
          newZone: 2,
        },
      },
    });
    expect(getEffectiveZone(analysis)).toBe(2);
  });

  it("returns null when no level2Result", () => {
    const analysis = makeAnalysis();
    expect(getEffectiveZone(analysis)).toBeNull();
  });
});

describe("formatPeriode", () => {
  it("formats known periods", () => {
    expect(formatPeriode("jour")).toBe("Jour");
    expect(formatPeriode("nuit")).toBe("Nuit");
    expect(formatPeriode("weekend")).toBe("Week-end");
    expect(formatPeriode("jour_ferie")).toBe("Jour férié");
    expect(formatPeriode("piquet")).toBe("Service de piquet");
  });

  it("returns the input for unknown periods", () => {
    expect(formatPeriode("unknown")).toBe("unknown");
  });
});
