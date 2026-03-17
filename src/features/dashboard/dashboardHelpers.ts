import type { Analysis, AnalysisStatusType } from "@/types/analysis.schema";
import type { ZoneRisque } from "@/constants/suvaMatrix";

// --- Zone extraction ---

/**
 * Extract the effective zone from an analysis.
 * Checks level3 reclassification first, then falls back to level2 zone.
 */
export function getEffectiveZone(analysis: Analysis): ZoneRisque | null {
  if (analysis.level3Result?.tmaxResult?.newZone != null) {
    return analysis.level3Result.tmaxResult.newZone;
  }
  if (analysis.level2Result?.zone != null) {
    return analysis.level2Result.zone;
  }
  return null;
}

// --- Status labels ---

const STATUS_CONFIG: Record<
  AnalysisStatusType,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  draft: { label: "Brouillon", variant: "outline" },
  in_progress: { label: "En cours", variant: "default" },
  completed: { label: "Terminée", variant: "secondary" },
  archived: { label: "Archivée", variant: "secondary" },
};

export function getStatusLabel(status: string): string {
  return STATUS_CONFIG[status as AnalysisStatusType]?.label ?? status;
}

export function getStatusVariant(
  status: string,
): "default" | "secondary" | "outline" {
  return STATUS_CONFIG[status as AnalysisStatusType]?.variant ?? "outline";
}

// --- Période labels ---

const PERIODE_LABELS: Record<string, string> = {
  jour: "Jour",
  nuit: "Nuit",
  weekend: "Week-end",
  jour_ferie: "Jour férié",
  piquet: "Piquet",
};

export function getPeriodeLabel(periode: string): string {
  return PERIODE_LABELS[periode] ?? periode;
}

// --- Filtering ---

export interface DashboardFilters {
  entreprise: string;
  departement: string;
  zones: string[];
  statuts: string[];
}

export const EMPTY_FILTERS: DashboardFilters = {
  entreprise: "",
  departement: "",
  zones: [],
  statuts: [],
};

export function hasActiveFilters(filters: DashboardFilters): boolean {
  return (
    filters.entreprise.trim() !== "" ||
    filters.departement !== "" ||
    filters.zones.length > 0 ||
    filters.statuts.length > 0
  );
}

export interface AnalysisWithZone extends Analysis {
  _zone: ZoneRisque | null;
  _revisionOverdue: boolean;
}

export function enrichAnalysis(analysis: Analysis): AnalysisWithZone {
  return {
    ...analysis,
    _zone: getEffectiveZone(analysis),
    _revisionOverdue: isRevisionOverdue(analysis),
  };
}

export function filterAnalyses(
  analyses: AnalysisWithZone[],
  filters: DashboardFilters,
): AnalysisWithZone[] {
  return analyses.filter((a) => {
    if (
      filters.entreprise.trim() &&
      !a.entreprise
        .toLowerCase()
        .includes(filters.entreprise.trim().toLowerCase())
    ) {
      return false;
    }

    if (filters.departement && a.departement !== filters.departement) {
      return false;
    }

    if (filters.zones.length > 0) {
      const zoneStr = a._zone != null ? String(a._zone) : null;
      if (!zoneStr || !filters.zones.includes(zoneStr)) {
        return false;
      }
    }

    if (filters.statuts.length > 0 && !filters.statuts.includes(a.status)) {
      return false;
    }

    return true;
  });
}

// --- Sorting ---

export function sortAnalyses(analyses: AnalysisWithZone[]): AnalysisWithZone[] {
  return [...analyses].sort((a, b) => {
    // Revision overdue analyses first
    if (a._revisionOverdue && !b._revisionOverdue) return -1;
    if (!a._revisionOverdue && b._revisionOverdue) return 1;

    // Then by updatedAt descending
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

// --- Revision alerts ---

/**
 * Check if an analysis has a revision date that is in the past.
 */
export function isRevisionOverdue(analysis: Analysis): boolean {
  const dateStr = analysis.documentation?.trainingDoc?.dateRevision;
  if (!dateStr) return false;

  try {
    const revisionDate = new Date(dateStr);
    if (isNaN(revisionDate.getTime())) return false;
    return revisionDate.getTime() < Date.now();
  } catch {
    return false;
  }
}

export function getOverdueCount(analyses: AnalysisWithZone[]): number {
  return analyses.filter((a) => a._revisionOverdue).length;
}

// --- Pagination ---

export const PAGE_SIZE = 10;

export function paginateAnalyses(
  analyses: AnalysisWithZone[],
  page: number,
): AnalysisWithZone[] {
  const start = page * PAGE_SIZE;
  return analyses.slice(start, start + PAGE_SIZE);
}

export function getTotalPages(totalCount: number): number {
  return Math.ceil(totalCount / PAGE_SIZE);
}

// --- Unique values extraction ---

export function getUniqueEntreprises(analyses: AnalysisWithZone[]): string[] {
  const set = new Set(analyses.map((a) => a.entreprise).filter(Boolean));
  return [...set].sort((a, b) => a.localeCompare(b, "fr"));
}

export function getUniqueDepartements(analyses: AnalysisWithZone[]): string[] {
  const set = new Set(analyses.map((a) => a.departement).filter(Boolean));
  return [...set].sort((a, b) => a.localeCompare(b, "fr"));
}
