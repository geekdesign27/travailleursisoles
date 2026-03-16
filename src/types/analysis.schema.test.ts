import { describe, it, expect } from "vitest";
import {
  AnalysisIdentificationSchema,
  AnalysisSchema,
} from "./analysis.schema";

describe("AnalysisIdentificationSchema", () => {
  const validData = {
    entreprise: "ACME SA",
    responsable: "Marc Dupont",
    titre_activite: "Contrôle cuves stockage",
    nombre_personnes: 1,
    periode_travail: "jour" as const,
    frequence_activite: "quotidienne" as const,
  };

  it("accepts valid minimal data", () => {
    const result = AnalysisIdentificationSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.departement).toBe("");
      expect(result.data.description).toBe("");
    }
  });

  it("accepts valid complete data", () => {
    const result = AnalysisIdentificationSchema.safeParse({
      ...validData,
      departement: "Production",
      description: "Contrôle visuel des cuves en zone isolée",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty entreprise", () => {
    const result = AnalysisIdentificationSchema.safeParse({
      ...validData,
      entreprise: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short titre_activite", () => {
    const result = AnalysisIdentificationSchema.safeParse({
      ...validData,
      titre_activite: "AB",
    });
    expect(result.success).toBe(false);
  });

  it("rejects titre_activite exceeding 150 chars", () => {
    const result = AnalysisIdentificationSchema.safeParse({
      ...validData,
      titre_activite: "A".repeat(151),
    });
    expect(result.success).toBe(false);
  });

  it("rejects nombre_personnes < 1", () => {
    const result = AnalysisIdentificationSchema.safeParse({
      ...validData,
      nombre_personnes: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid periode_travail", () => {
    const result = AnalysisIdentificationSchema.safeParse({
      ...validData,
      periode_travail: "matin",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid frequence_activite", () => {
    const result = AnalysisIdentificationSchema.safeParse({
      ...validData,
      frequence_activite: "annuelle",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid periodes", () => {
    for (const p of ["jour", "nuit", "weekend", "jour_ferie", "piquet"]) {
      const result = AnalysisIdentificationSchema.safeParse({
        ...validData,
        periode_travail: p,
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts all valid frequences", () => {
    for (const f of [
      "quotidienne",
      "hebdomadaire",
      "mensuelle",
      "occasionnelle",
      "exceptionnelle",
    ]) {
      const result = AnalysisIdentificationSchema.safeParse({
        ...validData,
        frequence_activite: f,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("AnalysisSchema", () => {
  const validAnalysis = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    entreprise: "ACME SA",
    responsable: "Marc Dupont",
    titre_activite: "Contrôle cuves stockage",
    nombre_personnes: 1,
    periode_travail: "jour" as const,
    frequence_activite: "quotidienne" as const,
    status: "draft" as const,
    currentStep: 1,
    currentLevel: 0,
    createdAt: "2026-03-16T10:00:00.000Z",
    updatedAt: "2026-03-16T10:00:00.000Z",
  };

  it("accepts valid analysis", () => {
    const result = AnalysisSchema.safeParse(validAnalysis);
    expect(result.success).toBe(true);
  });

  it("rejects invalid UUID", () => {
    const result = AnalysisSchema.safeParse({
      ...validAnalysis,
      id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = AnalysisSchema.safeParse({
      ...validAnalysis,
      status: "unknown",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid datetime format", () => {
    const result = AnalysisSchema.safeParse({
      ...validAnalysis,
      createdAt: "2026-03-16",
    });
    expect(result.success).toBe(false);
  });
});
