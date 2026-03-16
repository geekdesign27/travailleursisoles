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
  calculateTmax,
  evaluateLevel3,
} from "@/features/engine/tmaxCalculator";
import { GateAlert } from "@/components/shared/GateAlert";
import { ZoneBadge } from "@/components/shared/ZoneBadge";
import { WizardNavigation } from "../WizardNavigation";
import {
  COUVERTURE_RESEAU,
  type CouvertureReseauType,
} from "@/types/analysis.schema";
import { cn } from "@/lib/utils";

const COUVERTURE_LABELS: Record<CouvertureReseauType, string> = {
  bonne: "Bonne",
  moyenne: "Moyenne",
  faible: "Faible",
  aucune: "Aucune",
};

interface NumberFieldProps {
  id: string;
  label: string;
  value: number | "";
  onChange: (val: number | "") => void;
  error?: string;
}

function NumberField({ id, label, value, onChange, error }: NumberFieldProps) {
  const [touched, setTouched] = useState(false);
  const showError = touched && error;

  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            onChange("");
          } else {
            const num = Number(raw);
            if (!isNaN(num)) onChange(num);
          }
        }}
        onBlur={() => setTouched(true)}
        className={cn(
          "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          showError ? "border-suva-error" : "border-input",
        )}
      />
      {showError && <p className="text-xs text-suva-error">{error}</p>}
    </div>
  );
}

