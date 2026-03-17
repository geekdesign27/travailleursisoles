import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { saveAnalysis } from "@/features/persistence/localStorageService";
import { loadAnalysis } from "@/features/persistence/localStorageService";
import { REGULATED_WORK_CATEGORIES } from "@/constants/regulatedWork";
import {
  evaluateLevel1Gate,
  type GateResult,
} from "@/features/engine/gateEvaluator";
import { GateAlert } from "@/components/shared/GateAlert";
import { HelpTooltip } from "@/components/shared/HelpTooltip";
import { HELP_CONTENT } from "@/constants/helpContent";
import { WizardNavigation } from "../WizardNavigation";

export function Step02Level1Gate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useAnalysis();

  const [checkedCategories, setCheckedCategories] = useState<string[]>([]);
  const [isMinor, setIsMinor] = useState(false);
  const [gateResult, setGateResult] = useState<GateResult>({
    blocked: false,
    zone: null,
    reason: "",
    reference: "",
  });

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

  // Re-evaluate gate whenever selections change
  useEffect(() => {
    const result = evaluateLevel1Gate(checkedCategories, isMinor);
    setGateResult(result);
  }, [checkedCategories, isMinor]);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setCheckedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId],
    );
  }, []);

  const handleMinorToggle = useCallback(() => {
    setIsMinor((prev) => !prev);
  }, []);

  const handlePrevious = () => {
    navigate(`/analysis/new`);
  };

  const handleNext = () => {
    if (gateResult.blocked || !state.current) return;

    const updated = {
      ...state.current,
      currentStep: 2,
      currentLevel: 1,
      level1Result: {
        blocked: false,
        checkedCategories: [],
        isMinor: false,
      },
      updatedAt: new Date().toISOString(),
    };

    const result = saveAnalysis(updated);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    dispatch({
      type: "analysis/UPDATE_FIELD",
      payload: { field: "currentStep", value: 2 },
    });
    dispatch({
      type: "analysis/UPDATE_FIELD",
      payload: { field: "currentLevel", value: 1 },
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/analysis/${id}/level-2`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Niveau 1 — Gate réglementaire
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Vérifiez si l'activité isolée implique des travaux réglementés ou du
          personnel mineur. Si oui, le travail isolé est interdit (Zone 1).
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Regulated work categories */}
        <fieldset>
          <legend className="mb-3 flex items-center gap-2 text-base font-medium">
            Travaux réglementés
            <HelpTooltip
              {...HELP_CONTENT.travaux_reglementes}
              fieldId="travaux_reglementes"
            />
          </legend>
          <div className="space-y-3">
            {REGULATED_WORK_CATEGORIES.filter((c) => c.id !== 8).map(
              (category) => (
                <label
                  key={category.id}
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={checkedCategories.includes(String(category.id))}
                    onChange={() => handleCategoryToggle(String(category.id))}
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-input accent-suva-primary"
                    aria-describedby={`cat-ref-${category.id}`}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">
                      {category.label}
                    </span>
                    <span
                      id={`cat-ref-${category.id}`}
                      className="ml-2 text-xs text-muted-foreground"
                    >
                      ({category.reference})
                    </span>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </label>
              ),
            )}
          </div>
        </fieldset>

        {/* Minor worker */}
        <fieldset>
          <legend className="mb-3 flex items-center gap-2 text-base font-medium">
            Personnel mineur
            <HelpTooltip
              {...HELP_CONTENT.personnel_mineur}
              fieldId="personnel_mineur"
            />
          </legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 transition-colors hover:bg-muted/50">
            <input
              type="checkbox"
              checked={isMinor}
              onChange={handleMinorToggle}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-input accent-suva-primary"
            />
            <div className="flex-1">
              <span className="text-sm font-medium">
                Personnel mineur (&lt; 18 ans)
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                (OLT 4, art. 4 al. 1)
              </span>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Toute activité isolée avec personnel de moins de 18 ans est
                interdite.
              </p>
            </div>
          </label>
        </fieldset>

        {/* Gate result alert */}
        {gateResult.blocked && (
          <GateAlert
            type="blocking"
            title="Zone 1 — NO-GO"
            message={gateResult.reason}
            reference={gateResult.reference}
            zone={1}
          />
        )}

        {!gateResult.blocked && checkedCategories.length === 0 && !isMinor && (
          <GateAlert
            type="info"
            title="Aucun travail réglementé détecté"
            message="Vous pouvez passer au niveau suivant pour évaluer les risques."
          />
        )}

        <WizardNavigation
          onNext={handleNext}
          onPrevious={handlePrevious}
          nextDisabled={gateResult.blocked}
        />
      </CardContent>
    </Card>
  );
}
