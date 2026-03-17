import { describe, it, expect } from "vitest";
import type { Analysis } from "@/types/analysis.schema";
import {
  analysisToSheetRow,
  sheetRowToAnalysis,
  getHeaderRow,
  COLUMN_MAPPING,
} from "./sheetsMapper";

const makeAnalysis = (overrides: Partial<Analysis> = {}): Analysis => ({
  id: "550e8400-e29b-41d4-a716-446655440000",
  entreprise: "ACME SA",
  departement: "Production",
  responsable: "Jean Dupont",
  titre_activite: "Maintenance nocturne des pompes",
  description: "Travail isolé en sous-sol",
  nombre_personnes: 1,
  periode_travail: "nuit",
  frequence_activite: "hebdomadaire",
  status: "in_progress",
  currentStep: 3,
  currentLevel: 2,
  createdAt: "2025-01-15T10:00:00.000Z",
  updatedAt: "2025-01-15T12:30:00.000Z",
  ...overrides,
});

describe("sheetsMapper", () => {
  describe("getHeaderRow", () => {
    it("returns all column names", () => {
      const headers = getHeaderRow();
      expect(headers).toHaveLength(COLUMN_MAPPING.length);
      expect(headers[0]).toBe("id");
      expect(headers[headers.length - 1]).toBe("updated_at");
    });
  });

  describe("analysisToSheetRow", () => {
    it("converts a minimal analysis to a sheet row", () => {
      const analysis = makeAnalysis();
      const row = analysisToSheetRow(analysis);

      expect(row[0]).toBe(analysis.id);
      expect(row[1]).toBe("ACME SA");
      expect(row[2]).toBe("Production");
      expect(row[6]).toBe("1"); // nombre_personnes
      expect(row[7]).toBe("nuit");
      expect(row[9]).toBe("in_progress");
    });

    it("handles level1Result", () => {
      const analysis = makeAnalysis({
        level1Result: {
          blocked: false,
          checkedCategories: ["mecanique", "electrique"],
          isMinor: false,
        },
      });

      const row = analysisToSheetRow(analysis);
      expect(row[12]).toBe("FALSE");
      expect(row[13]).toBe("mecanique, electrique");
      expect(row[14]).toBe("FALSE");
    });

    it("handles missing optional fields as empty strings", () => {
      const analysis = makeAnalysis();
      const row = analysisToSheetRow(analysis);

      // level1 fields should be empty
      expect(row[12]).toBe("");
      expect(row[13]).toBe("");
    });

    it("converts booleans to TRUE/FALSE strings", () => {
      const analysis = makeAnalysis({
        level1Result: {
          blocked: true,
          checkedCategories: [],
          isMinor: true,
        },
      });

      const row = analysisToSheetRow(analysis);
      expect(row[12]).toBe("TRUE");
      expect(row[14]).toBe("TRUE");
    });
  });

  describe("sheetRowToAnalysis", () => {
    it("round-trips a minimal analysis", () => {
      const original = makeAnalysis();
      const row = analysisToSheetRow(original);
      const result = sheetRowToAnalysis(row);

      expect(result.id).toBe(original.id);
      expect(result.entreprise).toBe(original.entreprise);
      expect(result.nombre_personnes).toBe(original.nombre_personnes);
      expect(result.periode_travail).toBe(original.periode_travail);
      expect(result.status).toBe(original.status);
    });

    it("round-trips an analysis with level1Result", () => {
      const original = makeAnalysis({
        level1Result: {
          blocked: false,
          checkedCategories: ["chute", "noyade"],
          isMinor: true,
        },
      });

      const row = analysisToSheetRow(original);
      const result = sheetRowToAnalysis(row);

      expect(result.level1Result).toBeDefined();
      expect(result.level1Result!.blocked).toBe(false);
      expect(result.level1Result!.checkedCategories).toEqual([
        "chute",
        "noyade",
      ]);
      expect(result.level1Result!.isMinor).toBe(true);
    });

    it("round-trips an analysis with level2Result", () => {
      const original = makeAnalysis({
        level2Result: {
          gravity: "III",
          probability: "C",
          zone: "3a",
          aptitudes: {
            psychique: true,
            physique: true,
            intellectuelle: false,
          },
          dangerDescription:
            "Description de danger suffisamment longue pour atteindre le minimum de 150 caractères requis par le schéma de validation. On ajoute du texte supplémentaire pour être sûr.",
          dangerCategory: "chute",
        },
      });

      const row = analysisToSheetRow(original);
      const result = sheetRowToAnalysis(row);

      expect(result.level2Result).toBeDefined();
      expect(result.level2Result!.gravity).toBe("III");
      expect(result.level2Result!.zone).toBe("3a");
      expect(result.level2Result!.aptitudes.psychique).toBe(true);
      expect(result.level2Result!.aptitudes.intellectuelle).toBe(false);
    });

    it("handles empty/short rows gracefully", () => {
      const row = ["some-id", "Entreprise"];
      const result = sheetRowToAnalysis(row);

      expect(result.id).toBe("some-id");
      expect(result.entreprise).toBe("Entreprise");
      expect(result.nombre_personnes).toBe(0);
      expect(result.level1Result).toBeUndefined();
    });
  });
});
