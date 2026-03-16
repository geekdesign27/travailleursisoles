import { useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAnalysis } from "@/contexts/AnalysisContext";
import {
  saveAnalysis,
  loadAnalysis,
} from "@/features/persistence/localStorageService";
import { ZoneBadge } from "@/components/shared/ZoneBadge";
import type { ZoneRisque } from "@/constants/suvaMatrix";

const PERIODE_LABELS: Record<string, string> = {
  jour: "Jour",
  nuit: "Nuit",
  weekend: "Week-end",
  jour_ferie: "Jour férié",
  piquet: "Piquet",
};

export function Step07Finalisation() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useAnalysis();

  // Load analysis from localStorage if not in context
  useEffect(() => {
    if (!state.current && id) {
      const loaded = loadAnalysis(id);
      if (loaded) {
        dispatch({ type: "analysis/LOAD", payload: loaded });
      } else {
        toast.error("Analyse introuvable");
        navigate("/");
      }
    }
  }, [state.current, id, dispatch, navigate]);

  // Mark as completed on mount
  useEffect(() => {
    if (state.current && state.current.status !== "completed") {
      const updated = {
        ...state.current,
        status: "completed" as const,
        currentStep: 7,
        updatedAt: new Date().toISOString(),
      };

      const result = saveAnalysis(updated);
      if (result.ok) {
        dispatch({ type: "analysis/LOAD", payload: updated });
      }
    }
  }, [state.current, dispatch]);

  const analysis = state.current;

  // Current zone: use reclassified zone from level 3 if applicable
  const currentZone: ZoneRisque | undefined = useMemo(() => {
    const l3 = analysis?.level3Result;
    if (l3?.tmaxResult?.newZone) return l3.tmaxResult.newZone;
    return analysis?.level2Result?.zone;
  }, [analysis?.level3Result, analysis?.level2Result?.zone]);

  const handleViewReport = useCallback(() => {
    navigate(`/analysis/${id}/report`);
  }, [navigate, id]);

  const handleBackToDashboard = useCallback(() => {
    navigate("/");
  }, [navigate]);

  if (!analysis) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Finalisation de l'analyse
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          L'analyse est terminée. Voici un résumé complet de vos résultats.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Identification */}
        <section className="space-y-2 rounded-lg border p-4">
          <h3 className="text-base font-medium">Identification</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-muted-foreground">Entreprise</dt>
              <dd>{analysis.entreprise}</dd>
            </div>
            {analysis.departement && (
              <div>
                <dt className="font-medium text-muted-foreground">
                  Département
                </dt>
                <dd>{analysis.departement}</dd>
              </div>
            )}
            <div>
              <dt className="font-medium text-muted-foreground">
                Titre de l'activité
              </dt>
              <dd>{analysis.titre_activite}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Période</dt>
              <dd>
                {PERIODE_LABELS[analysis.periode_travail] ??
                  analysis.periode_travail}
              </dd>
            </div>
          </dl>
        </section>

        {/* Zone result */}
        {currentZone && (
          <section className="space-y-2 rounded-lg border p-4">
            <h3 className="text-base font-medium">Résultat de zone</h3>
            <div className="flex items-center gap-3">
              <ZoneBadge zone={currentZone} variant="prominent" />
            </div>
          </section>
        )}

        {/* Level summaries */}
        <section className="space-y-2 rounded-lg border p-4">
          <h3 className="text-base font-medium">Résumé des niveaux</h3>
          <div className="space-y-3 text-sm">
            {/* Level 1 */}
            {analysis.level1Result && (
              <div>
                <h4 className="font-medium">Niveau 1 — Tri initial</h4>
                <p className="text-muted-foreground">
                  {analysis.level1Result.blocked
                    ? "Travail isolé interdit"
                    : analysis.level1Result.isMinor
                      ? "Risques mineurs identifiés"
                      : "Analyse approfondie nécessaire"}
                </p>
              </div>
            )}

            {/* Level 2 */}
            {analysis.level2Result && (
              <div>
                <h4 className="font-medium">
                  Niveau 2 — Évaluation des risques
                </h4>
                <p className="text-muted-foreground">
                  Gravité : {analysis.level2Result.gravity}, Probabilité :{" "}
                  {analysis.level2Result.probability} — Catégorie :{" "}
                  {analysis.level2Result.dangerCategory}
                </p>
              </div>
            )}

            {/* Level 3 */}
            {analysis.level3Result && (
              <div>
                <h4 className="font-medium">
                  Niveau 3 — Conditions opérationnelles
                </h4>
                <p className="text-muted-foreground">
                  Tmax : {analysis.level3Result.tmaxResult.tmax} min —{" "}
                  {analysis.level3Result.tmaxResult.feasible
                    ? "Faisable"
                    : "Non faisable"}
                  {analysis.level3Result.tmaxResult.reclassificationNeeded &&
                    " (reclassification effectuée)"}
                </p>
              </div>
            )}

            {/* Level 4 */}
            {analysis.level4Result && (
              <div>
                <h4 className="font-medium">
                  Niveau 4 — Validation de l'alerte
                </h4>
                <p className="text-muted-foreground">
                  Charge cognitive : {analysis.level4Result.cognitiveLoad} —
                  Statut :{" "}
                  {analysis.level4Result.validationResult.status ===
                  "compatible"
                    ? "Compatible"
                    : analysis.level4Result.validationResult.status ===
                        "incompatible"
                      ? "Incompatible"
                      : "Avec réserves"}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Emergency concept */}
        {analysis.documentation?.emergencyConcept && (
          <section className="space-y-2 rounded-lg border p-4">
            <h3 className="text-base font-medium">Concept d'urgence</h3>
            <dl className="space-y-2 text-sm">
              {analysis.documentation.emergencyConcept.alerte && (
                <div>
                  <dt className="font-medium text-muted-foreground">Alerte</dt>
                  <dd className="whitespace-pre-line">
                    {analysis.documentation.emergencyConcept.alerte}
                  </dd>
                </div>
              )}
              {analysis.documentation.emergencyConcept.premierSecours && (
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Premiers secours
                  </dt>
                  <dd className="whitespace-pre-line">
                    {analysis.documentation.emergencyConcept.premierSecours}
                  </dd>
                </div>
              )}
              {analysis.documentation.emergencyConcept.formation && (
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Formation
                  </dt>
                  <dd className="whitespace-pre-line">
                    {analysis.documentation.emergencyConcept.formation}
                  </dd>
                </div>
              )}
              {analysis.documentation.emergencyConcept.accesSecours && (
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Accès des secours
                  </dt>
                  <dd className="whitespace-pre-line">
                    {analysis.documentation.emergencyConcept.accesSecours}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {/* Training info */}
        {analysis.documentation?.trainingDoc && (
          <section className="space-y-2 rounded-lg border p-4">
            <h3 className="text-base font-medium">Formation</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
              {analysis.documentation.trainingDoc.dateFormation && (
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Date de formation
                  </dt>
                  <dd>{analysis.documentation.trainingDoc.dateFormation}</dd>
                </div>
              )}
              {analysis.documentation.trainingDoc.formateur && (
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Formateur
                  </dt>
                  <dd>{analysis.documentation.trainingDoc.formateur}</dd>
                </div>
              )}
              {analysis.documentation.trainingDoc.documentation && (
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Documentation
                  </dt>
                  <dd>{analysis.documentation.trainingDoc.documentation}</dd>
                </div>
              )}
              {analysis.documentation.trainingDoc.dateRevision && (
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Révision prévue
                  </dt>
                  <dd>{analysis.documentation.trainingDoc.dateRevision}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {/* Status badge */}
        <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
          <svg
            className="h-5 w-5 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="font-semibold text-green-800 dark:text-green-300">
            Analyse complétée
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={handleViewReport}
            className="min-h-[44px] bg-suva-primary text-white hover:bg-suva-primary-hover"
          >
            Voir le rapport
          </Button>
          <Button
            variant="secondary"
            onClick={handleBackToDashboard}
            className="min-h-[44px]"
          >
            Retour au dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
