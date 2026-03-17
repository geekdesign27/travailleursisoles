import { ZoneBadge } from "@/components/shared/ZoneBadge";
import type { Analysis } from "@/types/analysis.schema";
import type { ZoneRisque } from "@/constants/suvaMatrix";
import {
  getManagementDecision,
  generateManagementActions,
  getEffectiveZone,
  formatPeriode,
} from "./reportGenerator";

interface ManagementViewProps {
  analysis: Analysis;
}

function ActionBadge({ type }: { type: "exigence" | "recommandation" }) {
  if (type === "exigence") {
    return (
      <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-300">
        Exigence
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
      Recommandation
    </span>
  );
}

export function ManagementView({ analysis }: ManagementViewProps) {
  const decision = getManagementDecision(analysis);
  const actions = generateManagementActions(analysis);
  const effectiveZone = getEffectiveZone(analysis);

  return (
    <div className="space-y-8">
      {/* Decision */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Décision</h2>
        <p className="mt-3 text-2xl font-bold">{decision}</p>
        {effectiveZone && (
          <div className="mt-4">
            <ZoneBadge zone={effectiveZone as ZoneRisque} variant="prominent" />
          </div>
        )}
      </section>

      {/* Context */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Contexte</h2>
        <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Activité</dt>
            <dd className="font-medium">{analysis.titre_activite}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Personnes concernées</dt>
            <dd className="font-medium">{analysis.nombre_personnes}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Période de travail</dt>
            <dd className="font-medium">
              {formatPeriode(analysis.periode_travail)}
            </dd>
          </div>
          {analysis.description && (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Description</dt>
              <dd className="font-medium">{analysis.description}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Action items */}
      {actions.length > 0 && (
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Plan d&apos;actions
          </h2>
          <ol className="mt-4 space-y-3">
            {actions.map((action) => (
              <li
                key={action.number}
                className="flex items-start gap-3 rounded-md border border-border/50 bg-muted/30 p-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {action.number}
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <ActionBadge type={action.type} />
                    {action.reference && (
                      <span className="text-xs text-muted-foreground">
                        {action.reference}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground">{action.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Emergency concept summary */}
      {analysis.documentation?.emergencyConcept && (
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Concept d&apos;urgence
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            {analysis.documentation.emergencyConcept.alerte && (
              <div>
                <dt className="font-medium text-muted-foreground">
                  Procédure d&apos;alerte
                </dt>
                <dd>{analysis.documentation.emergencyConcept.alerte}</dd>
              </div>
            )}
            {analysis.documentation.emergencyConcept.premierSecours && (
              <div>
                <dt className="font-medium text-muted-foreground">
                  Premiers secours
                </dt>
                <dd>
                  {analysis.documentation.emergencyConcept.premierSecours}
                </dd>
              </div>
            )}
            {analysis.documentation.emergencyConcept.formation && (
              <div>
                <dt className="font-medium text-muted-foreground">Formation</dt>
                <dd>{analysis.documentation.emergencyConcept.formation}</dd>
              </div>
            )}
            {analysis.documentation.emergencyConcept.accesSecours && (
              <div>
                <dt className="font-medium text-muted-foreground">
                  Accès secours
                </dt>
                <dd>{analysis.documentation.emergencyConcept.accesSecours}</dd>
              </div>
            )}
          </dl>
        </section>
      )}
    </div>
  );
}
