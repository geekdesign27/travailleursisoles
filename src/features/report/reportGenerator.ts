import type { Analysis } from "@/types/analysis.schema";
import { ZONE_DESCRIPTIONS } from "@/constants/suvaZones";
import { GRAVITY_LEVELS } from "@/constants/gravityLevels";
import { PROBABILITY_LEVELS } from "@/constants/probabilityLevels";
import { COGNITIVE_LOAD_LEVELS } from "@/constants/cognitiveLoad";
import { SUVA_RULES } from "@/constants/suvaRules";
import { REGULATED_WORK_CATEGORIES } from "@/constants/regulatedWork";

export type ActionType = "exigence" | "recommandation";

export interface ActionItem {
  number: number;
  type: ActionType;
  text: string;
  reference?: string;
}

export interface TechnicalSummary {
  gravity: { level: string; label: string; description: string } | null;
  probability: { level: string; label: string; description: string } | null;
  zone: {
    zone: string;
    label: string;
    description: string;
    surveillance: string;
  } | null;
  tmax: {
    value: number;
    feasible: boolean;
    reclassificationNeeded: boolean;
    newZone?: string;
  } | null;
  cognitiveLoad: { level: string; label: string; description: string } | null;
  alertValidation: {
    status: string;
    reason: string;
    measures: string[];
  } | null;
  appliedRules: Array<{ code: string; description: string; reference: string }>;
  regulatedWorkCategories: string[];
  operationalConditions: {
    couvertureReseau: string;
    equipementDATI: string;
    centraleAlarme: boolean;
    delaiSecouristesJour: number;
    delaiSecouristesNuit: number;
    delaiAmbulance: number;
    tempsSauvetage: number;
  } | null;
}

/**
 * Returns a plain-language decision for management.
 * Maps zone to one of three outcomes.
 */
export function getManagementDecision(analysis: Analysis): string {
  const zone = analysis.level2Result?.zone;
  if (!zone) return "Analyse incomplète — décision non disponible";

  const effectiveZone =
    analysis.level3Result?.tmaxResult?.reclassificationNeeded &&
    analysis.level3Result.tmaxResult.newZone
      ? analysis.level3Result.tmaxResult.newZone
      : zone;

  switch (effectiveZone) {
    case 1:
      return "Travail isolé interdit";
    case 2:
      return "Travail isolé autorisé sous conditions";
    case "3a":
    case "3b":
      return "Travail isolé autorisé sous conditions";
    case 4:
      return "Travail isolé autorisé";
    default:
      return "Analyse incomplète — décision non disponible";
  }
}

/**
 * Generates numbered action items for the management view.
 * Rules become "exigence", suggestions become "recommandation".
 */
