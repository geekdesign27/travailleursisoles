// SUVA_REGULATORY_CONSTANT — DO NOT MODIFY
// Source: SUVA 44094.F — Édition mai 2025
// Types d'équipements DATI (Dispositif d'Alarme pour Travailleur Isolé)

export interface DatiType {
  id: string;
  label: string;
  description: string;
  reliabilityFactor: number; // 0-1
}

// SUVA_REGULATORY_CONSTANT — DO NOT MODIFY
export const DATI_TYPES: readonly DatiType[] = [
  {
    id: "pti",
    label: "PTI (Protection du Travailleur Isolé)",
    description:
      "Dispositif dédié avec détection automatique de perte de verticalité et absence de mouvement.",
    reliabilityFactor: 0.95,
  },
  {
    id: "gsm_smartphone",
    label: "GSM / Smartphone",
    description:
      "Téléphone mobile avec application d'alerte ou appel d'urgence standard.",
    reliabilityFactor: 0.7,
  },
  {
    id: "radio",
    label: "Radio",
    description:
      "Radio portative permettant une communication vocale avec un poste de surveillance.",
    reliabilityFactor: 0.75,
  },
  {
    id: "homme_mort",
    label: "Dispositif homme-mort",
    description:
      "Dispositif nécessitant une action régulière pour confirmer la conscience du travailleur.",
    reliabilityFactor: 0.9,
  },
  {
    id: "alerte_manuelle",
    label: "Alerte manuelle",
    description:
      "Bouton ou dispositif à actionnement manuel (tirette, bouton poussoir).",
    reliabilityFactor: 0.6,
  },
  {
    id: "autre",
    label: "Autre",
    description: "Autre type de dispositif d'alerte non listé.",
    reliabilityFactor: 0.5,
  },
] as const;
