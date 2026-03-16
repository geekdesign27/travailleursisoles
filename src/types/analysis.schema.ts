import { z } from "zod";

// SUVA_REGULATORY_CONSTANT — DO NOT MODIFY
export const PERIODES_TRAVAIL = [
  "jour",
  "nuit",
  "weekend",
  "jour_ferie",
  "piquet",
] as const;

export const FREQUENCES_ACTIVITE = [
  "quotidienne",
  "hebdomadaire",
  "mensuelle",
  "occasionnelle",
  "exceptionnelle",
] as const;

export const ANALYSIS_STATUSES = [
  "draft",
  "in_progress",
  "completed",
  "archived",
] as const;

export const PeriodeTravail = z.enum(PERIODES_TRAVAIL);
export const FrequenceActivite = z.enum(FREQUENCES_ACTIVITE);
export const AnalysisStatus = z.enum(ANALYSIS_STATUSES);

export const AnalysisIdentificationSchema = z.object({
  entreprise: z.string().min(1, "Ce champ est requis").max(100),
  departement: z.string().max(100).default(""),
  responsable: z.string().min(1, "Ce champ est requis").max(100),
  titre_activite: z
    .string()
    .min(3, "Minimum 3 caractères")
    .max(150, "Maximum 150 caractères"),
  description: z.string().max(500).default(""),
  nombre_personnes: z
    .number({ invalid_type_error: "Veuillez entrer un nombre" })
    .min(1, "Minimum 1 personne"),
  periode_travail: PeriodeTravail,
  frequence_activite: FrequenceActivite,
});

export const Level1ResultSchema = z.object({
  blocked: z.boolean(),
  checkedCategories: z.array(z.string()),
  isMinor: z.boolean(),
});

export type Level1Result = z.infer<typeof Level1ResultSchema>;

export const AnalysisSchema = z.object({
  id: z.string().uuid(),
  entreprise: z.string().min(1).max(100),
  departement: z.string().max(100).default(""),
  responsable: z.string().min(1).max(100),
  titre_activite: z.string().min(3).max(150),
  description: z.string().max(500).default(""),
  nombre_personnes: z.number().min(1),
  periode_travail: PeriodeTravail,
  frequence_activite: FrequenceActivite,
  status: AnalysisStatus.default("draft"),
  currentStep: z.number().default(1),
  currentLevel: z.number().min(0).max(4).default(0),
  level1Result: Level1ResultSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Use z.input for form types (before Zod transforms/defaults are applied)
export type AnalysisIdentificationInput = z.input<
  typeof AnalysisIdentificationSchema
>;
export type AnalysisIdentification = z.infer<
  typeof AnalysisIdentificationSchema
>;
export type Analysis = z.infer<typeof AnalysisSchema>;
export type PeriodeTravailType = z.infer<typeof PeriodeTravail>;
export type FrequenceActiviteType = z.infer<typeof FrequenceActivite>;
export type AnalysisStatusType = z.infer<typeof AnalysisStatus>;
