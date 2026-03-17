import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ZoneBadge } from "@/components/shared/ZoneBadge";
import {
  listAnalyses,
  loadAnalysis,
} from "@/features/persistence/localStorageService";
import { useAnalysisResume } from "@/features/persistence/useAnalysisResume";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { useSheetAnalyses } from "@/features/sync/useSheetAnalyses";
import { useGoogleSheets } from "@/contexts/GoogleSheetsContext";
import type { ZoneRisque } from "@/constants/suvaMatrix";
import {
  type AnalysisWithZone,
  type DashboardFilters,
  EMPTY_FILTERS,
  enrichAnalysis,
  filterAnalyses,
  getOverdueCount,
  getPeriodeLabel,
  getStatusLabel,
  getStatusVariant,
  getTotalPages,
  getUniqueDepartements,
  hasActiveFilters,
  paginateAnalyses,
  sortAnalyses,
} from "./dashboardHelpers";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  CloudIcon,
  Loader2Icon,
  RefreshCwIcon,
} from "lucide-react";

// Map currentStep to route segments (same as useAnalysisResume)
const STEP_ROUTES: Record<number, string> = {
  1: "",
  2: "/level-1",
  3: "/level-2",
  4: "/level-3",
  5: "/level-4",
  6: "/level-5",
  7: "/finalisation",
};

const ALL_ZONES: { value: string; label: string }[] = [
  { value: "1", label: "Zone 1" },
  { value: "2", label: "Zone 2" },
  { value: "3a", label: "Zone 3a" },
  { value: "3b", label: "Zone 3b" },
  { value: "4", label: "Zone 4" },
];

const ALL_STATUTS: { value: string; label: string }[] = [
  { value: "draft", label: "Brouillon" },
  { value: "in_progress", label: "En cours" },
  { value: "completed", label: "Terminée" },
  { value: "archived", label: "Archivée" },
];

const ONBOARDING_KEY = "app:onboarding-shown";

