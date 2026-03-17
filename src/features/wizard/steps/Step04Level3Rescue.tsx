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
import { HelpTooltip } from "@/components/shared/HelpTooltip";
import { HELP_CONTENT } from "@/constants/helpContent";
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
  description?: string;
  value: number | "";
  onChange: (val: number | "") => void;
  error?: string;
}

function NumberField({
  id,
  label,
  description,
  value,
  onChange,
  error,
}: NumberFieldProps) {
  const [touched, setTouched] = useState(false);
  const showError = touched && error;

  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
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
  const [delaiSecouristesJour, setDelaiSecouristesJour] = useState<
    number | ""
  >("");
  const [delaiSecouristesNuit, setDelaiSecouristesNuit] = useState<
    number | ""
  >("");
  const [delaiAmbulance, setDelaiAmbulance] = useState<number | "">("");
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

  // Restore local state from saved data
  useEffect(() => {
    if (state.current?.level3Result) {
      const r = state.current.level3Result;
      const oc = r.operationalConditions;
      setCouvertureReseau(oc.couvertureReseau);
      setEquipementDATI(oc.equipementDATI);
      setCentraleAlarme(oc.centraleAlarme);
      setDelaiSecouristesJour(oc.delaiSecouristesJour);
      setDelaiSecouristesNuit(oc.delaiSecouristesNuit);
      setDelaiAmbulance(oc.delaiAmbulance);
      setTempsSauvetage(oc.tempsSauvetage);
    }
  }, [state.current?.level3Result]);

  // Current zone and gravity from level 2 result
  const currentZone = state.current?.level2Result?.zone;
  const currentGravity = state.current?.level2Result?.gravity;

  // Validate number fields
  function validateNumber(val: number | ""): string | undefined {
    if (val === "") return "Ce champ est requis";
    if (val < 0) return "La valeur doit être >= 0";
    return undefined;
  }

  // Compute tmax when all required fields are filled
  const tmaxResult = useMemo(() => {
    if (
      typeof delaiSecouristesJour !== "number" ||
      typeof delaiAmbulance !== "number" ||
      typeof tempsSauvetage !== "number" ||
      !currentZone ||
      !currentGravity
    ) {
      return null;
    }

    return calculateTmax({
      tempsSecouristes: delaiSecouristesJour,
      tempsAmbulance: delaiAmbulance,
      tempsSauvetage,
      zone: currentZone,
      gravite: currentGravity,
    });
  }, [
    delaiSecouristesJour,
    delaiAmbulance,
    tempsSauvetage,
    currentZone,
    currentGravity,
  ]);

  // Level 3 decision
  const level3Decision = useMemo(() => {
    if (!tmaxResult || !currentZone) return null;
    return evaluateLevel3(
      tmaxResult.tmax,
      currentZone,
      currentGravity,
      typeof delaiSecouristesJour === "number"
        ? delaiSecouristesJour
        : undefined,
      typeof tempsSauvetage === "number" ? tempsSauvetage : undefined,
    );
  }, [
    tmaxResult,
    currentZone,
    currentGravity,
    delaiSecouristesJour,
    tempsSauvetage,
  ]);

  // Form completeness — the button "Suivant" should NEVER be blocked by a negative t_max
  const isFormComplete =
    couvertureReseau !== "" &&
    centraleAlarme !== null &&
    typeof delaiSecouristesJour === "number" &&
    delaiSecouristesJour >= 0 &&
    typeof delaiAmbulance === "number" &&
    delaiAmbulance >= 0 &&
    typeof tempsSauvetage === "number" &&
    tempsSauvetage >= 0;

  const handlePrevious = useCallback(() => {
    navigate(`/analysis/${id}/level-2`);
  }, [navigate, id]);

  const handleNext = useCallback(() => {
    if (!state.current || !isFormComplete) return;

    const finalTmaxResult = tmaxResult
      ? {
          tmax: tmaxResult.tmax,
          feasible: tmaxResult.feasible,
          reclassificationNeeded:
            level3Decision?.reclassificationNeeded ?? false,
          ...(level3Decision?.newZone !== undefined
            ? { newZone: level3Decision.newZone }
            : {}),
        }
      : { tmax: 0, feasible: false, reclassificationNeeded: false };

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
          delaiSecouristesNuit:
            typeof delaiSecouristesNuit === "number"
              ? delaiSecouristesNuit
              : 0,
          delaiAmbulance: delaiAmbulance as number,
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

    if (level3Decision?.nextAction === "report") {
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
    delaiAmbulance,
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
            <Label htmlFor="couverture-reseau">
              Couverture réseau
              <HelpTooltip
                {...HELP_CONTENT.couverture_reseau}
                fieldId="couverture_reseau"
              />
            </Label>
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
            <Label htmlFor="equipement-dati">
              Équipement DATI
              <HelpTooltip
                {...HELP_CONTENT.equipement_dati}
                fieldId="equipement_dati"
              />
            </Label>
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
            <legend className="flex items-center gap-2 text-sm font-medium">
              Centrale d'alarme
              <HelpTooltip
                {...HELP_CONTENT.centrale_alarme}
                fieldId="centrale_alarme"
              />
            </legend>
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
          <legend className="mb-1 flex items-center gap-2 text-base font-medium">
            Délais de la chaîne de secours (en minutes)
            <HelpTooltip
              {...HELP_CONTENT.delai_secouristes}
              fieldId="delai_secouristes"
            />
          </legend>
          <p className="text-sm text-muted-foreground">
            Indiquez le temps estimé pour chaque maillon de la chaîne de
            secours.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="delai-secouristes-jour"
              label="Secouriste interne — jour (min)"
              description="Temps pour qu'un collègue formé aux premiers secours arrive sur place"
              value={delaiSecouristesJour}
              onChange={setDelaiSecouristesJour}
              error={validateNumber(delaiSecouristesJour)}
            />
            <NumberField
              id="delai-secouristes-nuit"
              label="Secouriste interne — nuit/weekend (min)"
              description="Idem de nuit ou le weekend (souvent plus long, moins de personnel)"
              value={delaiSecouristesNuit}
              onChange={setDelaiSecouristesNuit}
            />
            <NumberField
              id="delai-ambulance"
              label="Ambulance / secours publics 144 / REGA (min)"
              description="Temps pour que les secours professionnels arrivent sur le lieu de travail"
              value={delaiAmbulance}
              onChange={setDelaiAmbulance}
              error={validateNumber(delaiAmbulance)}
            />
            <NumberField
              id="temps-sauvetage"
              label="Accès au blessé / sauvetage technique (min)"
              description="Temps supplémentaire lié aux obstacles d'accès (hauteur, espace confiné...). 0 si accès direct."
              value={tempsSauvetage}
              onChange={setTempsSauvetage}
              error={validateNumber(tempsSauvetage)}
            />
          </div>

          <p className="text-xs text-muted-foreground italic">
            En cas de doute sur le délai ambulance, appelez le 144 avec
            l'adresse exacte du site pour obtenir une estimation.
          </p>
        </fieldset>

        {/* Section C: t_max calculation display */}
        {tmaxResult && (
          <div className="space-y-4">
            <h3 className="text-base font-medium">
              Calcul du temps de sauvetage disponible (t_max)
            </h3>

            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-mono text-muted-foreground">
                t_max = {tmaxResult.base} (base{" "}
                {currentZone === "3a" ? "Zone 3a" : "Zone 3b"}) −{" "}
                {delaiSecouristesJour as number} (secouriste) −{" "}
                {delaiAmbulance as number} (ambulance) −{" "}
                {tempsSauvetage as number} (sauvetage)
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Résultat :</span>
                <span
                  className={cn(
                    "rounded-md px-3 py-1 text-lg font-bold",
                    tmaxResult.tmax > 30
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : tmaxResult.tmax > 0
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                  )}
                >
                  t_max = {tmaxResult.tmax} min
                </span>
              </div>
              {tmaxResult.tmax > 30 && (
                <p className="text-xs text-muted-foreground">
                  Intervalle de surveillance recommandé :{" "}
                  {tmaxResult.intervalle} min (t_max − 15 min de marge)
                </p>
              )}
            </div>

            {/* Gate alerts based on t_max result */}
            {level3Decision && level3Decision.feasible && (
              <GateAlert
                type="info"
                title="Sauvetage réalisable"
                message={`Le temps disponible (${tmaxResult.tmax} min) est suffisant. Intervalle de surveillance recommandé : ${tmaxResult.intervalle} min. Passez au niveau 4.`}
              />
            )}

            {level3Decision && !level3Decision.feasible && (
              <GateAlert
                type="warning"
                title={
                  level3Decision.reclassificationNeeded
                    ? "Sauvetage non réalisable — Reclassification"
                    : "Sauvetage non réalisable"
                }
                message={
                  level3Decision.message ??
                  `Le temps disponible est insuffisant (${tmaxResult.tmax} min).`
                }
                reference="SUVA 44094.F ch. 7.3"
                zone={level3Decision.newZone}
              />
            )}
          </div>
        )}

        {/* Navigation — NEVER blocked by negative t_max */}
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
