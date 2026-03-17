import { useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ZoneBadge } from "@/components/shared/ZoneBadge";
import { ArrowLeft } from "lucide-react";
import type { ZoneRisque } from "@/constants/suvaMatrix";
import { loadAnalysis } from "@/features/persistence/localStorageService";
import { getEffectiveZone, formatPeriode } from "./reportGenerator";
import { ManagementView } from "./ManagementView";
import { TechnicalView } from "./TechnicalView";
import { ExportPdfButton } from "./ExportPdfButton";
import { ExportCsvButton } from "./ExportCsvButton";

export function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);

  if (!id) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-8">
        <p className="text-destructive">Identifiant d&apos;analyse manquant.</p>
      </main>
    );
  }

  const analysis = loadAnalysis(id);

  if (!analysis) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-8">
        <p className="text-destructive">
          Analyse introuvable. Elle a peut-être été supprimée.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft />
          Retour au tableau de bord
        </Button>
      </main>
    );
  }

  const effectiveZone = getEffectiveZone(analysis);

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => navigate(`/analysis/${id}/finalisation`)}
          >
            <ArrowLeft />
            Retour à l&apos;analyse
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {analysis.titre_activite}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {analysis.entreprise}
            {analysis.departement ? ` — ${analysis.departement}` : ""}
            {" · "}
            {formatPeriode(analysis.periode_travail)}
          </p>
          {effectiveZone && (
            <div className="mt-2">
              <ZoneBadge
                zone={effectiveZone as ZoneRisque}
                variant="prominent"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <ExportPdfButton analysis={analysis} reportRef={reportRef} />
          <ExportCsvButton analysis={analysis} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="management">
        <TabsList>
          <TabsTrigger value="management">Vue Management</TabsTrigger>
          <TabsTrigger value="technical">Vue Technique</TabsTrigger>
        </TabsList>

        <div ref={reportRef}>
          <TabsContent value="management" className="mt-6">
            <ManagementView analysis={analysis} />
          </TabsContent>

          <TabsContent value="technical" className="mt-6">
            <TechnicalView analysis={analysis} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Footer */}
      <footer className="mt-12 border-t border-border pt-4 text-center text-xs text-muted-foreground">
        Référence : SUVA 44094.F — Édition mai 2025
      </footer>
    </main>
  );
}
