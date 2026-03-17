import { RiskMatrix } from "@/components/shared/RiskMatrix";
import { ZoneBadge } from "@/components/shared/ZoneBadge";
import { ZONE_DESCRIPTIONS } from "@/constants/suvaZones";
import type { Analysis } from "@/types/analysis.schema";
import type {
  GravityLevel,
  ProbabilityLevel,
  ZoneRisque,
} from "@/constants/suvaMatrix";
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

function MandatoryMeasure({
  icon,
  text,
  reference,
}: {
  icon: string;
  text: string;
  reference: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-red-200 bg-white p-3 dark:border-red-900 dark:bg-red-950/30">
      <span className="shrink-0 text-lg" aria-hidden="true">
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{text}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{reference}</p>
      </div>
      <span className="inline-flex shrink-0 items-center rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-300">
        Obligatoire
      </span>
    </div>
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

      {/* Risk Matrix Result */}
      {analysis.level2Result && (
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Résultat de la matrice de risque
          </h2>
          <div className="mt-4">
            <RiskMatrix
              gravity={analysis.level2Result.gravity as GravityLevel}
              probability={analysis.level2Result.probability as ProbabilityLevel}
            />
          </div>
          {effectiveZone && (
            <div className="mt-4 rounded-md border border-border/50 bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <ZoneBadge zone={effectiveZone as ZoneRisque} variant="prominent" />
                <p className="text-sm font-medium text-foreground">
                  {ZONE_DESCRIPTIONS[String(effectiveZone)]?.description}
                </p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium">Surveillance :</span>{" "}
                {ZONE_DESCRIPTIONS[String(effectiveZone)]?.surveillance}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Mandatory measures */}
      {effectiveZone && (
        <section className="rounded-lg border-2 border-red-300 bg-red-50/50 p-6 dark:border-red-800 dark:bg-red-950/20">
          <h2 className="text-lg font-semibold text-foreground">
            Mesures minimales obligatoires
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Mesures imposées par la norme SUVA 44094.F selon la zone de risque effective.
          </p>
          <div className="mt-4 space-y-3">
            {effectiveZone === 1 && (
              <>
                <MandatoryMeasure
                  icon="🚫"
                  text="Le travail isolé est strictement interdit pour cette activité."
                  reference="SUVA 44094.F ch. 3.1"
                />
                <MandatoryMeasure
                  icon="👥"
                  text="Présence obligatoire d'une deuxième personne sur le lieu de travail en permanence."
                  reference="SUVA 44094.F ch. 3.2"
                />
                <MandatoryMeasure
                  icon="⚠️"
                  text="Aucun dispositif technique (DATI, PTI) ne peut remplacer la présence physique d'une 2e personne."
                  reference="SUVA 44094.F ch. 3.2"
                />
              </>
            )}
            {effectiveZone === 2 && (
              <>
                <MandatoryMeasure
                  icon="👁️"
                  text="Surveillance directe obligatoire : contact visuel ou acoustique permanent avec le travailleur isolé."
                  reference="SUVA 44094.F ch. 5"
                />
                <MandatoryMeasure
                  icon="📞"
                  text="Moyen d'alerte fiable et testé permettant au travailleur de donner l'alarme à tout moment."
                  reference="SUVA 44094.F ch. 5"
                />
                <MandatoryMeasure
                  icon="🏥"
                  text="Concept d'urgence documenté : procédure d'alerte, premiers secours, accès secours."
                  reference="SUVA 44094.F ch. 6"
                />
              </>
            )}
            {effectiveZone === "3a" && (
              <>
                <MandatoryMeasure
                  icon="⏱️"
                  text="Contrôle périodique renforcé : vérification de l'état du travailleur toutes les 2 heures maximum."
                  reference="SUVA 44094.F ch. 5"
                />
                <MandatoryMeasure
                  icon="📞"
                  text="Moyen d'alerte fiable et testé (DATI, téléphone, radio) adapté à la charge cognitive."
                  reference="SUVA 44094.F ch. 5"
                />
                <MandatoryMeasure
                  icon="🏥"
                  text="Concept d'urgence documenté : procédure d'alerte, premiers secours, accès secours."
                  reference="SUVA 44094.F ch. 6"
                />
              </>
            )}
            {effectiveZone === "3b" && (
              <>
                <MandatoryMeasure
                  icon="⏱️"
                  text="Contrôle périodique standard : vérification de l'état du travailleur toutes les 4 heures maximum."
                  reference="SUVA 44094.F ch. 5"
                />
                <MandatoryMeasure
                  icon="📞"
                  text="Moyen d'alerte fiable et testé (DATI, téléphone, radio) adapté à la charge cognitive."
                  reference="SUVA 44094.F ch. 5"
                />
                <MandatoryMeasure
                  icon="🏥"
                  text="Concept d'urgence documenté : procédure d'alerte, premiers secours, accès secours."
                  reference="SUVA 44094.F ch. 6"
                />
              </>
            )}
            {effectiveZone === 4 && (
              <>
                <MandatoryMeasure
                  icon="✅"
                  text="Mesures organisationnelles standard : le travailleur doit pouvoir joindre un interlocuteur en cas de besoin."
                  reference="SUVA 44094.F ch. 5"
                />
                <MandatoryMeasure
                  icon="📋"
                  text="Information du personnel sur les procédures d'urgence de l'entreprise."
                  reference="SUVA 44094.F ch. 6"
                />
              </>
            )}

            {/* Additional mandatory measures from analysis */}
            {analysis.level1Result?.blocked && (
              <MandatoryMeasure
                icon="⛔"
                text="Travaux réglementés identifiés : le travail isolé est interdit indépendamment de la matrice de risque."
                reference="SUVA 44094.F ch. 3.1"
              />
            )}
            {analysis.level1Result?.isMinor && (
              <MandatoryMeasure
                icon="⛔"
                text="Personnel mineur (< 18 ans) : le travail isolé est interdit."
                reference="Ordonnance protection jeunes travailleurs"
              />
            )}
            {analysis.level3Result?.tmaxResult?.reclassificationNeeded && (
              <MandatoryMeasure
                icon="⬆️"
                text="Le temps de sauvetage dépasse le délai acceptable — la zone a été reclassée. Des mesures de surveillance renforcées s'appliquent."
                reference="SUVA 44094.F ch. 5.3"
              />
            )}
            {analysis.level4Result?.validationResult?.status === "incompatible" && (
              <MandatoryMeasure
                icon="🔧"
                text="L'outil d'alerte actuel est incompatible — remplacement ou mesures correctives obligatoires avant toute mission isolée."
                reference="SUVA 44094.F ch. 5"
              />
            )}
          </div>
        </section>
      )}

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
