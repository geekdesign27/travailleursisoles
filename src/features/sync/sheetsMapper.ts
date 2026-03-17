// Maps Analysis objects to/from Google Sheets rows

import type { Analysis } from "@/types/analysis.schema";

/**
 * Column order for the "Analyses" sheet.
 * Each entry maps a sheet column header to the Analysis field path.
 */
export const COLUMN_MAPPING = [
  "id",
  "entreprise",
  "departement",
  "responsable",
  "titre_activite",
  "description",
  "nombre_personnes",
  "periode_travail",
  "frequence_activite",
  "status",
  "current_step",
  "current_level",
  "level1_blocked",
  "level1_checked_categories",
  "level1_is_minor",
  "level2_gravity",
  "level2_probability",
  "level2_zone",
  "level2_aptitudes_psychique",
  "level2_aptitudes_physique",
  "level2_aptitudes_intellectuelle",
  "level2_danger_description",
  "level2_danger_category",
  "level3_couverture_reseau",
  "level3_equipement_dati",
  "level3_centrale_alarme",
  "level3_delai_secouristes_jour",
  "level3_delai_secouristes_nuit",
  "level3_delai_secours_publics",
  "level3_delai_type_blessure",
  "level3_temps_sauvetage",
  "level3_tmax",
  "level3_feasible",
  "level3_reclassification_needed",
  "level3_new_zone",
  "level4_cognitive_load",
  "level4_equipment_type",
  "level4_validation_compatible",
  "level4_validation_status",
  "level4_validation_measures",
  "level4_validation_reason",
  "level4_corrective_measures",
  "doc_alerte",
  "doc_premier_secours",
  "doc_formation_text",
  "doc_acces_secours",
  "doc_date_formation",
  "doc_formateur",
  "doc_documentation",
  "doc_date_revision",
  "created_at",
  "updated_at",
] as const;

export function getHeaderRow(): string[] {
  return [...COLUMN_MAPPING];
}

export function analysisToSheetRow(analysis: Analysis): string[] {
  const s = (val: unknown): string => {
    if (val === undefined || val === null) return "";
    if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
    if (Array.isArray(val)) return val.join(", ");
    return String(val);
  };

  const l1 = analysis.level1Result;
  const l2 = analysis.level2Result;
  const l3 = analysis.level3Result;
  const l4 = analysis.level4Result;
  const doc = analysis.documentation;

  return [
    analysis.id,
    analysis.entreprise,
    analysis.departement,
    analysis.responsable,
    analysis.titre_activite,
    analysis.description,
    s(analysis.nombre_personnes),
    analysis.periode_travail,
    analysis.frequence_activite,
    analysis.status,
    s(analysis.currentStep),
    s(analysis.currentLevel),
    // Level 1
    s(l1?.blocked),
    s(l1?.checkedCategories),
    s(l1?.isMinor),
    // Level 2
    s(l2?.gravity),
    s(l2?.probability),
    s(l2?.zone),
    s(l2?.aptitudes?.psychique),
    s(l2?.aptitudes?.physique),
    s(l2?.aptitudes?.intellectuelle),
    s(l2?.dangerDescription),
    s(l2?.dangerCategory),
    // Level 3
    s(l3?.operationalConditions?.couvertureReseau),
    s(l3?.operationalConditions?.equipementDATI),
    s(l3?.operationalConditions?.centraleAlarme),
    s(l3?.operationalConditions?.delaiSecouristesJour),
    s(l3?.operationalConditions?.delaiSecouristesNuit),
    s(l3?.operationalConditions?.delaiSecoursPublics),
    s(l3?.operationalConditions?.delaiTypeBlessure),
    s(l3?.operationalConditions?.tempsSauvetage),
    s(l3?.tmaxResult?.tmax),
    s(l3?.tmaxResult?.feasible),
    s(l3?.tmaxResult?.reclassificationNeeded),
    s(l3?.tmaxResult?.newZone),
    // Level 4
    s(l4?.cognitiveLoad),
    s(l4?.equipmentType),
    s(l4?.validationResult?.compatible),
    s(l4?.validationResult?.status),
    s(l4?.validationResult?.measures),
    s(l4?.validationResult?.reason),
    s(l4?.correctiveMeasures),
    // Documentation
    s(doc?.emergencyConcept?.alerte),
    s(doc?.emergencyConcept?.premierSecours),
    s(doc?.emergencyConcept?.formation),
    s(doc?.emergencyConcept?.accesSecours),
    s(doc?.trainingDoc?.dateFormation),
    s(doc?.trainingDoc?.formateur),
    s(doc?.trainingDoc?.documentation),
    s(doc?.trainingDoc?.dateRevision),
    // Timestamps
    analysis.createdAt,
    analysis.updatedAt,
  ];
}

