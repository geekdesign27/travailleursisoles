import { describe, it, expect } from "vitest";
import type { Analysis } from "@/types/analysis.schema";
import { buildCsvContent } from "./csvExporter";

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

describe("buildCsvContent", () => {
  it("includes CSV header row", () => {
    const csv = buildCsvContent(makeAnalysis());
    const firstLine = csv.split("\n")[0];
    expect(firstLine).toBe("Champ,Valeur");
  });

  it("includes identification data", () => {
    const csv = buildCsvContent(makeAnalysis());
    expect(csv).toContain("Acme SA");
    expect(csv).toContain("Maintenance chaudière");
    expect(csv).toContain("Jean Dupont");
    expect(csv).toContain("Production");
  });

  it("includes SUVA reference", () => {
    const csv = buildCsvContent(makeAnalysis());
    expect(csv).toContain("SUVA 44094.F");
  });

  it("includes level 1 data when present", () => {
    const csv = buildCsvContent(
      makeAnalysis({
        level1Result: {
          blocked: true,
          checkedCategories: ["1"],
          isMinor: false,
        },
      }),
    );
    expect(csv).toContain("NIVEAU 1");
    expect(csv).toContain("Oui"); // blocked
  });

  it("includes level 2 data when present", () => {
    const csv = buildCsvContent(
      makeAnalysis({
        level2Result: {
          gravity: "III",
          probability: "C",
          zone: "3b",
          aptitudes: { psychique: true, physique: true, intellectuelle: true },
          dangerDescription: "a".repeat(150),
          dangerCategory: "chimique",
        },
      }),
    );
    expect(csv).toContain("NIVEAU 2");
    expect(csv).toContain("III — Grave");
    expect(csv).toContain("C — Occasionnel");
    expect(csv).toContain("3b");
  });

  it("includes level 3 operational conditions", () => {
    const csv = buildCsvContent(
      makeAnalysis({
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
      }),
    );
    expect(csv).toContain("NIVEAU 3");
    expect(csv).toContain("30 min");
    expect(csv).toContain("bonne");
    expect(csv).toContain("PTI");
  });

  it("includes level 4 cognitive and alert data", () => {
    const csv = buildCsvContent(
      makeAnalysis({
        level2Result: {
          gravity: "II",
          probability: "B",
          zone: 4,
          aptitudes: { psychique: true, physique: true, intellectuelle: true },
          dangerDescription: "a".repeat(150),
          dangerCategory: "autre",
        },
        level4Result: {
          cognitiveLoad: "C1",
          equipmentType: "PTI",
          validationResult: {
            compatible: true,
            status: "compatible",
            measures: [],
            reason: "Zone 4 — OK",
          },
          correctiveMeasures: "",
        },
      }),
    );
    expect(csv).toContain("NIVEAU 4");
    expect(csv).toContain("C1 — Faible");
    expect(csv).toContain("compatible");
  });

  it("includes documentation when present", () => {
    const csv = buildCsvContent(
      makeAnalysis({
        documentation: {
          emergencyConcept: {
            alerte: "Appeler le 144",
            premierSecours: "Trousse de secours sur place",
            formation: "Formation annuelle",
            accesSecours: "Portail principal",
          },
          trainingDoc: {
            dateFormation: "2025-03-15",
            formateur: "M. Martin",
            documentation: "Manuel sécurité v2",
            dateRevision: "2026-03-15",
          },
        },
      }),
    );
    expect(csv).toContain("DOCUMENTATION");
    expect(csv).toContain("Appeler le 144");
    expect(csv).toContain("M. Martin");
  });

  it("escapes fields with commas", () => {
    const csv = buildCsvContent(
      makeAnalysis({
        description: "Travail en hauteur, espaces confinés",
      }),
    );
    expect(csv).toContain('"Travail en hauteur, espaces confinés"');
  });

  it("escapes fields with quotes", () => {
    const csv = buildCsvContent(
      makeAnalysis({
        description: 'Utilisation "PTI" standard',
      }),
    );
    expect(csv).toContain('"Utilisation ""PTI"" standard"');
  });
});