export function DashboardPage() {
  const navigate = useNavigate();
  const { dispatch } = useAnalysis();
  const { resumable, resume, dismiss } = useAnalysisResume();

  // Redirect to onboarding on first visit
  useEffect(() => {
    if (localStorage.getItem(ONBOARDING_KEY) !== "true") {
      navigate("/onboarding", { replace: true });
    }
  }, [navigate]);

  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);

  // Google Sheets data
  const { state: sheetsState } = useGoogleSheets();
  const {
    sheetAnalyses,
    isLoading: sheetsLoading,
    error: sheetsError,
    refetch: refetchSheets,
  } = useSheetAnalyses();

  // Load local analyses
  const localAnalyses = useMemo<AnalysisWithZone[]>(() => {
    const index = listAnalyses();
    return index
      .map((entry) => {
        const full = loadAnalysis(entry.id);
        return full ? enrichAnalysis(full) : null;
      })
      .filter((a): a is AnalysisWithZone => a !== null);
  }, []);

  // Merge: local + sheet (sheet analyses not already in local, deduped by id)
  const allAnalyses = useMemo<AnalysisWithZone[]>(() => {
    const localIds = new Set(localAnalyses.map((a) => a.id));
    const fromSheet = sheetAnalyses
      .filter((a) => !localIds.has(a.id))
      .map(enrichAnalysis);
    return [...localAnalyses, ...fromSheet];
  }, [localAnalyses, sheetAnalyses]);

  // Extract unique departements for filter
  const departements = useMemo(
    () => getUniqueDepartements(allAnalyses),
    [allAnalyses],
  );

  // Filtered, sorted, paginated
  const filtered = useMemo(
    () => filterAnalyses(allAnalyses, filters),
    [allAnalyses, filters],
  );
  const sorted = useMemo(() => sortAnalyses(filtered), [filtered]);
  const totalPages = getTotalPages(sorted.length);
  const paginated = useMemo(
    () => paginateAnalyses(sorted, page),
    [sorted, page],
  );

  const overdueCount = useMemo(
    () => getOverdueCount(allAnalyses),
    [allAnalyses],
  );

  const filtersActive = hasActiveFilters(filters);

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    setPage(0);
  }

  function updateFilter<K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K],
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  }

  function toggleArrayFilter(key: "zones" | "statuts", value: string) {
    setFilters((prev) => {
      const arr = prev[key];
      const next = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      return { ...prev, [key]: next };
    });
    setPage(0);
  }

  function handleCardClick(analysis: AnalysisWithZone) {
    // Try localStorage first, fall back to the analysis object itself (from Sheets)
    const full = loadAnalysis(analysis.id) ?? analysis;

    if (analysis.status === "completed") {
      dispatch({ type: "analysis/LOAD", payload: full });
      navigate(`/analysis/${analysis.id}/report`);
      return;
    }

    // Draft or in_progress: load and resume wizard at current step
    dispatch({ type: "analysis/LOAD", payload: full });
    const route = STEP_ROUTES[full.currentStep] ?? "";
    navigate(`/analysis/${full.id}${route}`);
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analyses travailleurs isolés</h1>
        <Link
          to="/analysis/new"
          className={buttonVariants({
            className: "bg-suva-primary text-white hover:bg-suva-primary-hover",
          })}
        >
          Nouvelle analyse
        </Link>
      </div>

      {/* Google Sheets sync indicator */}
      {sheetsState.configured && sheetsState.spreadsheetId && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-900">
          <CloudIcon className="size-4 shrink-0" />
          <div className="flex-1 text-sm">
            {sheetsLoading ? (
              <span className="flex items-center gap-2">
                <Loader2Icon className="size-3 animate-spin" />
                Chargement depuis Google Sheets...
              </span>
            ) : sheetsError ? (
              <span className="text-red-600">
                Erreur Sheets : {sheetsError}
              </span>
            ) : (
              <span>
                {sheetAnalyses.length} analyse
                {sheetAnalyses.length !== 1 ? "s" : ""} depuis Google Sheets
                {localAnalyses.length > 0 && (
                  <>
                    {" "}
                    &middot; {localAnalyses.length} locale
                    {localAnalyses.length !== 1 ? "s" : ""}
                  </>
                )}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refetchSheets}
            disabled={sheetsLoading}
          >
            <RefreshCwIcon
              className={`size-4 ${sheetsLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      )}

      {/* Resume banner */}
      {resumable && (
        <Card className="mb-6 border-suva-primary/30 bg-suva-primary/5">
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">
                Reprendre l&apos;analyse &laquo;&nbsp;{resumable.titre_activite}
                &nbsp;&raquo;&nbsp;?
              </p>
              <p className="text-sm text-muted-foreground">
                Dernière modification le{" "}
                {new Date(resumable.updatedAt).toLocaleDateString("fr-CH")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={resume}
                className="bg-suva-primary text-white hover:bg-suva-primary-hover"
              >
                Reprendre
              </Button>
              <Button variant="outline" onClick={dismiss}>
                Ignorer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revision alert banner */}
      {overdueCount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="size-5 shrink-0" />
          <p className="text-sm font-medium">
            {overdueCount === 1
              ? "1 analyse nécessite une révision"
              : `${overdueCount} analyses nécessitent une révision`}
          </p>
        </div>
      )}

      {allAnalyses.length === 0 && !sheetsLoading ? (
        /* Empty state: no analyses at all (and not currently loading) */
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <p className="mb-2 text-lg font-medium text-muted-foreground">
              Aucune analyse pour le moment
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              Créez votre première analyse pour commencer l&apos;évaluation
              d&apos;un poste de travailleur isolé selon la méthode SUVA
              44094.F.
            </p>
            <Link
              to="/analysis/new"
              className={buttonVariants({
                className:
                  "bg-suva-primary text-white hover:bg-suva-primary-hover",
              })}
            >
              Créer ma première analyse
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filters */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              {/* Entreprise */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="filter-entreprise"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Entreprise
                </label>
                <Input
                  id="filter-entreprise"
                  placeholder="Rechercher..."
                  value={filters.entreprise}
                  onChange={(e) => updateFilter("entreprise", e.target.value)}
                  className="h-8 w-48"
                />
              </div>

              {/* Département */}
              {departements.length > 0 && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Département
                  </label>
                  <Select
                    value={filters.departement}
                    onValueChange={(val) =>
                      updateFilter("departement", val as string)
                    }
                  >
                    <SelectTrigger className="h-8 w-48">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous</SelectItem>
                      {departements.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Reset */}
              {filtersActive && (
                <button
                  onClick={resetFilters}
                  className="flex h-8 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Zone toggle chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Zone :
              </span>
              {ALL_ZONES.map((z) => (
                <button
                  key={z.value}
                  onClick={() => toggleArrayFilter("zones", z.value)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    filters.zones.includes(z.value)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>

            {/* Status toggle chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Statut :
              </span>
              {ALL_STATUTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => toggleArrayFilter("statuts", s.value)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    filters.statuts.includes(s.value)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {sorted.length === 0 ? (
            /* Empty state: filters no results */
            <Card>
              <CardContent className="flex flex-col items-center py-12 text-center">
                <p className="mb-2 text-lg font-medium text-muted-foreground">
                  Aucun résultat pour ces filtres
                </p>
                <button
                  onClick={resetFilters}
                  className="text-sm text-primary underline hover:no-underline"
                >
                  Réinitialiser les filtres
                </button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {paginated.map((analysis) => (
                  <AnalysisCard
                    key={analysis.id}
                    analysis={analysis}
                    onClick={() => handleCardClick(analysis)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {sorted.length} analyse{sorted.length > 1 ? "s" : ""} — page{" "}
                    {page + 1}/{totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="size-4" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Suivant
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}

// --- Analysis Card ---

function AnalysisCard({
  analysis,
  onClick,
}: {
  analysis: AnalysisWithZone;
  onClick: () => void;
}) {
  const statusLabel = getStatusLabel(analysis.status);
  const statusVariant = getStatusVariant(analysis.status);

  return (
    <Card
      className={`cursor-pointer transition-shadow hover:shadow-md ${
        analysis._revisionOverdue ? "border-l-4 border-l-amber-400" : ""
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg">{analysis.titre_activite}</CardTitle>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
          {analysis._zone != null && (
            <ZoneBadge zone={analysis._zone as ZoneRisque} />
          )}
          {analysis._revisionOverdue && (
            <Badge className="border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-200">
              Révision requise
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{analysis.entreprise}</span>
            {analysis.departement && <span>{analysis.departement}</span>}
            <span>{getPeriodeLabel(analysis.periode_travail)}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Mis à jour le{" "}
            {new Date(analysis.updatedAt).toLocaleDateString("fr-CH")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
