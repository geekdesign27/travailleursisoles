import { RegulatoryLock } from "@/components/shared/RegulatoryLock";
import {
  SUVA_MATRIX,
  type GravityLevel,
  type ProbabilityLevel,
  type ZoneRisque,
} from "@/constants/suvaMatrix";
import { SUVA_RULES } from "@/constants/suvaRules";
import { REGULATED_WORK_CATEGORIES } from "@/constants/regulatedWork";

const GRAVITY_LEVELS: GravityLevel[] = ["I", "II", "III", "IV", "V"];
const PROBABILITY_LEVELS: ProbabilityLevel[] = ["A", "B", "C", "D", "E"];

const GRAVITY_LABELS: Record<GravityLevel, string> = {
  I: "I — Légère",
  II: "II — Moyenne",
  III: "III — Grave",
  IV: "IV — Très grave",
  V: "V — Mortelle",
};

const PROBABILITY_LABELS: Record<ProbabilityLevel, string> = {
  A: "A — Très rare",
  B: "B — Rare",
  C: "C — Occasionnel",
  D: "D — Fréquent",
  E: "E — Très fréquent",
};

function zoneBgClass(zone: ZoneRisque): string {
  switch (zone) {
    case 1:
      return "bg-suva-error/20 text-suva-error font-bold";
    case 2:
      return "bg-orange-500/20 text-orange-700 dark:text-orange-400 font-semibold";
    case "3a":
      return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
    case "3b":
      return "bg-suva-success/20 text-suva-success";
    case 4:
      return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
  }
}

function LockedSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 opacity-80" aria-disabled="true">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <RegulatoryLock type="suva_const" variant="inline" />
      </div>
      {children}
    </div>
  );
}

function MatrixDisplay() {
  return (
    <LockedSection title="Matrice de risque SUVA 5×5">
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse text-xs"
          aria-label="Matrice SUVA 5×5 — Gravité × Probabilité → Zone"
        >
          <thead>
            <tr>
              <th className="border border-border p-2 text-left text-muted-foreground">
                Gravité \ Prob.
              </th>
              {PROBABILITY_LEVELS.map((p) => (
                <th
                  key={p}
                  className="border border-border p-2 text-center text-muted-foreground"
                  title={PROBABILITY_LABELS[p]}
                >
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GRAVITY_LEVELS.map((g) => (
              <tr key={g}>
                <td
                  className="border border-border p-2 text-muted-foreground"
                  title={GRAVITY_LABELS[g]}
                >
                  {g}
                </td>
                {PROBABILITY_LEVELS.map((p) => {
                  const zone = SUVA_MATRIX[g][p];
                  return (
                    <td
                      key={p}
                      className={`border border-border p-2 text-center ${zoneBgClass(zone)}`}
                    >
                      {zone}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Zone 1 = Travail isolé interdit — Zone 4 = Risque faible, autonomie
        complète
      </p>
    </LockedSection>
  );
}

function RulesDisplay() {
  return (
    <LockedSection title="7 règles de conformité SUVA (R1-R7)">
      <ul className="space-y-2" role="list">
        {SUVA_RULES.map((rule) => (
          <li
            key={rule.id}
            className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
          >
            <span className="font-semibold">{rule.code}</span> —{" "}
            {rule.description}
            <span className="ml-1 text-xs opacity-70">({rule.reference})</span>
          </li>
        ))}
      </ul>
    </LockedSection>
  );
}

function RegulatedWorkDisplay() {
  return (
    <LockedSection title="14 travaux réglementés">
      <ul className="grid gap-2 sm:grid-cols-2" role="list">
        {REGULATED_WORK_CATEGORIES.map((cat) => (
          <li
            key={cat.id}
            className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
          >
            <span className="font-semibold">{cat.id}.</span> {cat.label}
            <span className="ml-1 text-xs opacity-70">({cat.reference})</span>
          </li>
        ))}
      </ul>
    </LockedSection>
  );
}

export function SuvaConstantsDisplay() {
  return (
    <section className="space-y-8" aria-label="Constantes réglementaires SUVA">
      <div>
        <RegulatoryLock type="suva_const" variant="section" />
        <p className="mt-2 text-sm text-muted-foreground">
          Ces valeurs sont imposées par la réglementation SUVA 44094.F et ne
          peuvent pas être modifiées.
        </p>
      </div>

      <MatrixDisplay />
      <RulesDisplay />
      <RegulatedWorkDisplay />
    </section>
  );
}
