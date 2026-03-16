// SUVA_REGULATORY_CONSTANT — DO NOT MODIFY
// Source: SUVA 44094.F — Édition mai 2025

import type { ProbabilityLevel } from "./suvaMatrix";

export interface ProbabilityDescription {
  level: ProbabilityLevel;
  label: string;
  description: string;
}

export const PROBABILITY_LEVELS: ProbabilityDescription[] = [
  {
    level: "A",
    label: "Très rare",
    description: "Événement pratiquement impensable",
  },
  {
    level: "B",
    label: "Rare",
    description: "Événement possible mais inhabituel",
  },
  {
    level: "C",
    label: "Occasionnel",
    description: "Événement déjà survenu ou prévisible",
  },
  {
    level: "D",
    label: "Fréquent",
    description: "Événement survient régulièrement",
  },
  {
    level: "E",
    label: "Très fréquent",
    description: "Événement quasi certain",
  },
] as const;