export function generateManagementActions(analysis: Analysis): ActionItem[] {
  const actions: ActionItem[] = [];
  let counter = 1;

  const zone = getEffectiveZone(analysis);

  // Zone-based exigences
  if (zone === 1) {
    actions.push({
      number: counter++,
      type: "exigence",
      text: "Présence obligatoire d'une deuxième personne sur le lieu de travail.",
      reference: "SUVA 44094.F ch. 3.2",
    });
    actions.push({
      number: counter++,
      type: "exigence",
      text: "Le travail isolé est strictement interdit pour cette activité.",
      reference: "SUVA 44094.F ch. 3.1",
    });
  }

  if (zone === 2) {
    actions.push({
      number: counter++,
      type: "exigence",
      text: "Surveillance directe obligatoire (visuelle ou acoustique).",
      reference: "SUVA 44094.F ch. 5",
    });
  }

  if (zone === "3a") {
    actions.push({
      number: counter++,
      type: "exigence",
      text: "Contrôle périodique renforcé toutes les 2 heures maximum.",
      reference: "SUVA 44094.F ch. 5",
    });
  }

  if (zone === "3b") {
    actions.push({
      number: counter++,
      type: "exigence",
      text: "Contrôle périodique toutes les 4 heures maximum.",
      reference: "SUVA 44094.F ch. 5",
    });
  }

  // Level 1: regulated work
  if (analysis.level1Result?.blocked) {
    const checkedIds = analysis.level1Result.checkedCategories;
    const checkedLabels = REGULATED_WORK_CATEGORIES.filter((c) =>
      checkedIds.includes(String(c.id)),
    ).map((c) => c.label);

    if (checkedLabels.length > 0) {
      actions.push({
        number: counter++,
        type: "exigence",
        text: `Travaux réglementés identifiés : ${checkedLabels.join(", ")}. Le travail isolé est interdit.`,
        reference: "SUVA 44094.F ch. 3.1",
      });
    }
  }

  // Minor worker
  if (analysis.level1Result?.isMinor) {
    actions.push({
      number: counter++,
      type: "exigence",
      text: "Personnel mineur (< 18 ans) : le travail isolé est interdit.",
      reference: "Ordonnance protection jeunes travailleurs",
    });
  }

  // t_max reclassification
  if (analysis.level3Result?.tmaxResult?.reclassificationNeeded) {
    actions.push({
      number: counter++,
      type: "exigence",
      text: "Le temps de sauvetage dépasse le délai acceptable. La zone a été reclassée en Zone 2.",
      reference: "SUVA 44094.F ch. 5.3",
    });
  }

  // Alert validation measures
  if (analysis.level4Result?.validationResult) {
    const { status, measures } = analysis.level4Result.validationResult;
    if (status === "incompatible") {
      actions.push({
        number: counter++,
        type: "exigence",
        text: "L'outil d'alerte est incompatible avec les conditions de travail. Mesures correctives obligatoires.",
      });
    }
    for (const measure of measures) {
      actions.push({
        number: counter++,
        type: status === "incompatible" ? "exigence" : "recommandation",
        text: measure,
      });
    }
  }

  // Emergency concept recommendations
  if (analysis.documentation?.emergencyConcept) {
    const ec = analysis.documentation.emergencyConcept;
    if (!ec.alerte) {
      actions.push({
        number: counter++,
        type: "recommandation",
        text: "Définir la procédure d'alerte dans le concept d'urgence.",
      });
    }
    if (!ec.premierSecours) {
      actions.push({
        number: counter++,
        type: "recommandation",
        text: "Définir les mesures de premiers secours dans le concept d'urgence.",
      });
    }
    if (!ec.formation) {
      actions.push({
        number: counter++,
        type: "recommandation",
        text: "Planifier la formation du personnel au concept d'urgence.",
      });
    }
    if (!ec.accesSecours) {
      actions.push({
        number: counter++,
        type: "recommandation",
        text: "Documenter les voies d'accès pour les secours.",
      });
    }
  }

  // Aptitude checks
  if (analysis.level2Result?.aptitudes) {
    const apt = analysis.level2Result.aptitudes;
    if (!apt.psychique || !apt.physique || !apt.intellectuelle) {
      actions.push({
        number: counter++,
        type: "recommandation",
        text: "Vérifier les aptitudes (psychique, physique, intellectuelle) du personnel avant toute mission isolée.",
      });
    }
  }

  // Night/weekend recommendation
  if (
    analysis.periode_travail === "nuit" ||
    analysis.periode_travail === "weekend" ||
    analysis.periode_travail === "jour_ferie"
  ) {
    actions.push({
      number: counter++,
      type: "recommandation",
      text: `Période de travail (${formatPeriode(analysis.periode_travail)}) : vérifier la disponibilité des secours sur cette plage horaire.`,
    });
  }

  return actions;
}

/**
 * Generates a complete technical summary from analysis data.
 */
