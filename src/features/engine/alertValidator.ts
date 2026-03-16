import type { ZoneRisque } from "@/constants/suvaMatrix";
import type { CognitiveLoadLevel } from "@/constants/cognitiveLoad";
import type { CouvertureReseauType } from "@/types/analysis.schema";

export interface CognitiveAnswers {
  selectedLevel: CognitiveLoadLevel;
}

export interface AlertValidationParams {
  zone: ZoneRisque;
  equipmentType: string;
  coverage: CouvertureReseauType;
  cognitiveLoad: CognitiveLoadLevel;
}

export type AlertValidationStatus =
  | "compatible"
  | "incompatible"
  | "with_reserves";

export interface AlertValidationResult {
  compatible: boolean;
  status: AlertValidationStatus;
  measures: string[];
  reason: string;
}

/**
 * Determines cognitive load level from user selection.
 * Direct mapping — the user selects the question matching their situation.
 */
export function determineCognitiveLoad(
  answers: CognitiveAnswers,
): CognitiveLoadLevel {
  return answers.selectedLevel;
}

/**
 * Validates alert tool compatibility based on zone, equipment, coverage and cognitive load.
 *
 * Compatibility matrix:
 * - Zone 1: always incompatible (should not reach this step)
 * - Zone 4: always compatible
 * - Zone 2 + low/no coverage + C3: incompatible
 * - Zone 2 + good coverage + C1: compatible
 * - Zone 3 + any coverage + C1-C2: compatible
 * - Mixed cases: with_reserves + measures
 */
