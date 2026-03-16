import { AnalysisSchema, type Analysis } from "@/types/analysis.schema";

const ANALYSIS_PREFIX = "app:analysis:";
const INDEX_KEY = "app:analyses:index";

export interface AnalysisIndexEntry {
  id: string;
  titre_activite: string;
  status: string;
  updatedAt: string;
}

const AnalysisIndexEntryArraySchema = AnalysisSchema.pick({
  id: true,
  titre_activite: true,
  status: true,
  updatedAt: true,
}).array();

export function saveAnalysis(analysis: Analysis): {
  ok: boolean;
  error?: string;
} {
  try {
    const key = `${ANALYSIS_PREFIX}${analysis.id}`;
    const indexBefore = localStorage.getItem(INDEX_KEY);
    localStorage.setItem(key, JSON.stringify(analysis));
    try {
      updateIndex(analysis);
    } catch (indexErr) {
      // Rollback data write to keep index and data in sync
      if (indexBefore !== null) {
        localStorage.setItem(INDEX_KEY, indexBefore);
      } else {
        localStorage.removeItem(INDEX_KEY);
      }
      throw indexErr;
    }
    return { ok: true };
  } catch (err) {
    const message =
      err instanceof DOMException && err.name === "QuotaExceededError"
        ? "Espace de stockage insuffisant. Supprimez des analyses inutilisées."
        : "Erreur de sauvegarde.";
    return { ok: false, error: message };
  }
}

export function loadAnalysis(id: string): Analysis | null {
  const key = `${ANALYSIS_PREFIX}${id}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const result = AnalysisSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function listAnalyses(): AnalysisIndexEntry[] {
  const raw = localStorage.getItem(INDEX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    const result = AnalysisIndexEntryArraySchema.safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function deleteAnalysis(id: string): void {
  const key = `${ANALYSIS_PREFIX}${id}`;
  // Update index first, then remove data — safer order
  const index = listAnalyses().filter((entry) => entry.id !== id);
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  localStorage.removeItem(key);
}

function updateIndex(analysis: Analysis): void {
  const index = listAnalyses();
  const entry: AnalysisIndexEntry = {
    id: analysis.id,
    titre_activite: analysis.titre_activite,
    status: analysis.status,
    updatedAt: analysis.updatedAt,
  };

  const existingIdx = index.findIndex((e) => e.id === analysis.id);
  if (existingIdx >= 0) {
    index[existingIdx] = entry;
  } else {
    index.push(entry);
  }

  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}
