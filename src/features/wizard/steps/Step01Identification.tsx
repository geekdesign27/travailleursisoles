import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { saveAnalysis } from "@/features/persistence/localStorageService";
import {
  AnalysisIdentificationSchema,
  PERIODES_TRAVAIL,
  FREQUENCES_ACTIVITE,
  type AnalysisIdentificationInput,
  type AnalysisIdentification,
  type Analysis,
} from "@/types/analysis.schema";
import { WizardNavigation } from "../WizardNavigation";

const PERIODE_LABELS: Record<string, string> = {
  jour: "Jour",
  nuit: "Nuit",
  weekend: "Week-end",
  jour_ferie: "Jour férié",
  piquet: "Piquet",
};

const FREQUENCE_LABELS: Record<string, string> = {
  quotidienne: "Quotidienne",
  hebdomadaire: "Hebdomadaire",
  mensuelle: "Mensuelle",
  occasionnelle: "Occasionnelle",
  exceptionnelle: "Exceptionnelle",
};

export function Step01Identification() {
  const navigate = useNavigate();
  const { dispatch } = useAnalysis();

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<AnalysisIdentificationInput>({
    resolver: zodResolver(AnalysisIdentificationSchema),
    mode: "onBlur",
    defaultValues: {
      entreprise: "",
      departement: "",
      responsable: "",
      titre_activite: "",
      description: "",
      nombre_personnes: 1,
      periode_travail: "jour",
      frequence_activite: "quotidienne",
    },
  });

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (data: AnalysisIdentificationInput) => {
    if (submitting) return;
    setSubmitting(true);

    const parsed = AnalysisIdentificationSchema.parse(
      data,
    ) as AnalysisIdentification;
    const now = new Date().toISOString();
    const analysis: Analysis = {
      ...parsed,
      id: crypto.randomUUID(),
      status: "draft",
      currentStep: 1,
      currentLevel: 0,
      createdAt: now,
      updatedAt: now,
    };

    const result = saveAnalysis(analysis);
    if (!result.ok) {
      toast.error(result.error);
      setSubmitting(false);
      return;
    }

    dispatch({ type: "analysis/CREATE", payload: analysis });
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/analysis/${analysis.id}/level-1`);
  };

  const handleNext = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Identification de l'analyse
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Identifiez le poste de travail et la période d'activité isolée à
          analyser.
        </p>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          role="form"
          aria-label="Identification de l'analyse"
          noValidate
        >
          {/* Entreprise */}
          <div className="space-y-2">
            <Label htmlFor="entreprise">Entreprise *</Label>
            <Input
              id="entreprise"
              {...register("entreprise")}
              aria-invalid={!!errors.entreprise}
              aria-describedby={
                errors.entreprise ? "entreprise-error" : undefined
              }
              className="min-h-[44px]"
            />
            {errors.entreprise && (
              <p id="entreprise-error" className="text-sm text-suva-error">
                {errors.entreprise.message}
              </p>
            )}
          </div>

          {/* Département */}
          <div className="space-y-2">
            <Label htmlFor="departement">Département</Label>
            <Input
              id="departement"
              {...register("departement")}
              className="min-h-[44px]"
            />
          </div>

          {/* Responsable */}
          <div className="space-y-2">
            <Label htmlFor="responsable">Responsable *</Label>
            <Input
              id="responsable"
              {...register("responsable")}
              aria-invalid={!!errors.responsable}
              aria-describedby={
                errors.responsable ? "responsable-error" : undefined
              }
              className="min-h-[44px]"
            />
            {errors.responsable && (
              <p id="responsable-error" className="text-sm text-suva-error">
                {errors.responsable.message}
              </p>
            )}
          </div>

          {/* Titre activité */}
          <div className="space-y-2">
            <Label htmlFor="titre_activite">Titre de l'activité *</Label>
            <Input
              id="titre_activite"
              {...register("titre_activite")}
              aria-invalid={!!errors.titre_activite}
              aria-describedby={
                errors.titre_activite ? "titre-error" : undefined
              }
              className="min-h-[44px]"
            />
            {errors.titre_activite && (
              <p id="titre-error" className="text-sm text-suva-error">
                {errors.titre_activite.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register("description")}
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Nombre de personnes */}
          <div className="space-y-2">
            <Label htmlFor="nombre_personnes">
              Nombre de personnes concernées *
            </Label>
            <Input
              id="nombre_personnes"
              type="number"
              min={1}
              {...register("nombre_personnes", { valueAsNumber: true })}
              aria-invalid={!!errors.nombre_personnes}
              aria-describedby={
                errors.nombre_personnes ? "personnes-error" : undefined
              }
              className="min-h-[44px] w-32"
            />
            {errors.nombre_personnes && (
              <p id="personnes-error" className="text-sm text-suva-error">
                {errors.nombre_personnes.message}
              </p>
            )}
          </div>

          {/* Période de travail */}
          <div className="space-y-2">
            <Label htmlFor="periode_travail">Période de travail *</Label>
            <Select
              defaultValue="jour"
              onValueChange={(value) => {
                setValue(
                  "periode_travail",
                  value as AnalysisIdentificationInput["periode_travail"],
                );
                trigger("periode_travail");
              }}
            >
              <SelectTrigger id="periode_travail" className="min-h-[44px]">
                <SelectValue placeholder="Sélectionner une période" />
              </SelectTrigger>
              <SelectContent>
                {PERIODES_TRAVAIL.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PERIODE_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.periode_travail && (
              <p className="text-sm text-suva-error">
                {errors.periode_travail.message}
              </p>
            )}
          </div>

          {/* Fréquence d'activité */}
          <div className="space-y-2">
            <Label htmlFor="frequence_activite">
              Fréquence d'activité isolée *
            </Label>
            <Select
              defaultValue="quotidienne"
              onValueChange={(value) => {
                setValue(
                  "frequence_activite",
                  value as AnalysisIdentificationInput["frequence_activite"],
                );
                trigger("frequence_activite");
              }}
            >
              <SelectTrigger id="frequence_activite" className="min-h-[44px]">
                <SelectValue placeholder="Sélectionner une fréquence" />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCES_ACTIVITE.map((f) => (
                  <SelectItem key={f} value={f}>
                    {FREQUENCE_LABELS[f]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.frequence_activite && (
              <p className="text-sm text-suva-error">
                {errors.frequence_activite.message}
              </p>
            )}
          </div>

          {/* Navigation is outside form submit, uses handleNext */}
        </form>

        <WizardNavigation
          onNext={handleNext}
          isFirstStep={true}
          isSubmitting={submitting}
        />
      </CardContent>
    </Card>
  );
}
