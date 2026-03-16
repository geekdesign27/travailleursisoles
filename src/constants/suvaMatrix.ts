// SUVA_REGULATORY_CONSTANT — DO NOT MODIFY
// Source: SUVA 44094.F — Édition mai 2025
// Matrice 5×5 : Gravité (I-V) × Probabilité (A-E) → Zone (1-4)

export type ZoneRisque = 1 | 2 | "3a" | "3b" | 4;
export type GravityLevel = "I" | "II" | "III" | "IV" | "V";
export type ProbabilityLevel = "A" | "B" | "C" | "D" | "E";

/**
 * Matrice SUVA 5×5
 * Lignes: Gravité (I = légère → V = très grave)
 * Colonnes: Probabilité (A = très rare → E = très fréquent)
 * Cellule: Zone de risque résultante
 */
export const SUVA_MATRIX: Record<
  GravityLevel,
  Record<ProbabilityLevel, ZoneRisque>
> = {
  I: { A: 4, B: 4, C: 4, D: "3b", E: "3b" },
  II: { A: 4, B: 4, C: "3b", D: "3b", E: "3a" },
  III: { A: 4, B: "3b", C: "3b", D: "3a", E: 2 },
  IV: { A: "3b", B: "3b", C: "3a", D: 2, E: 1 },
  V: { A: "3b", B: "3a", C: 2, D: 1, E: 1 },
} as const;

export function getZoneFromMatrix(
  gravity: GravityLevel,
  probability: ProbabilityLevel,
): ZoneRisque {
  return SUVA_MATRIX[gravity][probability];
}
