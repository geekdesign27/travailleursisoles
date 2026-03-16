import { describe, it, expect, beforeEach } from "vitest";
import {
  saveAnalysis,
  loadAnalysis,
  listAnalyses,
  deleteAnalysis,
} from "./localStorageService";
import type { Analysis } from "@/types/analysis.schema";

function makeAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    id: crypto.randomUUID(),
    entreprise: "Test SA",
    departement: "",
    responsable: "Test User",
    titre_activite: "Test activity",
    description: "",
    nombre_personnes: 1,
    periode_travail: "jour",
    frequence_activite: "quotidienne",
    status: "draft",
    currentStep: 1,
    currentLevel: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("localStorageService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads an analysis", () => {
    const analysis = makeAnalysis();
    saveAnalysis(analysis);

    const loaded = loadAnalysis(analysis.id);
    expect(loaded).toEqual(analysis);
  });

  it("returns null for non-existent analysis", () => {
    expect(loadAnalysis("nonexistent-id")).toBeNull();
  });

  it("generates unique UUIDs", () => {
    const a1 = makeAnalysis();
    const a2 = makeAnalysis();
    expect(a1.id).not.toBe(a2.id);
  });

  it("lists analyses in index", () => {
    const a1 = makeAnalysis({ titre_activite: "Analysis 1" });
    const a2 = makeAnalysis({ titre_activite: "Analysis 2" });

    saveAnalysis(a1);
    saveAnalysis(a2);

    const list = listAnalyses();
    expect(list).toHaveLength(2);
    expect(list.map((e) => e.titre_activite)).toContain("Analysis 1");
    expect(list.map((e) => e.titre_activite)).toContain("Analysis 2");
  });

  it("updates existing analysis in index", () => {
    const analysis = makeAnalysis();
    saveAnalysis(analysis);

    const updated = {
      ...analysis,
      status: "in_progress" as const,
      updatedAt: new Date().toISOString(),
    };
    saveAnalysis(updated);

    const list = listAnalyses();
    expect(list).toHaveLength(1);
    expect(list[0].status).toBe("in_progress");
  });

  it("deletes an analysis", () => {
    const analysis = makeAnalysis();
    saveAnalysis(analysis);
    expect(loadAnalysis(analysis.id)).not.toBeNull();

    deleteAnalysis(analysis.id);
    expect(loadAnalysis(analysis.id)).toBeNull();
    expect(listAnalyses()).toHaveLength(0);
  });

  it("returns empty list when no analyses exist", () => {
    expect(listAnalyses()).toHaveLength(0);
  });
});
