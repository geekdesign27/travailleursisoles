import type { Analysis } from "@/types/analysis.schema";
import { ZONE_DESCRIPTIONS } from "@/constants/suvaZones";
import { GRAVITY_LEVELS } from "@/constants/gravityLevels";
import { PROBABILITY_LEVELS } from "@/constants/probabilityLevels";
import { COGNITIVE_LOAD_LEVELS } from "@/constants/cognitiveLoad";
import { REGULATED_WORK_CATEGORIES } from "@/constants/regulatedWork";
import { formatPeriode, getEffectiveZone } from "./reportGenerator";

/**
 * Escapes a CSV field value: wraps in quotes if it contains comma, quote, or newline.
 */
function escapeField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function row(label: string, value: string): string {
  return `${escapeField(label)},${escapeField(value)}`;
}

/**
 * Builds the full CSV content for an analysis.
 */
function buildCsvContent(analysis: Analysis): string {
  const lines: string[] = [];

  lines.push(row("Champ", "Valeur"));
  lines.push("");

  // Identification
  lines.push(row("--- IDENTIFICATION ---", ""));
  lines.push(row("Entreprise", analysis.entreprise));
  lines.push(row("Département", analysis.departement));
  lines.push(row("Responsable", analysis.responsable));
  lines.push(row("Activité", analysis.titre_activite));
  lines.push(row("Description", analysis.description));
  lines.push(row("Nombre de personnes", String(analysis.nombre_personnes)));
  lines.push(
    row("Période de travail", formatPeriode(analysis.periode_travail)),
  );
  lines.push(row("Fréquence", analysis.frequence_activite));
  lines.push(row("Statut", analysis.status));
  lines.push(row("Date création", analysis.createdAt));
  lines.push(row("Date mise à jour", analysis.updatedAt));

  // Level 1
  if (analysis.level1Result) {
    lines.push("");
    lines.push(row("--- NIVEAU 1 : GATE ---", ""));
    lines.push(row("Bloqué", analysis.level1Result.blocked ? "Oui" : "Non"));
    lines.push(row("Mineur", analysis.level1Result.isMinor ? "Oui" : "Non"));

    const checkedLabels = REGULATED_WORK_CATEGORIES.filter((c) =>
      analysis.level1Result!.checkedCategories.includes(String(c.id)),
    ).map((c) => c.label);
    lines.push(row("Catégories cochées", checkedLabels.join("; ")));
  }

  // Level 2
  if (analysis.level2Result) {
    lines.push("");
    lines.push(row("--- NIVEAU 2 : ÉVALUATION DU RISQUE ---", ""));

    const gravDesc = GRAVITY_LEVELS.find(
      (g) => g.level === analysis.level2Result!.gravity,
    );
    lines.push(
      row(
        "Gravité",
        `${analysis.level2Result.gravity} — ${gravDesc?.label ?? ""}`,
      ),
    );

    const probDesc = PROBABILITY_LEVELS.find(
      (p) => p.level === analysis.level2Result!.probability,
    );
    lines.push(
      row(
        "Probabilité",
        `${analysis.level2Result.probability} — ${probDesc?.label ?? ""}`,
      ),
    );

    lines.push(row("Zone (matrice)", String(analysis.level2Result.zone)));

    const effectiveZone = getEffectiveZone(analysis);
    if (effectiveZone) {
      const zd = ZONE_DESCRIPTIONS[String(effectiveZone)];
      lines.push(
        row(
          "Zone effective",
          `${zd?.label ?? String(effectiveZone)} — ${zd?.description ?? ""}`,
        ),
      );
    }

    lines.push(
      row("Description du danger", analysis.level2Result.dangerDescription),
    );
    lines.push(
      row("Catégorie de danger", analysis.level2Result.dangerCategory),
    );

    const apt = analysis.level2Result.aptitudes;
    lines.push(row("Aptitude psychique", apt.psychique ? "Oui" : "Non"));
    lines.push(row("Aptitude physique", apt.physique ? "Oui" : "Non"));
    lines.push(
      row("Aptitude intellectuelle", apt.intellectuelle ? "Oui" : "Non"),
    );
  }

  // Level 3
  if (analysis.level3Result) {
    lines.push("");
    lines.push(row("--- NIVEAU 3 : CONDITIONS OPÉRATIONNELLES ---", ""));

    const oc = analysis.level3Result.operationalConditions;
    lines.push(row("Couverture réseau", oc.couvertureReseau));
    lines.push(row("Équipement DATI", oc.equipementDATI));
    lines.push(row("Centrale d'alarme", oc.centraleAlarme ? "Oui" : "Non"));
    lines.push(
      row("Délai secouristes (jour)", `${oc.delaiSecouristesJour} min`),
    );
    lines.push(
      row("Délai secouristes (nuit)", `${oc.delaiSecouristesNuit} min`),
    );
    lines.push(row("Ambulance / secours publics (144 / REGA)", `${oc.delaiAmbulance} min`));
    lines.push(row("Temps sauvetage", `${oc.tempsSauvetage} min`));

    const tm = analysis.level3Result.tmaxResult;
    lines.push(row("t_max", `${tm.tmax} min`));
    lines.push(row("Sauvetage réalisable", tm.feasible ? "Oui" : "Non"));
    lines.push(
      row("Reclassement nécessaire", tm.reclassificationNeeded ? "Oui" : "Non"),
    );
    if (tm.newZone) {
      lines.push(row("Nouvelle zone", String(tm.newZone)));
    }
  }

  // Level 4
  if (analysis.level4Result) {
    lines.push("");
    lines.push(row("--- NIVEAU 4 : VALIDATION OUTIL D'ALERTE ---", ""));

    const cogLoad = COGNITIVE_LOAD_LEVELS.find(
      (c) => c.level === analysis.level4Result!.cognitiveLoad,
    );
    lines.push(
      row(
        "Charge cognitive",
        `${analysis.level4Result.cognitiveLoad} — ${cogLoad?.label ?? ""}`,
      ),
    );
    lines.push(row("Type d'équipement", analysis.level4Result.equipmentType));

    const vr = analysis.level4Result.validationResult;
    lines.push(row("Statut validation", vr.status));
    lines.push(row("Raison", vr.reason));
    if (vr.measures.length > 0) {
      lines.push(row("Mesures", vr.measures.join("; ")));
    }
    if (analysis.level4Result.correctiveMeasures) {
      lines.push(
        row("Mesures correctives", analysis.level4Result.correctiveMeasures),
      );
    }
  }

  // Documentation
  if (analysis.documentation) {
    lines.push("");
    lines.push(row("--- DOCUMENTATION ---", ""));

    const ec = analysis.documentation.emergencyConcept;
    lines.push(row("Procédure d'alerte", ec.alerte));
    lines.push(row("Premiers secours", ec.premierSecours));
    lines.push(row("Formation", ec.formation));
    lines.push(row("Accès secours", ec.accesSecours));

    const td = analysis.documentation.trainingDoc;
    lines.push(row("Date formation", td.dateFormation));
    lines.push(row("Formateur", td.formateur));
    lines.push(row("Documentation", td.documentation));
    lines.push(row("Date révision", td.dateRevision));
  }

  // Reference
  lines.push("");
  lines.push(row("Référence", "SUVA 44094.F — Édition mai 2025"));

  return lines.join("\n");
}

/**
 * Exports the analysis as a CSV file with UTF-8 BOM for Excel Windows compatibility.
 */
export function exportAnalysisCsv(analysis: Analysis): void {
  const content = buildCsvContent(analysis);
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8" });

  const poste = analysis.titre_activite
    .replace(/[^a-zA-Z0-9àâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇ\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 40);
  const periode = formatPeriode(analysis.periode_travail);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `Analyse_${poste}_${periode}_${date}.csv`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Expose for testing
export { buildCsvContent };
