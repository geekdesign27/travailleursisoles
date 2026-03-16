import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAnalyses } from "@/features/persistence/localStorageService";

export function DashboardPage() {
  const analyses = listAnalyses();

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analyses travailleurs isolés</h1>
        <Link
          to="/analysis/new"
          className={buttonVariants({
            className: "bg-suva-primary text-white hover:bg-suva-primary-hover",
          })}
        >
          Nouvelle analyse
        </Link>
      </div>

      {analyses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucune analyse</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Créez votre première analyse pour commencer l'évaluation d'un
              poste de travailleur isolé selon la méthode SUVA 44094.F.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {analyses.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {entry.titre_activite}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {entry.status} — Mis à jour le{" "}
                  {new Date(entry.updatedAt).toLocaleDateString("fr-CH")}
                </span>
                <Link
                  to={`/analysis/${entry.id}`}
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Reprendre
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
