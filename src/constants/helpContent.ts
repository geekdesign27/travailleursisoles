// Contextual help content for wizard fields (SUVA 44094.F references)

export interface HelpItem {
  title: string;
  content: string;
  example?: string;
  reference?: string;
}

export const HELP_CONTENT: Record<string, HelpItem> = {
  // Step 1 — Identification
  entreprise: {
    title: "Entreprise",
    content:
      "Raison sociale de l'entreprise pour laquelle l'analyse est effectuée.",
    example: "Dupont SA",
  },
  departement: {
    title: "Département",
    content:
      "Unité organisationnelle ou service concerné par l'activité isolée.",
    example: "Maintenance industrielle",
  },
  responsable: {
    title: "Responsable",
    content:
      "Personne en charge de l'analyse et responsable de la mise en oeuvre des mesures.",
    example: "Jean Dupont, responsable sécurité",
  },
  titre_activite: {
    title: "Titre de l'activité",
    content:
      "Décrivez la tâche isolée analysée de manière concise et identifiable.",
    example: "Ronde de surveillance nocturne — bâtiment B",
    reference: "SUVA 44094.F ch. 1",
  },
  description: {
    title: "Description",
    content:
      "Description détaillée de l'activité, du lieu et des conditions dans lesquelles elle se déroule.",
  },
  nombre_personnes: {
    title: "Nombre de personnes",
    content:
      "Nombre de travailleurs effectuant cette tâche de manière isolée. Indiquez le nombre total de personnes concernées par cette analyse.",
  },
  periode_travail: {
    title: "Période de travail",
    content:
      "La période pendant laquelle l'activité isolée a lieu. Ce critère influence les délais de secours et les mesures de surveillance.",
    reference: "SUVA 44094.F ch. 2.1",
  },
  frequence_activite: {
    title: "Fréquence d'activité",
    content:
      "À quelle fréquence cette activité isolée est-elle pratiquée. Une fréquence élevée peut nécessiter des mesures permanentes.",
  },

  // Step 2 — Level 1 Gate
  travaux_reglementes: {
    title: "Travaux réglementés",
    content:
      "Activités soumises à une autorisation spéciale ou interdites en travail isolé selon la législation suisse (OTConst, OIBT, etc.).",
    reference: "OTConst art. 5",
  },
  personnel_mineur: {
    title: "Personnel mineur",
    content:
      "Travailleurs de moins de 18 ans. Le travail isolé est strictement interdit pour les mineurs.",
    reference: "OLT 4, art. 4 al. 1",
  },

  // Step 3 — Level 2 Risk
  aptitude_psychique: {
    title: "Aptitude psychique",
    content:
      "Capacité mentale à travailler seul : gestion du stress, de l'isolement et des situations imprévues.",
  },
  aptitude_physique: {
    title: "Aptitude physique",
    content:
      "Condition physique adaptée à l'activité et à l'environnement de travail isolé.",
  },
  aptitude_intellectuelle: {
    title: "Aptitude intellectuelle",
    content:
      "Compréhension des consignes de sécurité, des risques et des procédures d'urgence.",
  },
  gravite: {
    title: "Gravité du dommage",
    content:
      "Estimation de la gravité maximale du dommage que pourrait subir le travailleur isolé en cas d'événement dangereux.",
    reference: "SUVA 44094.F ch. 3.2",
  },
  probabilite: {
    title: "Probabilité d'accident",
    content:
      "Estimation de la probabilité qu'un événement dangereux survienne lors du travail isolé.",
    reference: "SUVA 44094.F ch. 3.3",
  },
  danger_description: {
    title: "Description du danger",
    content:
      "Description précise du danger identifié, en 150-300 caractères. Soyez factuel et spécifique.",
  },
  danger_category: {
    title: "Catégorie de danger",
    content:
      "Classez le danger principal dans l'une des catégories prédéfinies (mécanique, électrique, chute, etc.).",
  },

  // Step 4 — Level 3 Rescue
  couverture_reseau: {
    title: "Couverture réseau",
    content:
      "Qualité de la couverture téléphonique ou radio sur le lieu de travail. Détermine la fiabilité des communications d'urgence.",
  },
  delai_secouristes: {
    title: "Délai secouristes",
    content:
      "Temps nécessaire pour que les secouristes internes arrivent sur le lieu de l'incident.",
    reference: "SUVA 44094.F ch. 4.2",
  },
  delai_secours_publics: {
    title: "Délai secours publics",
    content:
      "Temps d'intervention des services de secours externes (ambulance, pompiers, Rega).",
  },
  delai_type_blessure: {
    title: "Délai type blessure",
    content:
      "Temps maximal tolérable avant intervention selon le type de blessure possible (ex. : arrêt cardiaque = 4 min).",
  },
  temps_sauvetage: {
    title: "Temps de sauvetage",
    content:
      "Durée estimée de l'opération de sauvetage elle-même (extraction, mise en sécurité).",
  },
  equipement_dati: {
    title: "Équipement DATI",
    content:
      "Dispositif d'Alerte pour Travailleur Isolé. Appareil permettant de détecter une situation d'urgence et de déclencher une alerte automatiquement.",
  },
  centrale_alarme: {
    title: "Centrale d'alarme",
    content:
      "Existence d'une centrale de réception des alarmes capable de traiter les alertes 24h/24.",
  },

  // Step 5 — Level 4 Alert
  charge_cognitive: {
    title: "Charge cognitive",
    content:
      "Niveau de concentration requis par la tâche. Une charge cognitive élevée peut empêcher le travailleur de déclencher manuellement une alerte.",
    reference: "SUVA 44094.F ch. 5",
  },
  equipment_type: {
    title: "Type d'équipement DATI",
    content:
      "Le type de dispositif d'alerte choisi doit être compatible avec la zone de risque, la couverture réseau et la charge cognitive.",
  },
  corrective_measures: {
    title: "Mesures correctives",
    content:
      "Actions planifiées pour corriger les incompatibilités identifiées entre l'équipement et les conditions de travail.",
  },
};
