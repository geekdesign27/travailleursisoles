// SUVA_REGULATORY_CONSTANT — DO NOT MODIFY
// Source: SUVA 44094.F — Édition mai 2025
// Niveaux de charge cognitive pour l'évaluation de l'outil d'alerte

export type CognitiveLoadLevel = "C1" | "C2" | "C3";

export interface CognitiveLoadDefinition {
  level: CognitiveLoadLevel;
  label: string;
  description: string;
}

// SUVA_REGULATORY_CONSTANT — DO NOT MODIFY
export const COGNITIVE_LOAD_LEVELS: readonly CognitiveLoadDefinition[] = [
  {
    level: "C1",
    label: "Faible",
    description:
      "L'activité permet à la personne de réagir facilement à une alerte et d'activer un dispositif sans difficulté.",
  },
  {
    level: "C2",
    label: "Moyenne",
    description:
      "L'activité demande de l'attention mais la personne peut interrompre brièvement sa tâche pour actionner un dispositif.",
  },
  {
    level: "C3",
    label: "Élevée",
    description:
      "L'activité exige une concentration permanente ou des gestes continus qui empêchent la personne d'actionner un dispositif manuellement.",
  },
] as const;

export interface CognitiveLoadQuestion {
  id: string;
  question: string;
  mappedLevel: CognitiveLoadLevel;
}

// SUVA_REGULATORY_CONSTANT — DO NOT MODIFY
export const COGNITIVE_LOAD_QUESTIONS: readonly CognitiveLoadQuestion[] = [
  {
    id: "q_c1",
    question:
      "La personne peut facilement interrompre son travail pour déclencher une alerte manuellement.",
    mappedLevel: "C1",
  },
  {
    id: "q_c2",
    question:
      "La personne doit faire un effort modéré pour interrompre sa tâche et déclencher une alerte.",
    mappedLevel: "C2",
  },
  {
    id: "q_c3",
    question:
      "La personne ne peut pas interrompre son activité pour déclencher une alerte manuellement (port de charges, travail en hauteur, manipulation continue).",
    mappedLevel: "C3",
  },
] as const;
