import { Link } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  listAnalyses,
  loadAnalysis,
} from "@/features/persistence/localStorageService";
import { useAnalysisResume } from "@/features/persistence/useAnalysisResume";

const STATUS_LABELS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  draft: { label: "Brouillon", variant: "outline" },
  in_progress: { label: "En cours", variant: "default" },
  completed: { label: "Terminée", variant: "secondary" },
  archived: { label: "Archivée", variant: "secondary" },
};

export function DashboardPage() {
  const analyses = listAnalyses();
  const { resumable, resume, dismiss } = useAnalysisResume();

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analyses travailleurs isoles</h1>
        <Link
          to="/analysis/new"
          className={buttonVariants({
            className: "bg-suva-primary text-white hover:bg-suva-primary-hover",
          })}
        >
          Nouvelle analyse
        </Link>
      </div>

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
                Derniere modification le{" "}
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

      {analyses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <p className="mb-2 text-lg font-medium text-muted-foreground">
              Aucune analyse pour le moment
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              Creez votre premiere analyse pour commencer l&apos;evaluation
              d&apos;un poste de travailleur isole selon la methode SUVA
              44094.F.
            </p>
            <Link
              to="/analysis/new"
              className={buttonVariants({
                className:
                  "bg-suva-primary text-white hover:bg-suva-primary-hover",
              })}
            >
              Creer une analyse
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {analyses.map((entry) => {
            const statusConfig = STATUS_LABELS[entry.status] ?? {
              label: entry.status,
              variant: "outline" as const,
            };
            const zone = getZoneForEntry(entry.id);

            return (
              <Card key={entry.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">
                      {entry.titre_activite}
                    </CardTitle>
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.label}
                    </Badge>
                    {zone && (
                      <Badge variant="outline" className="text-xs">
                        Zone {zone}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Mis a jour le{" "}
                    {new Date(entry.updatedAt).toLocaleDateString("fr-CH")}
                  </span>
                  <Link
                    to={`/analysis/${entry.id}`}
                    className={buttonVariants({ variant: "secondary" })}
                  >
                    Ouvrir
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}

/**
 * Load full analysis to extract zone info for display.
 * Returns the zone string if level2Result exists, null otherwise.
 */
function getZoneForEntry(id: string): string | null {
  try {
    const analysis = loadAnalysis(id);
    if (analysis?.level2Result?.zone != null) {
      return String(analysis.level2Result.zone);
    }
    return null;
  } catch {
    return null;
  }
}
