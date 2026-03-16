import type { ZoneRisque } from "@/constants/suvaMatrix";

export interface TmaxParams {
  delaiTypeBlessure: number;
  tempsSecouristes: number;
  tempsAmbulance: number;
  tempsSauvetage: number;
}

export interface TmaxResult {
  tmax: number;
  feasible: boolean;
  reclassificationNeeded: boolean;
  newZone?: ZoneRisque;
}

export interface Level3Decision {
  feasible: boolean;
  reclassificationNeeded: boolean;
  newZone?: ZoneRisque;
  nextAction: "level-4" | "report";
}

/**
 * Calculates t_max: maximum time available for rescue.
 * Formula: t_max = delaiTypeBlessure - tempsSecouristes - tempsAmbulance - tempsSauvetage
 */
export function calculateTmax(params: TmaxParams): TmaxResult {
  const tmax =
    params.delaiTypeBlessure -
    params.tempsSecouristes -
    params.tempsAmbulance -
    params.tempsSauvetage;

  return {
    tmax,
    feasible: tmax > 0,
    reclassificationNeeded: false,
  };
}

/**
 * Evaluates Level 3 decision based on t_max and current zone.
 * - t_max > 0: rescue is feasible, proceed to level 4
 * - t_max <= 0 and zone 3a/3b: reclassify to Zone 2 (rule R4)
 * - t_max <= 0 and zone 2: Zone 2 confirmed (already adequate classification)
 */
export function evaluateLevel3(
  tmax: number,
  currentZone: ZoneRisque,
): Level3Decision {
  if (tmax > 0) {
    return {
      feasible: true,
      reclassificationNeeded: false,
      nextAction: "level-4",
    };
  }

  // t_max <= 0: rescue not feasible
  if (currentZone === "3a" || currentZone === "3b") {
    return {
      feasible: false,
      reclassificationNeeded: true,
      newZone: 2,
      nextAction: "report",
    };
  }

  // Zone 2: already classified correctly
  return {
    feasible: false,
    reclassificationNeeded: false,
    newZone: 2,
    nextAction: "report",
  };
}
