// SUVA_REGULATORY_CONSTANT — DO NOT MODIFY
// Source: SUVA 44094.F — Édition mai 2025
// 7 règles de conformité non négociables

export interface SuvaRule {
  id: string;
  code: string;
  description: string;
  consequence: string;
  reference: string;
}

export const SUVA_RULES: SuvaRule[] = [
  {
    id: "R1",
    code: "R1",
    description:
      "Travail réglementé = OUI → Zone 1 forcée, aucune exception possible",
    consequence: "Zone 1 obligatoire — travail isolé interdit",
    reference: "SUVA 44094.F ch. 3.1",
  },
  {
    id: "R2",
    code: "R2",
    description: "Personnel < 18 ans → Zone 1 obligatoire",
    consequence: "Zone 1 obligatoire — travail isolé interdit pour mineurs",
    reference: "Ordonnance protection jeunes travailleurs",
  },
  {
    id: "R3",
    code: "R3",
    description:
      "Zone 1 : la surveillance ne remplace pas la présence d'une 2e personne",
    consequence:
      "Aucun dispositif technique ne peut substituer la présence physique",
    reference: "SUVA 44094.F ch. 3.2",
  },
  {
    id: "R4",
    code: "R4",
    description:
      "t_max ≤ 0 → Zone 3 impossible → reclassement automatique en Zone 2",
    consequence: "Reclassement Zone 3 → Zone 2",
    reference: "SUVA 44094.F ch. 5.3",
  },
  {
    id: "R5",
    code: "R5",
    description:
      "Délai secours > 15 min en Zone 2 → avertissement ch. 7.2 SUVA",
    consequence: "Avertissement affiché — mesures correctives recommandées",
    reference: "SUVA 44094.F ch. 7.2",
  },
  {
    id: "R6",
    code: "R6",
    description: "La matrice SUVA 5×5 n'est pas modifiable par l'utilisateur",
    consequence: "Constante réglementaire verrouillée",
    reference: "SUVA 44094.F ch. 4",
  },
  {
    id: "R7",
    code: "R7",
    description:
      'Tout rapport doit mentionner "SUVA 44094.F — Édition mai 2025"',
    consequence: "Référence obligatoire dans le rapport généré",
    reference: "SUVA 44094.F",
  },
] as const;
