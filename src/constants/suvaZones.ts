// SUVA_REGULATORY_CONSTANT — DO NOT MODIFY
// Source: SUVA 44094.F — Édition mai 2025

import type { ZoneRisque } from "./suvaMatrix";

export interface ZoneDescription {
  zone: ZoneRisque;
  label: string;
  description: string;
  color: string;
  textOnBadge: "light" | "dark";
  surveillance: string;
}

export const ZONE_DESCRIPTIONS: Record<string, ZoneDescription> = {
  "1": {
    zone: 1,
    label: "Zone 1",
    description:
      "Travail isolé interdit — présence d'une 2e personne obligatoire",
    color: "var(--suva-zone-1)",
    textOnBadge: "light",
    surveillance: "Présence permanente d'une 2e personne",
  },
  "2": {
    zone: 2,
    label: "Zone 2",
    description: "Travail isolé avec surveillance directe obligatoire",
    color: "var(--suva-zone-2)",
    textOnBadge: "dark",
    surveillance: "Surveillance directe (visuelle ou acoustique)",
  },
  "3a": {
    zone: "3a",
    label: "Zone 3a",
    description: "Travail isolé avec contrôle périodique renforcé",
    color: "var(--suva-zone-3)",
    textOnBadge: "dark",
    surveillance: "Contrôle périodique ≤ 2 heures",
  },
  "3b": {
    zone: "3b",
    label: "Zone 3b",
    description: "Travail isolé avec contrôle périodique standard",
    color: "var(--suva-zone-3)",
    textOnBadge: "dark",
    surveillance: "Contrôle périodique ≤ 4 heures",
  },
  "4": {
    zone: 4,
    label: "Zone 4",
    description:
      "Travail isolé autorisé — mesures organisationnelles suffisantes",
    color: "var(--suva-zone-4)",
    textOnBadge: "dark",
    surveillance: "Mesures organisationnelles standard",
  },
} as const;

export function getZoneDescription(zone: ZoneRisque): ZoneDescription {
  return ZONE_DESCRIPTIONS[String(zone)];
}
