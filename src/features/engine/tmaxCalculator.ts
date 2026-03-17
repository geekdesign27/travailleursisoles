import type { ZoneRisque, GravityLevel } from "@/constants/suvaMatrix";

// SUVA_CONST — Base temporelle Zone 3 ch. 7.3
const BASE_ZONE_3A_MIN = 480; // 8 heures — blessure sans atteinte irréversible
const BASE_ZONE_3B_MIN = 240; // 4 heures — blessure avec atteinte irréversible possible
const MARGE_SECURITE_MIN = 15; // Marge de sécurité sur t_max
const TMAX_MIN_ZONE3_MIN = 30; // Seuil minimum t_max pour Zone 3
const SEUIL_SURVIE_MIN = 7; // Seuil de survie (gravité I/II)

export interface TmaxParams {
  /** Délai d'arrivée du secouriste interne (minutes) */
  tempsSecouristes: number;
  /** Délai d'arrivée de l'ambulance 144/REGA (minutes) */
  tempsAmbulance: number;
  /** Délai d'accès au blessé / sauvetage technique (minutes) */
  tempsSauvetage: number;
  /** Zone issue du Niveau 2 */
  zone: ZoneRisque;
  /** Gravité issue du Niveau 2 */
  gravite: GravityLevel;
}

export interface TmaxResult {
  /** Base temporelle utilisée (480 ou 240) */
  base: number;
  /** t_max calculé */
  tmax: number;
  /** Intervalle de surveillance recommandé (t_max - 15 min) */
  intervalle: number;
  feasible: boolean;
  reclassificationNeeded: boolean;
  newZone?: ZoneRisque;
}

export interface Level3Decision {
  feasible: boolean;
  reclassificationNeeded: boolean;
  newZone?: ZoneRisque;
  nextAction: "level-4" | "report";
  message?: string;
}

/**
 * Détermine la base temporelle selon la zone SUVA.
 * Zone 3a → 480 min (gravité IV-V, blessure sans atteinte irréversible)
 * Zone 3b → 240 min (gravité II-III, blessure avec atteinte irréversible possible)
 */
function getBase(zone: ZoneRisque): number {
  if (zone === "3a") return BASE_ZONE_3A_MIN;
  if (zone === "3b") return BASE_ZONE_3B_MIN;
  // Pour les zones 2 et 4, on utilise la base la plus contraignante
  return BASE_ZONE_3B_MIN;
}

/**
 * Calculates t_max: maximum time available for rescue.
 * Formula SUVA 44094.F ch. 7.3:
 *   t_max = BASE - tempsSecouristes - tempsAmbulance - tempsSauvetage
 *
 * BASE = 480 min (Zone 3a) ou 240 min (Zone 3b)
 */
export function calculateTmax(params: TmaxParams): TmaxResult {
  const base = getBase(params.zone);
  const tmax =
    base -
    params.tempsSecouristes -
    params.tempsAmbulance -
    params.tempsSauvetage;

  const intervalle = Math.max(0, tmax - MARGE_SECURITE_MIN);

  return {
    base,
    tmax,
    intervalle,
    feasible: tmax > TMAX_MIN_ZONE3_MIN,
    reclassificationNeeded: false,
  };
}

/**
 * Evaluates Level 3 decision based on t_max and current zone.
 * Implements Gates G4, G5, G6 from SUVA 44094.F
 */
export function evaluateLevel3(
  tmax: number,
  currentZone: ZoneRisque,
  gravite?: GravityLevel,
  delaiSecouristes?: number,
  tempsSauvetage?: number,
): Level3Decision {
  // Gate G4 — Survie immédiate (gravité I/II)
  if (
    gravite &&
    (gravite === "IV" || gravite === "V") &&
    delaiSecouristes !== undefined &&
    tempsSauvetage !== undefined
  ) {
    const delaiTotal = delaiSecouristes + tempsSauvetage;
    if (delaiTotal > SEUIL_SURVIE_MIN) {
      return {
        feasible: false,
        reclassificationNeeded: true,
        newZone: 1,
        nextAction: "report",
        message: `La gravité du dommage identifié exige une présence humaine pouvant intervenir en moins de ${SEUIL_SURVIE_MIN} minutes. Le délai constaté de ${delaiTotal} minutes est incompatible avec un travail isolé.`,
      };
    }
  }

  // Zone 2 ou Zone 1 : t_max n'est pas applicable, la zone est déjà classifiée
  if (currentZone === 2 || currentZone === 1) {
    return {
      feasible: tmax > TMAX_MIN_ZONE3_MIN,
      reclassificationNeeded: false,
      newZone: currentZone === 2 ? 2 : 1,
      nextAction: "level-4",
      message:
        tmax <= 0
          ? `Le temps disponible est insuffisant (${tmax} min). La classification Zone ${currentZone} est confirmée.`
          : undefined,
    };
  }

  // Gate G5 — Faisabilité Zone 3
  if (tmax > TMAX_MIN_ZONE3_MIN) {
    return {
      feasible: true,
      reclassificationNeeded: false,
      nextAction: "level-4",
    };
  }

  if (tmax >= 0 && tmax <= TMAX_MIN_ZONE3_MIN) {
    // t_max insuffisant pour Zone 3 → reclasser en Zone 2
    return {
      feasible: false,
      reclassificationNeeded: true,
      newZone: 2,
      nextAction: "level-4",
      message: `Le délai de sauvetage calculé (${tmax} min) ne laisse pas un intervalle de surveillance praticable. La zone est reclassée en Zone 2.`,
    };
  }

  // t_max < 0 : NO-GO absolu pour Zone 3 → reclasser en Zone 2
  return {
    feasible: false,
    reclassificationNeeded: true,
    newZone: 2,
    nextAction: "level-4",
    message: `Le délai de sauvetage dépasse la fenêtre d'intervention sûre. La zone est reclassée en Zone 2.`,
  };
}