export function generateTechnicalSummary(analysis: Analysis): TechnicalSummary {
  const gravity = analysis.level2Result
    ? (GRAVITY_LEVELS.find((g) => g.level === analysis.level2Result!.gravity) ??
      null)
    : null;

  const probability = analysis.level2Result
    ? (PROBABILITY_LEVELS.find(
        (p) => p.level === analysis.level2Result!.probability,
      ) ?? null)
    : null;

  const effectiveZone = getEffectiveZone(analysis);
  const zoneDesc = effectiveZone
    ? (ZONE_DESCRIPTIONS[String(effectiveZone)] ?? null)
    : null;

  const zone = zoneDesc
    ? {
        zone: String(zoneDesc.zone),
        label: zoneDesc.label,
        description: zoneDesc.description,
        surveillance: zoneDesc.surveillance,
      }
    : null;

  const tmax = analysis.level3Result?.tmaxResult
    ? {
        value: analysis.level3Result.tmaxResult.tmax,
        feasible: analysis.level3Result.tmaxResult.feasible,
        reclassificationNeeded:
          analysis.level3Result.tmaxResult.reclassificationNeeded,
        newZone: analysis.level3Result.tmaxResult.newZone
          ? String(analysis.level3Result.tmaxResult.newZone)
          : undefined,
      }
    : null;

  const cogLoad = analysis.level4Result
    ? (COGNITIVE_LOAD_LEVELS.find(
        (c) => c.level === analysis.level4Result!.cognitiveLoad,
      ) ?? null)
    : null;

  const cognitiveLoad = cogLoad
    ? {
        level: cogLoad.level,
        label: cogLoad.label,
        description: cogLoad.description,
      }
    : null;

  const alertValidation = analysis.level4Result?.validationResult
    ? {
        status: analysis.level4Result.validationResult.status,
        reason: analysis.level4Result.validationResult.reason,
        measures: analysis.level4Result.validationResult.measures,
      }
    : null;

  // Determine which SUVA rules apply
  const appliedRules: TechnicalSummary["appliedRules"] = [];

  if (analysis.level1Result?.blocked) {
    const r1 = SUVA_RULES.find((r) => r.code === "R1");
    if (r1)
      appliedRules.push({
        code: r1.code,
        description: r1.description,
        reference: r1.reference,
      });
  }

  if (analysis.level1Result?.isMinor) {
    const r2 = SUVA_RULES.find((r) => r.code === "R2");
    if (r2)
      appliedRules.push({
        code: r2.code,
        description: r2.description,
        reference: r2.reference,
      });
  }

  if (effectiveZone === 1) {
    const r3 = SUVA_RULES.find((r) => r.code === "R3");
    if (r3)
      appliedRules.push({
        code: r3.code,
        description: r3.description,
        reference: r3.reference,
      });
  }

  if (analysis.level3Result?.tmaxResult?.reclassificationNeeded) {
    const r4 = SUVA_RULES.find((r) => r.code === "R4");
    if (r4)
      appliedRules.push({
        code: r4.code,
        description: r4.description,
        reference: r4.reference,
      });
  }

  if (
    effectiveZone === 2 &&
    analysis.level3Result?.operationalConditions &&
    (analysis.level3Result.operationalConditions.delaiSecouristesJour > 15 ||
      analysis.level3Result.operationalConditions.delaiSecouristesNuit > 15)
  ) {
    const r5 = SUVA_RULES.find((r) => r.code === "R5");
    if (r5)
      appliedRules.push({
        code: r5.code,
        description: r5.description,
        reference: r5.reference,
      });
  }

  // R6 always applies
  const r6 = SUVA_RULES.find((r) => r.code === "R6");
  if (r6)
    appliedRules.push({
      code: r6.code,
      description: r6.description,
      reference: r6.reference,
    });

  // R7 always applies
  const r7 = SUVA_RULES.find((r) => r.code === "R7");
  if (r7)
    appliedRules.push({
      code: r7.code,
      description: r7.description,
      reference: r7.reference,
    });

  const regulatedWorkCategories = analysis.level1Result?.checkedCategories
    ? REGULATED_WORK_CATEGORIES.filter((c) =>
        analysis.level1Result!.checkedCategories.includes(String(c.id)),
      ).map((c) => `${c.label} (${c.reference})`)
    : [];

  const operationalConditions =
    analysis.level3Result?.operationalConditions ?? null;

  return {
    gravity: gravity
      ? {
          level: gravity.level,
          label: gravity.label,
          description: gravity.description,
        }
      : null,
    probability: probability
      ? {
          level: probability.level,
          label: probability.label,
          description: probability.description,
        }
      : null,
    zone,
    tmax,
    cognitiveLoad,
    alertValidation,
    appliedRules,
    regulatedWorkCategories,
    operationalConditions,
  };
}

// --- Helpers ---

function getEffectiveZone(
  analysis: Analysis,
): Analysis["level2Result"] extends undefined
  ? null
  : 1 | 2 | "3a" | "3b" | 4 | null {
  if (!analysis.level2Result) return null as never;
  if (
    analysis.level3Result?.tmaxResult?.reclassificationNeeded &&
    analysis.level3Result.tmaxResult.newZone
  ) {
    return analysis.level3Result.tmaxResult.newZone as never;
  }
  return analysis.level2Result.zone as never;
}

function formatPeriode(periode: string): string {
  const map: Record<string, string> = {
    jour: "Jour",
    nuit: "Nuit",
    weekend: "Week-end",
    jour_ferie: "Jour férié",
    piquet: "Service de piquet",
  };
  return map[periode] ?? periode;
}

export { formatPeriode, getEffectiveZone };
