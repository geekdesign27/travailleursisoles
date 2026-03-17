import { RiskMatrix } from "@/components/shared/RiskMatrix";
import { ZoneBadge } from "@/components/shared/ZoneBadge";
import type { Analysis } from "@/types/analysis.schema";
import type {
  GravityLevel,
  ProbabilityLevel,
  ZoneRisque,
} from "@/constants/suvaMatrix";
import { generateTechnicalSummary, getEffectiveZone } from "./reportGenerator";

interface TechnicalViewProps {
  analysis: Analysis;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/50 py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function TechnicalView({ analysis }: TechnicalViewProps) {
  const summary = generateTechnicalSummary(analysis);
  const effectiveZone = getEffectiveZone(analysis);

  return (
    <div className="space-y-8">
      {/* Risk Matrix */}
      {analysis.level2Result && (
        <Section title="Matrice de risque SUVA">
          <RiskMatrix
            gravity={analysis.level2Result.gravity as GravityLevel}
            probability={analysis.level2Result.probability as ProbabilityLevel}
          />
          {effectiveZone && (
            <div className="mt-4">
              <ZoneBadge
                zone={effectiveZone as ZoneRisque}
                variant="prominent"
              />
            </div>
          )}
        </Section>
      )}

      {/* Scores */}
      <Section title="Scores d'évaluation">
        <div className="space-y-0">
          {summary.gravity && (
            <DataRow
              label="Gravité"
              value={`${summary.gravity.level} — ${summary.gravity.label} (${summary.gravity.description})`}
            />
          )}
          {summary.probability && (
            <DataRow
              label="Probabilité"
              value={`${summary.probability.level} — ${summary.probability.label} (${summary.probability.description})`}
            />
          )}
          {summary.zone && (
            <DataRow
              label="Zone de risque"
              value={`${summary.zone.label} — ${summary.zone.description}`}
            />
          )}
        </div>
      </Section>

      {/* t_max */}
      {summary.tmax && (
        <Section title="Calcul t_max (temps de sauvetage)">
          <div className="space-y-0">
            <DataRow label="t_max" value={`${summary.tmax.value} min`} />
            <DataRow
              label="Sauvetage réalisable"
              value={summary.tmax.feasible ? "Oui" : "Non"}
            />
            {summary.tmax.reclassificationNeeded && (
              <DataRow
                label="Reclassement"
                value={`Zone reclassée en Zone ${summary.tmax.newZone ?? "2"}`}
              />
            )}
          </div>
          {summary.operationalConditions && (
            <div className="mt-4 space-y-0 border-t border-border pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Conditions opérationnelles
              </p>
              <DataRow
                label="Couverture réseau"
                value={summary.operationalConditions.couvertureReseau}
              />
              {summary.operationalConditions.equipementDATI && (
                <DataRow
                  label="Équipement DATI"
                  value={summary.operationalConditions.equipementDATI}
                />
              )}
              <DataRow
                label="Centrale d'alarme"
                value={
                  summary.operationalConditions.centraleAlarme ? "Oui" : "Non"
                }
              />
              <DataRow
                label="Délai secouristes (jour)"
                value={`${summary.operationalConditions.delaiSecouristesJour} min`}
              />
              <DataRow
                label="Délai secouristes (nuit)"
                value={`${summary.operationalConditions.delaiSecouristesNuit} min`}
              />
              <DataRow
                label="Ambulance / secours publics (144 / REGA)"
                value={`${summary.operationalConditions.delaiAmbulance} min`}
              />
              <DataRow
                label="Accès au blessé / sauvetage technique"
                value={`${summary.operationalConditions.tempsSauvetage} min`}
              />
            </div>
          )}
        </Section>
      )}

      {/* Cognitive load */}
      {summary.cognitiveLoad && (
        <Section title="Charge cognitive">
          <DataRow
            label="Niveau"
            value={`${summary.cognitiveLoad.level} — ${summary.cognitiveLoad.label}`}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {summary.cognitiveLoad.description}
          </p>
        </Section>
      )}

      {/* Alert validation */}
      {summary.alertValidation && (
        <Section title="Validation outil d'alerte">
          <DataRow
            label="Statut"
            value={formatAlertStatus(summary.alertValidation.status)}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {summary.alertValidation.reason}
          </p>
          {summary.alertValidation.measures.length > 0 && (
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
              {summary.alertValidation.measures.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {/* Regulated work */}
      {summary.regulatedWorkCategories.length > 0 && (
        <Section title="Travaux réglementés identifiés">
          <ul className="list-inside list-disc space-y-1 text-sm">
            {summary.regulatedWorkCategories.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* Applied SUVA rules */}
      {summary.appliedRules.length > 0 && (
        <Section title="Règles SUVA applicables">
          <div className="space-y-3">
            {summary.appliedRules.map((rule) => (
              <div
                key={rule.code}
                className="rounded-md border border-border/50 bg-muted/30 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-bold text-primary">
                    {rule.code}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {rule.reference}
                  </span>
                </div>
                <p className="mt-1 text-sm">{rule.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Danger description */}
      {analysis.level2Result?.dangerDescription && (
        <Section title="Description du danger">
          <p className="text-sm">{analysis.level2Result.dangerDescription}</p>
          {analysis.level2Result.dangerCategory && (
            <p className="mt-2 text-xs text-muted-foreground">
              Catégorie : {analysis.level2Result.dangerCategory}
            </p>
          )}
        </Section>
      )}
    </div>
  );
}

function formatAlertStatus(status: string): string {
  switch (status) {
    case "compatible":
      return "Compatible";
    case "incompatible":
      return "Incompatible";
    case "with_reserves":
      return "Compatible avec réserves";
    default:
      return status;
  }
}
