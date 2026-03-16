// SUVA_REGULATORY_CONSTANT — DO NOT MODIFY
// Source: SUVA 44094.F — Édition mai 2025

import type { GravityLevel } from "./suvaMatrix";

export interface GravityDescription {
  level: GravityLevel;
  label: string;
  description: string;
}

export const GRAVITY_LEVELS: GravityDescription[] = [
  {
    level: "I",
    label: "Légère",
    description: "Blessure légère, premiers soins suffisants",
  },
  {
    level: "II",
    label: "Moyenne",
    description: "Blessure nécessitant un traitement médical",
  },
  {
    level: "III",
    label: "Grave",
    description: "Blessure grave avec arrêt de travail prolongé",
  },
  {
    level: "IV",
    label: "Très grave",
    description: "Invalidité permanente possible",
  },
  {
    level: "V",
    label: "Mortelle",
    description: "Risque de décès",
  },
] as const;
