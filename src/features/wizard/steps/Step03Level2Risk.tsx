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
import {
  evaluateAptitudes,
  evaluateLevel2,
} from "@/features/engine/riskEvaluator";
import type { GravityLevel, ProbabilityLevel } from "@/constants/suvaMatrix";
import { GRAVITY_LEVELS } from "@/constants/gravityLevels";
import { PROBABILITY_LEVELS } from "@/constants/probabilityLevels";
import {
  DANGER_CATEGORIES,
  type DangerCategoryType,
} from "@/types/analysis.schema";
import { GateAlert } from "@/components/shared/GateAlert";
import { HelpTooltip } from "@/components/shared/HelpTooltip";
import { HELP_CONTENT } from "@/constants/helpContent";
import { RiskMatrix } from "@/components/shared/RiskMatrix";
import { ZoneBadge } from "@/components/shared/ZoneBadge";
import { WizardNavigation } from "../WizardNavigation";

const DANGER_CATEGORY_LABELS: Record<DangerCategoryType, string> = {
  mecanique: "Mécanique",
  electrique: "Électrique",
  thermique: "Thermique",
  chimique: "Chimique",
  biologique: "Biologique",
  chute: "Chute de hauteur / de plain-pied",
  noyade: "Noyade",
  asphyxie: "Asphyxie / manque d'oxygène",
  psychosocial: "Psychosocial",
  autre: "Autre",
};