export function validateAlertTool(
  params: AlertValidationParams,
): AlertValidationResult {
  const { zone, equipmentType, coverage, cognitiveLoad } = params;

  // Zone 1: always incompatible — shouldn't reach level 4
  if (zone === 1) {
    return {
      compatible: false,
      status: "incompatible",
      measures: [
        "Le travail isolé est interdit en Zone 1. Une deuxième personne doit être présente.",
      ],
      reason:
        "Zone 1 — Le travail isolé est interdit. Aucun outil d'alerte ne peut remplacer la présence d'une deuxième personne.",
    };
  }

  // Zone 4: always compatible
  if (zone === 4) {
    return {
      compatible: true,
      status: "compatible",
      measures: [],
      reason:
        "Zone 4 — Le risque est faible. L'outil d'alerte choisi est adapté à la situation.",
    };
  }

  const isLowCoverage = coverage === "faible" || coverage === "aucune";
  const isGoodCoverage = coverage === "bonne";
  const isMediumCoverage = coverage === "moyenne";
  const isManualOnly =
    equipmentType === "alerte_manuelle" || equipmentType === "autre";

  // Zone 2
  if (zone === 2) {
    // Zone 2 + low/no coverage + C3: incompatible
    if (isLowCoverage && cognitiveLoad === "C3") {
      return {
        compatible: false,
        status: "incompatible",
        measures: [
          "Améliorer la couverture réseau sur le lieu de travail.",
          "Envisager un dispositif fonctionnant hors réseau (radio, satellite).",
          "Réduire la charge cognitive ou réorganiser l'activité pour permettre le déclenchement manuel.",
          "Envisager la présence d'une deuxième personne.",
        ],
        reason:
          "Zone 2 — La combinaison couverture réseau insuffisante et charge cognitive élevée rend l'outil d'alerte inefficace.",
      };
    }

    // Zone 2 + no coverage: incompatible regardless of cognitive load
    if (coverage === "aucune") {
      return {
        compatible: false,
        status: "incompatible",
        measures: [
          "Aucune couverture réseau disponible. L'outil d'alerte ne peut pas fonctionner.",
          "Envisager un dispositif fonctionnant hors réseau (radio, satellite).",
          "Envisager la présence d'une deuxième personne.",
        ],
        reason:
          "Zone 2 — Aucune couverture réseau. L'outil d'alerte ne peut pas transmettre l'alarme.",
      };
    }

    // Zone 2 + good coverage + C1: compatible
    if (isGoodCoverage && cognitiveLoad === "C1") {
      return {
        compatible: true,
        status: "compatible",
        measures: [],
        reason:
          "Zone 2 — Bonne couverture réseau et charge cognitive faible. L'outil d'alerte est adapté.",
      };
    }

    // Zone 2 + good coverage + C2: with_reserves
    if (isGoodCoverage && cognitiveLoad === "C2") {
      const measures: string[] = [
        "Prévoir des pauses régulières pour vérifier le fonctionnement du dispositif.",
      ];
      if (isManualOnly) {
        measures.push(
          "Envisager un dispositif avec détection automatique (PTI, homme-mort) pour réduire la dépendance à l'action manuelle.",
        );
      }
      return {
        compatible: true,
        status: "with_reserves",
        measures,
        reason:
          "Zone 2 — Bonne couverture réseau mais charge cognitive moyenne. Des mesures complémentaires sont recommandées.",
      };
    }

    // Zone 2 + good coverage + C3: with_reserves (stricter)
    if (isGoodCoverage && cognitiveLoad === "C3") {
      return {
        compatible: true,
        status: "with_reserves",
        measures: [
          "Utiliser un dispositif avec détection automatique (PTI, homme-mort) — le déclenchement manuel n'est pas fiable avec une charge cognitive élevée.",
          "Mettre en place des rondes de contrôle régulières.",
          "Prévoir une procédure d'escalade en cas de non-réponse.",
        ],
        reason:
          "Zone 2 — Bonne couverture réseau mais charge cognitive élevée. Un dispositif automatique est fortement recommandé.",
      };
    }

    // Zone 2 + medium coverage: with_reserves for C1, stricter for C2/C3
    if (isMediumCoverage && cognitiveLoad === "C1") {
      return {
        compatible: true,
        status: "with_reserves",
        measures: [
          "Vérifier la couverture réseau aux points critiques du lieu de travail.",
          "Prévoir un moyen d'alerte de secours en cas de perte de signal.",
        ],
        reason:
          "Zone 2 — Couverture réseau moyenne. Vérification de la couverture recommandée.",
      };
    }

    if (isMediumCoverage && cognitiveLoad === "C2") {
      return {
        compatible: true,
        status: "with_reserves",
        measures: [
          "Vérifier la couverture réseau aux points critiques du lieu de travail.",
          "Envisager un dispositif avec détection automatique (PTI, homme-mort).",
          "Prévoir des rondes de contrôle régulières.",
        ],
        reason:
          "Zone 2 — Couverture réseau moyenne et charge cognitive moyenne. Des mesures complémentaires sont nécessaires.",
      };
    }

    if (isMediumCoverage && cognitiveLoad === "C3") {
      return {
        compatible: false,
        status: "incompatible",
        measures: [
          "Améliorer la couverture réseau ou utiliser un dispositif fonctionnant hors réseau.",
          "Un dispositif automatique est indispensable avec une charge cognitive élevée.",
          "Envisager la présence d'une deuxième personne.",
        ],
        reason:
          "Zone 2 — Couverture réseau moyenne et charge cognitive élevée. L'outil d'alerte n'est pas fiable.",
      };
    }

    // Zone 2 + low coverage + C1 or C2: with_reserves
    if (isLowCoverage) {
      return {
        compatible: true,
        status: "with_reserves",
        measures: [
          "La couverture réseau est faible. Prévoir un moyen d'alerte de secours (radio, satellite).",
          "Tester la couverture aux points critiques avant chaque intervention.",
          "Mettre en place des rondes de contrôle régulières.",
        ],
        reason:
          "Zone 2 — Couverture réseau faible. Des mesures complémentaires sont indispensables.",
      };
    }
  }

  // Zone 3a / 3b
  if (zone === "3a" || zone === "3b") {
    // Zone 3 + any coverage + C1: compatible
    if (cognitiveLoad === "C1" && !isLowCoverage && coverage !== "aucune") {
      return {
        compatible: true,
        status: "compatible",
        measures: [],
        reason:
          "Zone 3 — Charge cognitive faible et couverture réseau suffisante. L'outil d'alerte est adapté.",
      };
    }

    // Zone 3 + C2 + good/medium coverage: compatible
    if (cognitiveLoad === "C2" && (isGoodCoverage || isMediumCoverage)) {
      return {
        compatible: true,
        status: "compatible",
        measures: [],
        reason:
          "Zone 3 — Charge cognitive moyenne et couverture réseau suffisante. L'outil d'alerte est adapté.",
      };
    }

    // Zone 3 + C1 + low/no coverage: with_reserves
    if (cognitiveLoad === "C1" && (isLowCoverage || coverage === "aucune")) {
      return {
        compatible: true,
        status: "with_reserves",
        measures: [
          "La couverture réseau est insuffisante. Prévoir un moyen d'alerte de secours.",
          "Tester la couverture aux points critiques.",
        ],
        reason:
          "Zone 3 — Charge cognitive faible mais couverture réseau insuffisante.",
      };
    }

    // Zone 3 + C2 + low/no coverage: with_reserves
    if (cognitiveLoad === "C2" && (isLowCoverage || coverage === "aucune")) {
      return {
        compatible: true,
        status: "with_reserves",
        measures: [
          "La couverture réseau est insuffisante. Prévoir un moyen d'alerte de secours.",
          "Envisager un dispositif avec détection automatique (PTI, homme-mort).",
        ],
        reason:
          "Zone 3 — Charge cognitive moyenne et couverture réseau insuffisante. Des mesures complémentaires sont recommandées.",
      };
    }

    // Zone 3 + C3: with_reserves (any coverage)
    if (cognitiveLoad === "C3") {
      const measures: string[] = [
        "Utiliser un dispositif avec détection automatique (PTI, homme-mort).",
        "Mettre en place des rondes de contrôle régulières.",
      ];
      if (isLowCoverage || coverage === "aucune") {
        measures.push(
          "La couverture réseau est insuffisante. Prévoir un moyen d'alerte de secours (radio, satellite).",
        );
      }
      return {
        compatible: true,
        status: "with_reserves",
        measures,
        reason:
          "Zone 3 — Charge cognitive élevée. Un dispositif automatique est recommandé.",
      };
    }
  }

  // Fallback: with_reserves
  return {
    compatible: true,
    status: "with_reserves",
    measures: [
      "Vérifier la compatibilité de l'outil d'alerte avec les conditions spécifiques du poste.",
    ],
    reason: "Évaluation partielle — vérification complémentaire recommandée.",
  };
}
