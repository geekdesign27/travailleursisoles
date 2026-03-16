import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAnalysis } from "@/contexts/AnalysisContext";
import {
  saveAnalysis,
  loadAnalysis,
} from "@/features/persistence/localStorageService";
import { WizardNavigation } from "../WizardNavigation";
import type { EmergencyConcept, TrainingDoc } from "@/types/analysis.schema";

export function Step06Documentation() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useAnalysis();

  const [emergencyConcept, setEmergencyConcept] = useState<EmergencyConcept>({
    alerte: "",
    premierSecours: "",
    formation: "",
    accesSecours: "",
  });

  const [trainingDoc, setTrainingDoc] = useState<TrainingDoc>({
    dateFormation: "",
    formateur: "",
    documentation: "",
    dateRevision: "",
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

  // Restore saved documentation if navigating back
  useEffect(() => {
    if (state.current?.documentation) {
      const doc = state.current.documentation;
      setEmergencyConcept(doc.emergencyConcept);
      setTrainingDoc(doc.trainingDoc);
    }
  }, [state.current?.documentation]);

  const updateEmergency = useCallback(
    (field: keyof EmergencyConcept, value: string) => {
      setEmergencyConcept((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const updateTraining = useCallback(
    (field: keyof TrainingDoc, value: string) => {
      setTrainingDoc((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handlePrevious = useCallback(() => {
    navigate(`/analysis/${id}/level-4`);
  }, [navigate, id]);

  const handleNext = useCallback(() => {
    if (!state.current) return;

    const updated = {
      ...state.current,
      currentStep: 6,
      currentLevel: 4,
      documentation: {
        emergencyConcept,
        trainingDoc,
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
      payload: { step: 6, level: 4 },
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/analysis/${id}/finalisation`);
  }, [state.current, emergencyConcept, trainingDoc, id, navigate, dispatch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Documentation et concept d'urgence
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Documentez le concept d'urgence SUVA et les informations de formation
          pour cette analyse.
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Section A: Emergency concept */}
        <fieldset className="space-y-4">
          <legend className="mb-1 text-base font-medium">
            Concept d'urgence (4 composantes SUVA)
          </legend>

          <div className="space-y-2">
            <Label htmlFor="ec-alerte">Alerte</Label>
            <p className="text-xs text-muted-foreground">
              Comment l'alerte est-elle déclenchée en cas d'urgence ?
            </p>
            <textarea
              id="ec-alerte"
              value={emergencyConcept.alerte}
              onChange={(e) => updateEmergency("alerte", e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Ex: DATI avec détection de perte de verticalité, appel automatique..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ec-premiers-secours">Premiers secours</Label>
            <p className="text-xs text-muted-foreground">
              Quelles mesures de premiers secours sont prévues sur le lieu de
              travail ?
            </p>
            <textarea
              id="ec-premiers-secours"
              value={emergencyConcept.premierSecours}
              onChange={(e) =>
                updateEmergency("premierSecours", e.target.value)
              }
              maxLength={1000}
              rows={3}
              placeholder="Ex: Trousse de premiers secours, défibrillateur, secouriste désigné..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ec-formation">Formation</Label>
            <p className="text-xs text-muted-foreground">
              Quelles formations sont dispensées aux travailleurs isolés ?
            </p>
            <textarea
              id="ec-formation"
              value={emergencyConcept.formation}
              onChange={(e) => updateEmergency("formation", e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Ex: Formation premiers secours, utilisation du DATI, procédure d'alerte..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ec-acces-secours">Accès des secours</Label>
            <p className="text-xs text-muted-foreground">
              Comment les secours accèdent-ils au lieu de travail isolé ?
            </p>
            <textarea
              id="ec-acces-secours"
              value={emergencyConcept.accesSecours}
              onChange={(e) => updateEmergency("accesSecours", e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Ex: Accès véhicule possible, héliportage nécessaire, clé pompiers..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </fieldset>

        {/* Section B: Training documentation */}
        <fieldset className="space-y-4">
          <legend className="mb-1 text-base font-medium">
            Documentation de la formation
          </legend>

          <div className="space-y-2">
            <Label htmlFor="td-date-formation">Date de formation</Label>
            <Input
              id="td-date-formation"
              type="date"
              value={trainingDoc.dateFormation}
              onChange={(e) => updateTraining("dateFormation", e.target.value)}
              className="min-h-[44px] w-48"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="td-formateur">Formateur</Label>
            <Input
              id="td-formateur"
              type="text"
              value={trainingDoc.formateur}
              onChange={(e) => updateTraining("formateur", e.target.value)}
              maxLength={200}
              placeholder="Nom du formateur"
              className="min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="td-documentation">Documentation</Label>
            <p className="text-xs text-muted-foreground">
              Référence au document de formation (ex: numéro de document, lien)
            </p>
            <Input
              id="td-documentation"
              type="text"
              value={trainingDoc.documentation}
              onChange={(e) => updateTraining("documentation", e.target.value)}
              maxLength={500}
              placeholder="Référence de la documentation de formation"
              className="min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="td-date-revision">Date de révision prévue</Label>
            <Input
              id="td-date-revision"
              type="date"
              value={trainingDoc.dateRevision}
              onChange={(e) => updateTraining("dateRevision", e.target.value)}
              className="min-h-[44px] w-48"
            />
          </div>
        </fieldset>

        {/* Navigation */}
        <WizardNavigation
          onNext={handleNext}
          onPrevious={handlePrevious}
          nextLabel="Suivant"
        />
      </CardContent>
    </Card>
  );
}