export function Step04Level3Rescue() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useAnalysis();

  // Operational conditions state
  const [couvertureReseau, setCouvertureReseau] = useState<
    CouvertureReseauType | ""
  >("");
  const [equipementDATI, setEquipementDATI] = useState("");
  const [centraleAlarme, setCentraleAlarme] = useState<boolean | null>(null);
  const [delaiSecouristesJour, setDelaiSecouristesJour] = useState<number | "">(
    "",
  );
  const [delaiSecouristesNuit, setDelaiSecouristesNuit] = useState<number | "">(
    "",
  );
  const [delaiSecoursPublics, setDelaiSecoursPublics] = useState<number | "">(
    "",
  );
  const [delaiTypeBlessure, setDelaiTypeBlessure] = useState<number | "">("");
  const [tempsSauvetage, setTempsSauvetage] = useState<number | "">("");

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

  // Current zone from level 2 result
  const currentZone = state.current?.level2Result?.zone;

  // Validate number fields
  function validateNumber(val: number | ""): string | undefined {
    if (val === "") return "Ce champ est requis";
    if (val < 0) return "La valeur doit être >= 0";
    return undefined;
  }

  // Compute tmax when all number fields are filled
  const tmaxResult = useMemo(() => {
    if (
      typeof delaiTypeBlessure !== "number" ||
      typeof delaiSecouristesJour !== "number" ||
      typeof delaiSecoursPublics !== "number" ||
      typeof tempsSauvetage !== "number"
    ) {
      return null;
    }

    return calculateTmax({
      delaiTypeBlessure,
      tempsSecouristes: delaiSecouristesJour,
      tempsAmbulance: delaiSecoursPublics,
      tempsSauvetage,
    });
  }, [
    delaiTypeBlessure,
    delaiSecouristesJour,
    delaiSecoursPublics,
    tempsSauvetage,
  ]);

  // Level 3 decision
  const level3Decision = useMemo(() => {
    if (!tmaxResult || !currentZone) return null;
    return evaluateLevel3(tmaxResult.tmax, currentZone);
  }, [tmaxResult, currentZone]);

  // Form completeness check
  const isFormComplete =
    couvertureReseau !== "" &&
    centraleAlarme !== null &&
    typeof delaiSecouristesJour === "number" &&
    delaiSecouristesJour >= 0 &&
    typeof delaiSecouristesNuit === "number" &&
    delaiSecouristesNuit >= 0 &&
    typeof delaiSecoursPublics === "number" &&
    delaiSecoursPublics >= 0 &&
    typeof delaiTypeBlessure === "number" &&
    delaiTypeBlessure >= 0 &&
    typeof tempsSauvetage === "number" &&
    tempsSauvetage >= 0;

  const handlePrevious = useCallback(() => {
    navigate(`/analysis/${id}/level-2`);
  }, [navigate, id]);

  const handleNext = useCallback(() => {
    if (!state.current || !tmaxResult || !level3Decision || !isFormComplete)
      return;

    const finalTmaxResult = {
      tmax: tmaxResult.tmax,
      feasible: tmaxResult.feasible,
      reclassificationNeeded: level3Decision.reclassificationNeeded,
      ...(level3Decision.newZone !== undefined
        ? { newZone: level3Decision.newZone }
        : {}),
    };

    const updated = {
      ...state.current,
      currentStep: 4,
      currentLevel: 3,
      level3Result: {
        operationalConditions: {
          couvertureReseau: couvertureReseau as CouvertureReseauType,
          equipementDATI,
          centraleAlarme: centraleAlarme as boolean,
          delaiSecouristesJour: delaiSecouristesJour as number,
          delaiSecouristesNuit: delaiSecouristesNuit as number,
          delaiSecoursPublics: delaiSecoursPublics as number,
          delaiTypeBlessure: delaiTypeBlessure as number,
          tempsSauvetage: tempsSauvetage as number,
        },
        tmaxResult: finalTmaxResult,
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
      payload: { step: 4, level: 3 },
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (level3Decision.nextAction === "report") {
      navigate(`/analysis/${id}/report`);
    } else {
      navigate(`/analysis/${id}/level-4`);
    }
  }, [
    state.current,
    tmaxResult,
    level3Decision,
    isFormComplete,
    couvertureReseau,
    equipementDATI,
    centraleAlarme,
    delaiSecouristesJour,
    delaiSecouristesNuit,
    delaiSecoursPublics,
    delaiTypeBlessure,
    tempsSauvetage,
    id,
    navigate,
    dispatch,
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Niveau 3 — Faisabilité du sauvetage
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Évaluez les conditions opérationnelles et les délais de secours pour
          déterminer si le sauvetage est réalisable dans les temps.
        </p>
        {currentZone && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm font-medium">Zone actuelle :</span>
            <ZoneBadge zone={currentZone} variant="inline" />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Section A: Operational conditions */}
        <fieldset className="space-y-4">
          <legend className="mb-1 text-base font-medium">
            Conditions opérationnelles
          </legend>

          <div className="space-y-1">
            <Label htmlFor="couverture-reseau">Couverture réseau</Label>
            <select
              id="couverture-reseau"
              value={couvertureReseau}
              onChange={(e) =>
                setCouvertureReseau(e.target.value as CouvertureReseauType)
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Sélectionnez...</option>
              {COUVERTURE_RESEAU.map((val) => (
                <option key={val} value={val}>
                  {COUVERTURE_LABELS[val]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="equipement-dati">Équipement DATI</Label>
            <input
              id="equipement-dati"
              type="text"
              value={equipementDATI}
              onChange={(e) => setEquipementDATI(e.target.value)}
              maxLength={200}
              placeholder="Type d'équipement DATI utilisé..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Centrale d'alarme</legend>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="centrale-alarme"
                  checked={centraleAlarme === true}
                  onChange={() => setCentraleAlarme(true)}
                  className="h-4 w-4 cursor-pointer accent-suva-primary"
                />
                <span className="text-sm">Oui</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="centrale-alarme"
                  checked={centraleAlarme === false}
                  onChange={() => setCentraleAlarme(false)}
                  className="h-4 w-4 cursor-pointer accent-suva-primary"
                />
                <span className="text-sm">Non</span>
              </label>
            </div>
          </fieldset>
        </fieldset>

        {/* Section B: Rescue delays */}
        <fieldset className="space-y-4">
          <legend className="mb-1 text-base font-medium">
            Délais de secours (en minutes)
          </legend>
          <p className="text-sm text-muted-foreground">
            Indiquez les délais estimés pour chaque étape de la chaîne de
            secours.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="delai-secouristes-jour"
              label="Délai secouristes jour (min)"
              value={delaiSecouristesJour}
              onChange={setDelaiSecouristesJour}
              error={validateNumber(delaiSecouristesJour)}
            />
            <NumberField
              id="delai-secouristes-nuit"
              label="Délai secouristes nuit (min)"
              value={delaiSecouristesNuit}
              onChange={setDelaiSecouristesNuit}
              error={validateNumber(delaiSecouristesNuit)}
            />
            <NumberField
              id="delai-secours-publics"
              label="Délai secours publics (min)"
              value={delaiSecoursPublics}
              onChange={setDelaiSecoursPublics}
              error={validateNumber(delaiSecoursPublics)}
            />
            <NumberField
              id="delai-type-blessure"
              label="Délai type blessure (min)"
              value={delaiTypeBlessure}
              onChange={setDelaiTypeBlessure}
              error={validateNumber(delaiTypeBlessure)}
            />
            <NumberField
              id="temps-sauvetage"
              label="Temps sauvetage estimé (min)"
              value={tempsSauvetage}
              onChange={setTempsSauvetage}
              error={validateNumber(tempsSauvetage)}
            />
          </div>
        </fieldset>

        {/* Section C: t_max calculation display */}
        {tmaxResult && (
          <div className="space-y-4">
            <h3 className="text-base font-medium">
              Calcul du temps de sauvetage disponible (t_max)
            </h3>

            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-mono text-muted-foreground">
                t_max = {delaiTypeBlessure as number} -{" "}
                {delaiSecouristesJour as number} -{" "}
                {delaiSecoursPublics as number} - {tempsSauvetage as number}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Résultat :</span>
                <span
                  className={cn(
                    "rounded-md px-3 py-1 text-lg font-bold",
                    tmaxResult.tmax > 0
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                  )}
                >
                  t_max = {tmaxResult.tmax} min
                </span>
              </div>
            </div>

            {/* Gate alerts based on t_max result */}
            {tmaxResult.tmax > 0 && (
              <GateAlert
                type="info"
                title="Sauvetage réalisable"
                message={`Le temps disponible (${tmaxResult.tmax} min) est suffisant pour organiser le sauvetage. Passez au niveau 4 pour définir les mesures de surveillance.`}
              />
            )}

            {tmaxResult.tmax <= 0 &&
              currentZone &&
              (currentZone === "3a" || currentZone === "3b") && (
                <GateAlert
                  type="warning"
                  title="Sauvetage non réalisable — Reclassification"
                  message={`Le temps disponible est insuffisant (${tmaxResult.tmax} min). Selon la règle R4, la zone est reclassifiée de ${String(currentZone).toUpperCase()} vers Zone 2. Des mesures renforcées sont nécessaires.`}
                  reference="SUVA 44094.F, règle R4"
                  zone={2}
                />
              )}

            {tmaxResult.tmax <= 0 && currentZone === 2 && (
              <GateAlert
                type="warning"
                title="Sauvetage non réalisable — Zone 2 confirmée"
                message={`Le temps disponible est insuffisant (${tmaxResult.tmax} min). La classification Zone 2 est confirmée. Des mesures renforcées sont nécessaires.`}
                zone={2}
              />
            )}
          </div>
        )}

        {/* Navigation */}
        <WizardNavigation
          onNext={handleNext}
          onPrevious={handlePrevious}
          nextDisabled={!isFormComplete || !tmaxResult}
          nextLabel={
            level3Decision?.nextAction === "report"
              ? "Voir le rapport"
              : "Suivant"
          }
        />
      </CardContent>
    </Card>
  );
}
