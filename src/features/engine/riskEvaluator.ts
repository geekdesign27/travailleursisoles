import {
  getZoneFromMatrix,
  type GravityLevel,
  type ProbabilityLevel,
  type ZoneRisque,
} from "@/constants/suvaMatrix";

export interface AptitudeResult {
  psychique: boolean;
  physique: boolean;
  intellectuelle: boolean;
  allValid: boolean;
}

export interface Level2Result {
  gravity: GravityLevel;
  probability: ProbabilityLevel;
  zone: ZoneRisque;
  blocked: boolean;
  nextAction: "report" | "level-3";
}

/**
 * Evaluates worker aptitudes for isolated work.
 * Any false aptitude blocks the analysis (worker unfit for isolated work).
 */
export function evaluateAptitudes(
  psychique: boolean,
  physique: boolean,
  intellectuelle: boolean,
): AptitudeResult {
  return {
    psychique,
    physique,
    intellectuelle,
    allValid: psychique && physique && intellectuelle,
  };
}

/**
 * Evaluates Level 2 risk using the SUVA 5×5 matrix.
 * Zone 1 = blocked (extreme risk, isolated work forbidden).
 * Zone 4 = authorized without restrictions → go to report.
 * Zone 2 or 3 = proceed to Level 3 for detailed measures.
 */
export function evaluateLevel2(
  gravity: GravityLevel,
  probability: ProbabilityLevel,
): Level2Result {
  const zone = getZoneFromMatrix(gravity, probability);

  // Zone 1 is blocked
  const blocked = zone === 1;

  // Zone 4 goes directly to report, everything else to level-3
  const nextAction = zone === 4 ? "report" : "level-3";

  return {
    gravity,
    probability,
    zone,
    blocked,
    nextAction,
  };
}
