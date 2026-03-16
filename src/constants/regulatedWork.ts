// SUVA_REGULATORY_CONSTANT — DO NOT MODIFY
// Source: SUVA 44094.F — Édition mai 2025
// 14 catégories de travaux réglementés — Gate Niveau 1

export interface RegulatedWorkCategory {
  id: number;
  label: string;
  reference: string;
  description: string;
}

export const REGULATED_WORK_CATEGORIES: RegulatedWorkCategory[] = [
  {
    id: 1,
    label: "Travaux en réservoirs ou locaux exigus",
    reference: "SUVA 1416.f ch. 2.3",
    description: "Travaux effectués dans des espaces confinés",
  },
  {
    id: 2,
    label: "Travaux de déconstruction",
    reference: "OTConst art. 81",
    description: "Démolition, déconstruction de structures",
  },
  {
    id: 3,
    label: "Travaux avec risque thermique élevé",
    reference: "OTConst art. 114",
    description: "Travaux à proximité de sources de chaleur extrême",
  },
  {
    id: 4,
    label: "Travaux sur cordes",
    reference: "OTConst art. 118",
    description: "Travaux en hauteur avec techniques d'accès par cordes",
  },
  {
    id: 5,
    label: "Travaux sur conduites sous pression",
    reference: "OTConst art. 119",
    description: "Interventions sur conduites de gaz, vapeur ou liquides",
  },
  {
    id: 6,
    label: "Travaux électriques BT sous tension",
    reference: "OIBT RS 734.27 art. 22",
    description: "Interventions sur installations électriques basse tension",
  },
  {
    id: 7,
    label: "Travaux forestiers dangereux",
    reference: "CFST 2134.f ch. 4.2.4",
    description: "Abattage, élagage et travaux forestiers à risque",
  },
  {
    id: 8,
    label: "Personnel mineur (< 18 ans)",
    reference: "Ordonnance protection jeunes travailleurs",
    description: "Toute activité isolée avec personnel de moins de 18 ans",
  },
  {
    id: 9,
    label: "Travaux en hauteur sans protection collective",
    reference: "OPA art. 8 al. 1 (RS 832.30)",
    description: "Travaux à plus de 2m sans garde-corps ou filets",
  },
  {
    id: 10,
    label: "Travaux de plongée",
    reference: "SUVA 2825.f",
    description: "Plongée professionnelle ou travaux subaquatiques",
  },
  {
    id: 11,
    label: "Travaux avec substances dangereuses",
    reference: "OChim RS 813.11",
    description: "Manipulation de produits chimiques à haut risque",
  },
  {
    id: 12,
    label: "Travaux d'excavation en profondeur",
    reference: "OTConst art. 60",
    description: "Fouilles, tranchées profondes > 1.5m",
  },
  {
    id: 13,
    label: "Travaux avec rayonnements ionisants",
    reference: "ORaP RS 814.501",
    description: "Activités exposant aux rayonnements ionisants",
  },
  {
    id: 14,
    label: "Travaux avec risque d'asphyxie",
    reference: "SUVA 44094.F ch. 3.1",
    description: "Environnements avec risque de déficit en oxygène",
  },
] as const;