export function Step03Level2Risk() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useAnalysis();

  // Aptitude state
  const [psychique, setPsychique] = useState(true);
  const [physique, setPhysique] = useState(true);
  const [intellectuelle, setIntellectuelle] = useState(true);

  // Risk evaluation state
  const [gravity, setGravity] = useState<GravityLevel | null>(null);
  const [probability, setProbability] = useState<ProbabilityLevel | null>(null);

  // Danger description state
  const [dangerDescription, setDangerDescription] = useState("");
  const [dangerCategory, setDangerCategory] = useState<DangerCategoryType | "">(
    "",
  );

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

  // Derived evaluations
  const aptitudeResult = useMemo(
    () => evaluateAptitudes(psychique, physique, intellectuelle),
    [psychique, physique, intellectuelle],
  );

  const level2Result = useMemo(() => {
    if (!gravity || !probability) return null;
    return evaluateLevel2(gravity, probability);
  }, [gravity, probability]);

  // Validation check
  const isFormComplete =
    aptitudeResult.allValid &&
    gravity !== null &&
    probability !== null &&
    dangerDescription.length >= 150 &&
    dangerDescription.length <= 300 &&
    dangerCategory !== "";

  const isBlocked =
    !aptitudeResult.allValid || (level2Result?.blocked ?? false);

  const handlePrevious = useCallback(() => {
    navigate(`/analysis/${id}/level-1`);
  }, [navigate, id]);

  const handleNext = useCallback(() => {
    if (!state.current || !level2Result || !isFormComplete) return;

    const updated = {
      ...state.current,
      currentStep: 3,
      currentLevel: 2,
      level2Result: {
        gravity: level2Result.gravity,
        probability: level2Result.probability,
        zone: level2Result.zone,
        aptitudes: {
          psychique,
          physique,
          intellectuelle,
        },
        dangerDescription,
        dangerCategory: dangerCategory as DangerCategoryType,
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
      payload: { field: "currentStep", value: 3 },
    });
    dispatch({
      type: "analysis/UPDATE_FIELD",
      payload: { field: "currentLevel", value: 2 },
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (level2Result.nextAction === "report") {
      navigate(`/analysis/${id}/report`);
    } else {
      navigate(`/analysis/${id}/level-3`);
    }
  }, [
    state.current,
    level2Result,
    isFormComplete,
    psychique,
    physique,
    intellectuelle,
    dangerDescription,
    dangerCategory,
    id,
    navigate,
    dispatch,
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Niveau 2 — Évaluation des risques
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Évaluez les aptitudes du travailleur, la gravité et la probabilité du
          danger pour déterminer la zone de risque SUVA.
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Section A: Aptitude check */}
        <fieldset className="space-y-3">
          <legend className="mb-1 text-base font-medium">
            Aptitudes du travailleur
          </legend>
          <p className="text-sm text-muted-foreground">
            Le travailleur dispose-t-il des aptitudes suivantes pour effectuer
            cette activité de manière isolée ?
          </p>

          {[
            {
              id: "psychique",
              label: "Aptitude psychique",
              desc: "Capacité à gérer le stress, l'isolement et les situations imprévues",
              value: psychique,
              setter: setPsychique,
            },
            {
              id: "physique",
              label: "Aptitude physique",
              desc: "Condition physique adaptée à l'activité et à l'environnement",
              value: physique,
              setter: setPhysique,
            },
            {
              id: "intellectuelle",
              label: "Aptitude intellectuelle",
              desc: "Compréhension des risques, des consignes et des procédures d'urgence",
              value: intellectuelle,
              setter: setIntellectuelle,
            },
          ].map((aptitude) => (
            <label
              key={aptitude.id}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 transition-colors hover:bg-muted/50"
            >
              <input
                type="checkbox"
                checked={aptitude.value}
                onChange={() => aptitude.setter(!aptitude.value)}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-input accent-suva-primary"
              />
              <div className="flex-1">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  {aptitude.label}
                  <HelpTooltip
                    {...HELP_CONTENT[`aptitude_${aptitude.id}`]}
                    fieldId={`aptitude_${aptitude.id}`}
                  />
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {aptitude.desc}
                </p>
              </div>
            </label>
          ))}

          {!aptitudeResult.allValid && (
            <GateAlert
              type="blocking"
              title="Aptitude insuffisante"
              message="Le travailleur ne dispose pas de toutes les aptitudes requises pour le travail isolé. L'activité isolée est interdite."
              reference="SUVA 44094.F, chap. 4.2"
              zone={1}
            />
          )}
        </fieldset>

        {/* Section B: Gravity evaluation */}
        {aptitudeResult.allValid && (
          <fieldset className="space-y-3">
            <legend className="mb-1 flex items-center gap-2 text-base font-medium">
              Gravité maximale du dommage possible
              <HelpTooltip {...HELP_CONTENT.gravite} fieldId="gravite" />
            </legend>
            <p className="text-sm text-muted-foreground">
              Quelle est la gravité maximale du dommage que pourrait subir le
              travailleur isolé en cas d'événement ?
            </p>
            <div className="space-y-2">
              {GRAVITY_LEVELS.map((g) => (
                <label
                  key={g.level}
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <input
                    type="radio"
                    name="gravity"
                    value={g.level}
                    checked={gravity === g.level}
                    onChange={() => setGravity(g.level)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-suva-primary"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{g.description}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({g.label})
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* Section C: Probability evaluation */}
        {aptitudeResult.allValid && gravity && (
          <fieldset className="space-y-3">
            <legend className="mb-1 flex items-center gap-2 text-base font-medium">
              Probabilité de survenance
              <HelpTooltip
                {...HELP_CONTENT.probabilite}
                fieldId="probabilite"
              />
            </legend>
            <p className="text-sm text-muted-foreground">
              Quelle est la probabilité que cet événement dangereux survienne
              lors du travail isolé ?
            </p>
            <div className="space-y-2">
              {PROBABILITY_LEVELS.map((p) => (
                <label
                  key={p.level}
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <input
                    type="radio"
                    name="probability"
                    value={p.level}
                    checked={probability === p.level}
                    onChange={() => setProbability(p.level)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-suva-primary"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{p.description}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({p.label})
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* Section D: Risk matrix display */}
        {aptitudeResult.allValid && gravity && probability && level2Result && (
          <div className="space-y-4">
            <h3 className="text-base font-medium">Résultat de l'évaluation</h3>
            <RiskMatrix
              gravity={gravity}
              probability={probability}
              variant="full"
            />
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Zone de risque :</span>
              <ZoneBadge zone={level2Result.zone} variant="prominent" />
            </div>

            {/* Gate alerts based on zone */}
            {level2Result.zone === 1 && (
              <GateAlert
                type="blocking"
                title="Risque extrême — Zone 1"
                message="Le niveau de risque est trop élevé. Le travail isolé est strictement interdit pour cette activité."
                reference="SUVA 44094.F, matrice de risque"
                zone={1}
              />
            )}

            {level2Result.zone === 4 && (
              <GateAlert
                type="info"
                title="Autorisé sans restriction"
                message="Le risque est suffisamment faible pour autoriser le travail isolé avec des mesures organisationnelles standard. Vous pouvez passer directement au rapport."
                zone={4}
              />
            )}

            {(level2Result.zone === 2 ||
              level2Result.zone === "3a" ||
              level2Result.zone === "3b") && (
              <GateAlert
                type="warning"
                title="Mesures de surveillance requises"
                message="Des mesures de surveillance spécifiques sont nécessaires. Passez au niveau 3 pour les définir."
                zone={level2Result.zone}
              />
            )}
          </div>
        )}

        {/* Section E: Danger description */}
        {aptitudeResult.allValid && level2Result && !level2Result.blocked && (
          <fieldset className="space-y-4">
            <legend className="mb-1 flex items-center gap-2 text-base font-medium">
              Description du danger
              <HelpTooltip
                {...HELP_CONTENT.danger_description}
                fieldId="danger_description"
              />
            </legend>

            <div className="space-y-2">
              <Label htmlFor="danger-description">
                Décrivez le danger principal (150-300 caractères)
              </Label>
              <textarea
                id="danger-description"
                value={dangerDescription}
                onChange={(e) => setDangerDescription(e.target.value)}
                rows={3}
                maxLength={300}
                placeholder="Décrivez le danger principal lié au travail isolé pour cette activité..."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground">
                {dangerDescription.length}/300 caractères
                {dangerDescription.length > 0 &&
                  dangerDescription.length < 150 && (
                    <span className="ml-2 text-suva-error">
                      (minimum 150 caractères)
                    </span>
                  )}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="danger-category">
                Catégorie de danger
                <HelpTooltip
                  {...HELP_CONTENT.danger_category}
                  fieldId="danger_category"
                />
              </Label>
              <select
                id="danger-category"
                value={dangerCategory}
                onChange={(e) =>
                  setDangerCategory(e.target.value as DangerCategoryType)
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Sélectionnez une catégorie...</option>
                {DANGER_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {DANGER_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>
        )}

        {/* Navigation */}
        <WizardNavigation
          onNext={handleNext}
          onPrevious={handlePrevious}
          nextDisabled={isBlocked || !isFormComplete}
          nextLabel={
            level2Result?.nextAction === "report"
              ? "Voir le rapport"
              : "Suivant"
          }
        />
      </CardContent>
    </Card>
  );
}
