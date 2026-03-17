import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAnalysis } from "@/contexts/AnalysisContext";
import {
  saveAnalysis,
  loadAnalysis,
} from "@/features/persistence/localStorageService";
import { validateAlertTool } from "@/features/engine/alertValidator";
import type { AlertValidationResult } from "@/features/engine/alertValidator";
import { GateAlert } from "@/components/shared/GateAlert";
import { HelpTooltip } from "@/components/shared/HelpTooltip";
import { HELP_CONTENT } from "@/constants/helpContent";
import { ZoneBadge } from "@/components/shared/ZoneBadge";
import { WizardNavigation } from "../WizardNavigation";
import {
  COGNITIVE_LOAD_LEVELS,
  COGNITIVE_LOAD_QUESTIONS,
  type CognitiveLoadLevel,
} from "@/constants/cognitiveLoad";
import { DATI_TYPES } from "@/constants/datiEquipment";
import type { CouvertureReseauType } from "@/types/analysis.schema";
import type { ZoneRisque } from "@/constants/suvaMatrix";
import { cn } from "@/lib/utils";

export function Step05Level4Alert() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useAnalysis();

  const [cognitiveLoad, setCognitiveLoad] = useState<CognitiveLoadLevel | "">(
    "",
  );
  const [equipmentType, setEquipmentType] = useState("");
  const [correctiveMeasures, setCorrectiveMeasures] = useState("");

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

  // Restore saved level4Result if navigating back
  useEffect(() => {
    if (state.current?.level4Result) {
      const r = state.current.level4Result;
      setCognitiveLoad(r.cognitiveLoad);
      setEquipmentType(r.equipmentType);
      setCorrectiveMeasures(r.correctiveMeasures);
    }
  }, [state.current?.level4Result]);

  // Current zone: use reclassified zone from level 3 if applicable, otherwise level 2 zone
  const currentZone: ZoneRisque | undefined = useMemo(() => {
    const l3 = state.current?.level3Result;
    if (l3?.tmaxResult?.newZone) return l3.tmaxResult.newZone;
    return state.current?.level2Result?.zone;
  }, [state.current?.level3Result, state.current?.level2Result?.zone]);

  // Coverage from level 3 operational conditions
  const coverage: CouvertureReseauType | undefined =
    state.current?.level3Result?.operationalConditions?.couvertureReseau;

  // Validation result
  const validationResult: AlertValidationResult | null = useMemo(() => {
    if (!cognitiveLoad || !equipmentType || !currentZone || !coverage) {
      return null;
    }
    return validateAlertTool({
      zone: currentZone,
      equipmentType,
      coverage,
      cognitiveLoad,
    });
  }, [cognitiveLoad, equipmentType, currentZone, coverage]);

  const isFormComplete = cognitiveLoad !== "" && equipmentType !== "";

  const handlePrevious = useCallback(() => {
    navigate(`/analysis/${id}/level-3`);
  }, [navigate, id]);

  const handleNext = useCallback(() => {
    if (!state.current || !isFormComplete) return;

    // Build validation result — may be null if zone/coverage unavailable
    const finalValidationResult = validationResult ?? {
      compatible: true,
      status: "compatible" as const,
      measures: [],
      reason:
        "Validation automatique non disponible (données de zone manquantes). Vérifier manuellement.",
    };

    const updated = {
      ...state.current,
      currentStep: 5,
      currentLevel: 4,
      level4Result: {
        cognitiveLoad: cognitiveLoad as CognitiveLoadLevel,
        equipmentType,
        validationResult: finalValidationResult,
        correctiveMeasures,
      },
      updatedAt: new Date().toISOString(),
    };

    const result = saveAnalysis(updated);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    dispatch({
      type: "analysis/SET_STEP",
      payload: { step: 5, level: 4 },
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/analysis/${id}/level-5`);
  }, [
    state.current,
    validationResult,
    isFormComplete,
    cognitiveLoad,
    equipmentType,
    correctiveMeasures,
    id,
    navigate,
    dispatch,
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Niveau 4 — Validation de l'outil d'alerte
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Évaluez la charge cognitive de l'activité et validez la compatibilité
          de l'outil d'alerte avec les conditions de travail.
        </p>
        {currentZone && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm font-medium">Zone actuelle :</span>
            <ZoneBadge zone={currentZone} variant="inline" />
          </div>
        )}
        {coverage && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm font-medium">Couverture réseau :</span>
            <span className="text-sm text-muted-foreground capitalize">
              {coverage}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Section A: Cognitive load evaluation */}
        <fieldset className="space-y-4">
          <legend className="mb-1 flex items-center gap-2 text-base font-medium">
            Évaluation de la charge cognitive
            <HelpTooltip
              {...HELP_CONTENT.charge_cognitive}
              fieldId="charge_cognitive"
            />
          </legend>
          <p className="text-sm text-muted-foreground">
            Sélectionnez la description qui correspond le mieux à l'activité du
            travailleur isolé.
          </p>

          <div className="space-y-3">
            {COGNITIVE_LOAD_QUESTIONS.map((q) => {
              const levelDef = COGNITIVE_LOAD_LEVELS.find(
                (l) => l.level === q.mappedLevel,
              );
              return (
                <label
                  key={q.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50",
                    cognitiveLoad === q.mappedLevel
                      ? "border-suva-primary bg-suva-primary/5"
                      : "border-border",
                  )}
                >
                  <input
                    type="radio"
                    name="cognitive-load"
                    value={q.mappedLevel}
                    checked={cognitiveLoad === q.mappedLevel}
                    onChange={() => setCognitiveLoad(q.mappedLevel)}
                    className="mt-1 h-4 w-4 cursor-pointer accent-suva-primary"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {q.mappedLevel} — {levelDef?.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {q.question}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Section B: DATI equipment selection */}
        <fieldset className="space-y-4">
          <legend className="mb-1 flex items-center gap-2 text-base font-medium">
            Équipement DATI
            <HelpTooltip
              {...HELP_CONTENT.equipment_type}
              fieldId="equipment_type"
            />
          </legend>
          <p className="text-sm text-muted-foreground">
            Sélectionnez le type de dispositif d'alerte utilisé ou prévu.
          </p>

          <div className="space-y-1">
            <Label htmlFor="equipment-type">Type d'équipement</Label>
            <select
              id="equipment-type"
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Sélectionnez...</option>
              {DATI_TYPES.map((dati) => (
                <option key={dati.id} value={dati.id}>
                  {dati.label}
                </option>
              ))}
            </select>
          </div>

          {equipmentType && (
            <p className="text-sm text-muted-foreground">
              {DATI_TYPES.find((d) => d.id === equipmentType)?.description}
            </p>
          )}
        </fieldset>

        {/* Section C: Validation result display */}
        {validationResult && (
          <div className="space-y-4">
            <h3 className="text-base font-medium">Résultat de la validation</h3>

            {validationResult.status === "compatible" && (
              <div className="rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
                <div className="flex items-center gap-2">
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
                  <h4 className="font-semibold text-green-800 dark:text-green-300">
                    Compatible
                  </h4>
                </div>
                <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                  {validationResult.reason}
                </p>
              </div>
            )}

            {validationResult.status === "incompatible" && (
              <GateAlert
                type="blocking"
                title="Incompatible"
                message={validationResult.reason}
                reference="SUVA 44094.F"
              />
            )}

            {validationResult.status === "with_reserves" && (
              <GateAlert
                type="warning"
                title="Compatible avec réserves"
                message={validationResult.reason}
                reference="SUVA 44094.F"
              />
            )}

            {/* Measures list */}
            {validationResult.measures.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  {validationResult.status === "incompatible"
                    ? "Actions requises :"
                    : "Mesures recommandées :"}
                </h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {validationResult.measures.map((measure, i) => (
                    <li key={i}>{measure}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Section D: Corrective measures */}
        {validationResult && validationResult.status !== "compatible" && (
          <fieldset className="space-y-4">
            <legend className="mb-1 flex items-center gap-2 text-base font-medium">
              Mesures correctives
              <HelpTooltip
                {...HELP_CONTENT.corrective_measures}
                fieldId="corrective_measures"
              />
            </legend>
            <p className="text-sm text-muted-foreground">
              Documentez les mesures correctives prévues ou mises en place par
              le spécialiste.
            </p>
            <div className="space-y-1">
              <Label htmlFor="corrective-measures">
                Mesures correctives documentées
              </Label>
              <textarea
                id="corrective-measures"
                value={correctiveMeasures}
                onChange={(e) => setCorrectiveMeasures(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Décrivez les mesures correctives prévues..."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground">
                {correctiveMeasures.length}/1000 caractères
              </p>
            </div>
          </fieldset>
        )}

        {/* Navigation */}
        <WizardNavigation
          onNext={handleNext}
          onPrevious={handlePrevious}
          nextDisabled={!isFormComplete}
          nextLabel="Suivant"
        />
      </CardContent>
    </Card>
  );
}