function parseBool(val: string): boolean {
  return val === "TRUE" || val === "true";
}

function parseNum(val: string): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function parseStringArray(val: string): string[] {
  if (!val) return [];
  return val.split(", ").filter(Boolean);
}

function parseZone(val: string): 1 | 2 | "3a" | "3b" | 4 | undefined {
  if (val === "") return undefined;
  if (val === "3a" || val === "3b") return val;
  const n = Number(val);
  if (n === 1 || n === 2 || n === 4) return n;
  return undefined;
}

export function sheetRowToAnalysis(row: string[]): Analysis {
  const get = (idx: number): string => row[idx] ?? "";

  const analysis: Analysis = {
    id: get(0),
    entreprise: get(1),
    departement: get(2),
    responsable: get(3),
    titre_activite: get(4),
    description: get(5),
    nombre_personnes: parseNum(get(6)),
    periode_travail: get(7) as Analysis["periode_travail"],
    frequence_activite: get(8) as Analysis["frequence_activite"],
    status: (get(9) || "draft") as Analysis["status"],
    currentStep: parseNum(get(10)) || 1,
    currentLevel: parseNum(get(11)),
    createdAt: get(49) || new Date().toISOString(),
    updatedAt: get(50) || new Date().toISOString(),
  };

  // Level 1
  if (get(12) !== "") {
    analysis.level1Result = {
      blocked: parseBool(get(12)),
      checkedCategories: parseStringArray(get(13)),
      isMinor: parseBool(get(14)),
    };
  }

  // Level 2
  if (get(15) !== "") {
    analysis.level2Result = {
      gravity: get(15) as "I" | "II" | "III" | "IV" | "V",
      probability: get(16) as "A" | "B" | "C" | "D" | "E",
      zone: parseZone(get(17))!,
      aptitudes: {
        psychique: parseBool(get(18)),
        physique: parseBool(get(19)),
        intellectuelle: parseBool(get(20)),
      },
      dangerDescription: get(21),
      dangerCategory: get(22) as Analysis["level2Result"] extends
        | { dangerCategory: infer T }
        | undefined
        ? T
        : never,
    };
  }

  // Level 3
  if (get(23) !== "") {
    analysis.level3Result = {
      operationalConditions: {
        couvertureReseau: get(23) as Analysis["level3Result"] extends
          | {
              operationalConditions: { couvertureReseau: infer T };
            }
          | undefined
          ? T
          : never,
        equipementDATI: get(24),
        centraleAlarme: parseBool(get(25)),
        delaiSecouristesJour: parseNum(get(26)),
        delaiSecouristesNuit: parseNum(get(27)),
        delaiSecoursPublics: parseNum(get(28)),
        delaiTypeBlessure: parseNum(get(29)),
        tempsSauvetage: parseNum(get(30)),
      },
      tmaxResult: {
        tmax: parseNum(get(31)),
        feasible: parseBool(get(32)),
        reclassificationNeeded: parseBool(get(33)),
        newZone: parseZone(get(34)),
      },
    };
  }

  // Level 4
  if (get(35) !== "") {
    analysis.level4Result = {
      cognitiveLoad: get(35) as "C1" | "C2" | "C3",
      equipmentType: get(36),
      validationResult: {
        compatible: parseBool(get(37)),
        status: get(38) as "compatible" | "incompatible" | "with_reserves",
        measures: parseStringArray(get(39)),
        reason: get(40),
      },
      correctiveMeasures: get(41),
    };
  }

  // Documentation
  if (get(42) !== "" || get(45) !== "") {
    analysis.documentation = {
      emergencyConcept: {
        alerte: get(42),
        premierSecours: get(43),
        formation: get(44),
        accesSecours: get(45),
      },
      trainingDoc: {
        dateFormation: get(46),
        formateur: get(47),
        documentation: get(48),
        dateRevision: get(49),
      },
    };
  }

  return analysis;
}
