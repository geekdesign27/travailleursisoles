# Story 1.1: Scaffold projet et création d'analyse

Status: ready-for-dev

## Story

As a spécialiste STPS,
I want to créer une nouvelle analyse en identifiant le lieu, le département, la tâche et la période,
So that je puisse commencer une évaluation structurée de travailleur isolé selon SUVA 44094.F.

## Acceptance Criteria

### AC 1: Configuration initiale du projet Shadcn CLI v4

```gherkin
Given   le projet est initialisé avec Shadcn CLI v4 (React 19, TypeScript, Vite 8, Tailwind v4)
When    le développeur lance `npm run dev`
Then    l'application démarre sans erreur avec la route `/` (dashboard vide) et `/analysis/new` (wizard)
And     les design tokens sont configurés (couleurs SUVA, typographie Inter, espacement 4px) dans les CSS variables
And     les composants Shadcn UI nécessaires sont installés (Button, Card, Form, Input, Label, Select, Badge, Toast, Progress, Separator)
```

### AC 2: Formulaire d'identification et création d'analyse

```gherkin
Given   le spécialiste accède à `/analysis/new`
When    il remplit le formulaire d'identification (entreprise, département, responsable, titre activité, description, nombre de personnes, période, fréquence)
Then    les données sont validées par le schéma Zod `AnalysisSchema`
And     une nouvelle analyse est créée avec un UUID et sauvegardée dans localStorage
And     le wizard affiche les boutons Primary "Suivant" (à droite) et Secondary "Précédent" (à gauche)
And     les messages de validation sont en français ("Ce champ est requis")
```

### AC 3: Navigation vers l'étape suivante

```gherkin
Given   une analyse est créée avec le formulaire d'identification valide
When    le spécialiste clique "Suivant"
Then    le formulaire est validé (inline au blur + global au submit)
And     le spécialiste est redirigé vers la première étape du Niveau 1
And     la page scroll en haut automatiquement
```

## Références FR couvertes

| FR | Couverture |
|----|-----------|
| FR1 | 100% — Formulaire d'identification complet |
| FR2 | Partiel — Saisie période (TÂCHE × PÉRIODE combinaison Niveau 2+) |
| FR25-26 | Fondation — Constantes SUVA créées, non utilisées à ce stade |
| FR29 | Fondation — Schema localStorage défini |
| FR34 | Fondation — 100% offline, zéro appel API |

## Tasks / Subtasks

- [ ] **Task 1 — Initialisation projet** (AC: 1)
  - [ ] 1.1 Créer le projet Vite 8 + React 19 + TypeScript
  - [ ] 1.2 Installer et configurer TailwindCSS v4 via `@tailwindcss/vite`
  - [ ] 1.3 Initialiser Shadcn UI CLI (`npx shadcn@latest init`)
  - [ ] 1.4 Installer les composants Shadcn requis (Button, Card, Form, Input, Label, Select, Badge, Toast, Progress, Separator)
  - [ ] 1.5 Configurer path aliases `@/` dans `vite.config.ts` et `tsconfig.json`
  - [ ] 1.6 Installer la police Inter (Google Fonts variable)

- [ ] **Task 2 — Design tokens SUVA** (AC: 1)
  - [ ] 2.1 Configurer les CSS variables dans `src/index.css` via `@theme inline` et `:root`
  - [ ] 2.2 Ajouter la palette sémantique SUVA (Zone 1-4 + utilitaires)
  - [ ] 2.3 Configurer l'échelle typographique (8 niveaux, Inter)
  - [ ] 2.4 Configurer l'espacement base 4px

- [ ] **Task 3 — Structure de dossiers feature-based** (AC: 1)
  - [ ] 3.1 Créer l'arborescence `/src/features/{wizard,engine,persistence,report,config,dashboard,help}/`
  - [ ] 3.2 Créer `/src/constants/` avec fichiers SUVA_CONST
  - [ ] 3.3 Créer `/src/contexts/` avec stubs pour les 3 contextes
  - [ ] 3.4 Créer `/src/types/` pour les schémas Zod
  - [ ] 3.5 Créer `/src/components/shared/` pour les composants métier

- [ ] **Task 4 — Schéma Zod et types** (AC: 2)
  - [ ] 4.1 Créer `src/types/analysis.schema.ts` avec `AnalysisSchema` complet
  - [ ] 4.2 Dériver les types TypeScript via `z.infer<typeof AnalysisSchema>`
  - [ ] 4.3 Définir les enums (périodes, fréquences, statuts)

- [ ] **Task 5 — Constantes réglementaires SUVA** (AC: 1)
  - [ ] 5.1 Créer `src/constants/suvaMatrix.ts` — Matrice 5×5 (25 cellules)
  - [ ] 5.2 Créer `src/constants/suvaZones.ts` — Zones Z1-Z4 descriptions + couleurs
  - [ ] 5.3 Créer `src/constants/suvaRules.ts` — 7 règles R1-R7
  - [ ] 5.4 Créer `src/constants/regulatedWork.ts` — 14 catégories travaux réglementés + refs légales
  - [ ] 5.5 Créer `src/constants/gravityLevels.ts` — Gravité I-V
  - [ ] 5.6 Créer `src/constants/probabilityLevels.ts` — Probabilité A-E
  - [ ] 5.7 Annoter chaque fichier `// SUVA_REGULATORY_CONSTANT — DO NOT MODIFY`

- [ ] **Task 6 — Routing React Router v7** (AC: 1, 3)
  - [ ] 6.1 Installer React Router v7
  - [ ] 6.2 Configurer les routes dans `src/App.tsx` :
    - `/` → Dashboard (placeholder)
    - `/analysis/new` → Formulaire création (Story 1.1)
    - `/analysis/:id` → Résumé/reprise (placeholder)
    - `/analysis/:id/level-:level` → Wizard étapes (placeholder)
    - `/analysis/:id/report` → Rapport (placeholder)
    - `/config` → Configuration (placeholder)
    - `/onboarding` → Onboarding (placeholder)

- [ ] **Task 7 — AnalysisContext + useReducer** (AC: 2)
  - [ ] 7.1 Créer `src/contexts/AnalysisContext.tsx` avec `useReducer`
  - [ ] 7.2 Définir actions : `CREATE_ANALYSIS`, `UPDATE_FIELD`, `SET_STEP`
  - [ ] 7.3 Créer le provider `<AnalysisProvider>` wrapping l'app

- [ ] **Task 8 — Formulaire d'identification** (AC: 2, 3)
  - [ ] 8.1 Créer `src/features/wizard/steps/Step01Identification.tsx`
  - [ ] 8.2 Intégrer React Hook Form + Zod resolver (`@hookform/resolvers/zod`)
  - [ ] 8.3 Implémenter les champs : entreprise, département, responsable, titre_activite, description, nombre_personnes, periode_travail, frequence_activite
  - [ ] 8.4 Validation inline au blur + global au submit
  - [ ] 8.5 Messages d'erreur en français
  - [ ] 8.6 Boutons Primary "Suivant" (droite) / Secondary "Précédent" (gauche, désactivé sur step 1)

- [ ] **Task 9 — Persistence localStorage** (AC: 2)
  - [ ] 9.1 Créer `src/features/persistence/localStorageService.ts`
  - [ ] 9.2 Implémenter le CRUD : `saveAnalysis`, `loadAnalysis`, `listAnalyses`, `deleteAnalysis`
  - [ ] 9.3 Schema localStorage : `app:analysis:{uuid}` (contenu JSON), `app:analyses:index` (liste métadonnées)
  - [ ] 9.4 Générer UUID via `crypto.randomUUID()`

- [ ] **Task 10 — Layout wizard et navigation** (AC: 1, 3)
  - [ ] 10.1 Créer `src/features/wizard/WizardLayout.tsx` (2 colonnes desktop : 65% wizard + 35% sidebar placeholder)
  - [ ] 10.2 Créer `src/features/wizard/WizardNavigation.tsx` (boutons Suivant/Précédent + scroll top)
  - [ ] 10.3 Créer stub `src/features/wizard/WizardSidebar.tsx` (placeholder pour Story 1.8)
  - [ ] 10.4 Implémenter la navigation : validation → sauvegarde → redirect vers level-1
  - [ ] 10.5 Responsive : 2 colonnes ≥1024px, 1 colonne + drawer <1024px

- [ ] **Task 11 — Tests** (AC: 1, 2, 3)
  - [ ] 11.1 Configurer Vitest (`vitest.config.ts`)
  - [ ] 11.2 Tests unitaires Zod : schéma valide/invalide, edge cases
  - [ ] 11.3 Tests unitaires localStorage : CRUD, UUID unique, sérialisation
  - [ ] 11.4 Tests unitaires constantes SUVA : intégrité matrice 25 cellules, 7 règles, 14 travaux
  - [ ] 11.5 Configurer Playwright (`playwright.config.ts`) + test e2e basique : création analyse

- [ ] **Task 12 — Accessibilité et finitions** (AC: 1, 2, 3)
  - [ ] 12.1 Focus ring visible (`ring-2 ring-offset-2 ring-orange-500`)
  - [ ] 12.2 Skip link "Aller au contenu principal"
  - [ ] 12.3 ARIA labels : `role="form"`, `aria-label` sur wizard, stepper, sidebar
  - [ ] 12.4 Navigation clavier : Tab/Shift+Tab, Enter, Escape
  - [ ] 12.5 `prefers-reduced-motion` : désactiver transitions CSS
  - [ ] 12.6 Zones tactiles minimum 44×44px (desktop), 48×48px (tablette)
  - [ ] 12.7 Sémantique HTML : `<main>`, `<nav>`, `<form>`, `<fieldset>`, `<legend>`

## Dev Notes

### Stack technique exacte — Versions confirmées

| Package | Version | Notes |
|---------|---------|-------|
| React | 19.x | React 19 stable (fourni par Shadcn CLI init) |
| TypeScript | 5.x | Mode strict obligatoire |
| Vite | 8.x | Rolldown intégré nativement (pas de package séparé) |
| TailwindCSS | 4.x | Config CSS-first, plugin `@tailwindcss/vite`, PAS de `tailwind.config.js` |
| Shadcn UI | v4 (CLI) | `npx shadcn@latest init`, composants copiés dans `/src/components/ui/` |
| Radix UI | Package unifié `radix-ui` | Remplace les anciens `@radix-ui/react-*` individuels |
| React Router | v7 | Routing client-side, pas de data loading serveur |
| React Hook Form | latest | Intégration Zod via `@hookform/resolvers/zod` |
| Zod | latest | Source de vérité unique pour types + validation |
| Vitest | latest | Natif Vite, tests unitaires |
| Playwright | latest | Tests e2e multi-navigateur |

### Commandes d'initialisation exactes

```bash
# 1. Créer le projet Vite
npm create vite@latest analyse-travailleurs-isoles -- --template react-ts
cd analyse-travailleurs-isoles

# 2. Installer Tailwind CSS v4 + plugin Vite
npm install tailwindcss @tailwindcss/vite

# 3. Initialiser Shadcn UI
npx shadcn@latest init

# 4. Installer les composants Shadcn requis
npx shadcn@latest add button card form input label select badge toast progress separator

# 5. Installer les dépendances métier
npm install react-router zod @hookform/resolvers react-hook-form

# 6. Installer les dépendances dev
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom playwright @playwright/test
```

### Configuration Vite 8 — `vite.config.ts`

```typescript
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### Configuration CSS — `src/index.css`

Tailwind v4 utilise `@theme inline` (PAS `@theme {}`) avec des CSS variables OKLch.
Shadcn UI v4 génère automatiquement la structure CSS. Ajouter les tokens SUVA **après** les tokens Shadcn générés :

```css
/* Tokens SUVA custom à ajouter dans :root {} */
:root {
  /* ... tokens Shadcn générés automatiquement ... */

  /* SUVA Zone Colors */
  --suva-zone-1: oklch(0.45 0.2 25);      /* Rouge foncé #C00000 */
  --suva-zone-2: oklch(0.7 0.18 60);      /* Orange vif #FF8C00 */
  --suva-zone-3: oklch(0.82 0.15 85);     /* Jaune ambre #FFC000 */
  --suva-zone-4: oklch(0.65 0.15 140);    /* Vert #70AD47 */

  /* SUVA Primary */
  --suva-primary: oklch(0.6 0.2 45);      /* Orange SUVA #E36C09 */
  --suva-primary-hover: oklch(0.52 0.18 42); /* Orange foncé #C45A07 */

  /* Semantic */
  --suva-success: oklch(0.55 0.17 145);   /* #16A34A */
  --suva-warning: oklch(0.6 0.16 70);     /* #D97706 */
  --suva-error: oklch(0.55 0.22 25);      /* #DC2626 */
  --suva-info: oklch(0.5 0.2 260);        /* #2563EB */
  --suva-const: oklch(0.65 0.02 260);     /* #94A3B8 — gris SUVA_CONST */
}

/* Enregistrer dans @theme inline pour que Tailwind génère les utilitaires */
@theme inline {
  /* ... tokens Shadcn ... */
  --color-suva-zone-1: var(--suva-zone-1);
  --color-suva-zone-2: var(--suva-zone-2);
  --color-suva-zone-3: var(--suva-zone-3);
  --color-suva-zone-4: var(--suva-zone-4);
  --color-suva-primary: var(--suva-primary);
  --color-suva-primary-hover: var(--suva-primary-hover);
  --color-suva-success: var(--suva-success);
  --color-suva-warning: var(--suva-warning);
  --color-suva-error: var(--suva-error);
  --color-suva-info: var(--suva-info);
  --color-suva-const: var(--suva-const);
}
```

Cela permet d'utiliser `bg-suva-zone-1`, `text-suva-primary`, etc. dans les classes Tailwind.

### Schéma Zod — `src/types/analysis.schema.ts`

```typescript
import { z } from 'zod'

export const PeriodeTravail = z.enum([
  'jour', 'nuit', 'weekend', 'jour_ferie', 'piquet'
])

export const FrequenceActivite = z.enum([
  'quotidienne', 'hebdomadaire', 'mensuelle', 'occasionnelle', 'exceptionnelle'
])

export const AnalysisStatus = z.enum([
  'draft', 'in_progress', 'completed', 'archived'
])

export const AnalysisIdentificationSchema = z.object({
  entreprise: z.string().min(1, "Ce champ est requis").max(100),
  departement: z.string().max(100).optional(),
  responsable: z.string().min(1, "Ce champ est requis").max(100),
  titre_activite: z.string().min(3, "Minimum 3 caractères").max(150),
  description: z.string().max(500).optional(),
  nombre_personnes: z.number().min(1, "Minimum 1 personne"),
  periode_travail: PeriodeTravail,
  frequence_activite: FrequenceActivite,
})

export const AnalysisSchema = z.object({
  id: z.string().uuid(),
  ...AnalysisIdentificationSchema.shape,
  status: AnalysisStatus.default('draft'),
  currentStep: z.number().default(1),
  currentLevel: z.number().min(0).max(4).default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Niveaux 1-4 ajoutés par les stories suivantes
})

export type AnalysisIdentification = z.infer<typeof AnalysisIdentificationSchema>
export type Analysis = z.infer<typeof AnalysisSchema>
export type PeriodeTravailType = z.infer<typeof PeriodeTravail>
export type FrequenceActiviteType = z.infer<typeof FrequenceActivite>
```

### localStorage — Schema des clés

| Clé | Contenu | Format |
|-----|---------|--------|
| `app:analysis:{uuid}` | Analyse complète sérialisée | JSON `Analysis` |
| `app:analyses:index` | Index des analyses | `{ id, titre_activite, status, updatedAt }[]` |
| `app:config` | Configuration entreprise | JSON (Story 4.x) |

Préfixe `app:` obligatoire pour éviter les collisions.

### Structure de fichiers à créer

```
src/
├── main.tsx                               → Point d'entrée
├── App.tsx                                → Router React Router v7
├── index.css                              → @import "tailwindcss" + tokens SUVA
├── components/
│   ├── ui/                                → Shadcn UI (auto-généré par CLI)
│   └── shared/
│       └── AppLayout.tsx                  → Layout responsive 3 breakpoints
├── constants/
│   ├── suvaMatrix.ts                      → Matrice 5×5 (25 cellules)
│   ├── suvaZones.ts                       → Descriptions Z1-Z4 + couleurs
│   ├── suvaRules.ts                       → R1-R7
│   ├── regulatedWork.ts                   → 14 travaux réglementés + refs
│   ├── gravityLevels.ts                   → Gravité I-V
│   └── probabilityLevels.ts              → Probabilité A-E
├── contexts/
│   ├── AnalysisContext.tsx                 → Context + useReducer
│   ├── ConfigContext.tsx                   → Stub (Story 4.x)
│   └── AppContext.tsx                      → Stub (Story 5.x)
├── features/
│   ├── wizard/
│   │   ├── WizardLayout.tsx               → 2 colonnes (65% + 35%)
│   │   ├── WizardNavigation.tsx           → Suivant/Précédent + scroll top
│   │   ├── WizardSidebar.tsx              → Placeholder (Story 1.8)
│   │   └── steps/
│   │       └── Step01Identification.tsx   → Formulaire React Hook Form + Zod
│   ├── persistence/
│   │   └── localStorageService.ts         → CRUD localStorage
│   ├── engine/                            → Vide (Story 1.2+)
│   ├── report/                            → Vide (Story 2.x)
│   ├── config/                            → Vide (Story 4.x)
│   ├── dashboard/
│   │   └── DashboardPage.tsx              → Placeholder "Aucune analyse"
│   └── help/                              → Vide (Story 6.x)
├── types/
│   └── analysis.schema.ts                → Schéma Zod source de vérité
└── lib/
    └── utils.ts                           → cn() helper (généré par Shadcn)
```

### Anti-patterns à éviter absolument

| Anti-pattern | Faire à la place |
|-------------|------------------|
| Créer `tailwind.config.js` | Tailwind v4 = CSS-first, config dans `index.css` via `@theme inline` |
| Installer `@radix-ui/react-*` séparément | Shadcn CLI gère les dépendances Radix automatiquement |
| Utiliser `postcss.config.js` | Tailwind v4 via `@tailwindcss/vite` plugin, pas PostCSS |
| Créer un fichier `utils.ts` fourre-tout | Modules spécifiques par feature |
| Stocker des données calculées dans localStorage | Recalculer à partir des données sources |
| Mélanger logique métier et composants UI | Séparer dans `/features/engine/` |
| Utiliser `any` TypeScript | Toujours typer via schémas Zod + `z.infer` |
| Utiliser `undefined` pour absence | Utiliser `null` pour valeurs explicitement absentes |
| Créer `tailwind.config.ts` | N'EXISTE PAS en Tailwind v4 — tout est dans le CSS |
| Messages d'erreur en anglais | Tous les messages user-facing en français |

### Conventions de nommage

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Composants React | PascalCase.tsx | `WizardLayout.tsx` |
| Hooks | use + camelCase.ts | `useWizardForm.ts` |
| Fonctions pures | camelCase.ts | `matrixCalculator.ts` |
| Types/interfaces | PascalCase | `Analysis`, `WizardStep` |
| Constantes SUVA | SCREAMING_SNAKE_CASE | `SUVA_MATRIX`, `ZONE_DESCRIPTIONS` |
| Props interfaces | PascalCase + Props | `RiskMatrixProps` |
| Actions reducer | DOMAIN/ACTION | `'wizard/SET_STEP'` |
| Clés localStorage | app:resource:id | `app:analysis:uuid-here` |
| Tests | co-localisés *.test.ts | `localStorageService.test.ts` |

### Accessibilité WCAG 2.1 AA — Checklist Story 1.1

- [ ] Contraste texte principal (#1E293B) sur blanc : 12.6:1 (AAA)
- [ ] Contraste texte secondaire (#64748B) sur blanc : 4.6:1 (AA)
- [ ] Focus ring visible sur tous les éléments interactifs
- [ ] Skip link "Aller au contenu principal"
- [ ] Navigation clavier 100% (Tab, Shift+Tab, Enter, Escape)
- [ ] Labels `<label>` visibles sur chaque champ (jamais placeholder-as-label)
- [ ] `aria-describedby` pour messages d'erreur liés aux champs
- [ ] `role="form"` + `aria-label="Identification de l'analyse"` sur le formulaire
- [ ] `prefers-reduced-motion` : désactiver transitions
- [ ] Zones tactiles ≥44×44px (desktop), ≥48×48px (tablette)
- [ ] HTML sémantique : `<main>`, `<nav>`, `<form>`, `<fieldset>`, `<legend>`

### Responsive — 3 Breakpoints

| Breakpoint | Layout wizard | Sidebar |
|-----------|--------------|---------|
| ≥1024px (desktop) | 2 colonnes : wizard 65% (max 720px) + sidebar 35% | Fixe visible |
| 768-1023px (tablette paysage) | 1 colonne pleine largeur | Sheet drawer toggle |
| <768px (tablette portrait) | 1 colonne, padding 16px | FAB + Sheet bottom |

### Performance targets

| Métrique | Cible |
|---------|-------|
| Chargement initial | < 2s sur 4G |
| Transition étapes | < 100ms |
| Sauvegarde localStorage | < 100ms (non bloquant) |
| Bundle gzip | < 200KB |

### Dépendances

**Bloqué par :** Aucun (story de démarrage)

**Bloque :**
- Story 1.2 (Niveau 1 gate réglementaire) — utilise les constantes SUVA, le routing, le schema
- Story 1.3-1.5 (Niveaux 2-4) — utilise le wizard layout, le contexte, la persistence
- Story 1.7 (Navigation wizard avancée) — étend WizardStepper créé ici
- Story 1.8 (Sidebar résumé) — utilise AnalysisContext
- Story 1.9 (Sauvegarde auto) — utilise localStorageService et AnalysisSchema

### Project Structure Notes

- Structure feature-based alignée avec l'architecture : `/src/features/{domain}/`
- Composants Shadcn UI dans `/src/components/ui/` (géré par CLI, ne pas modifier manuellement la structure)
- Composants métier partagés dans `/src/components/shared/`
- Moteur de calcul isolé dans `/src/features/engine/` — 100% fonctions pures, zéro dépendance React
- Constantes SUVA isolées dans `/src/constants/` — immuables, annotées `// SUVA_REGULATORY_CONSTANT`

### References

- [Source: _bmad-output/planning-artifacts/prd.md — FR1, FR2, FR25-FR28, FR29-FR30, FR34]
- [Source: _bmad-output/planning-artifacts/architecture.md — Project Structure, Stack Tech, ADRs, State Management]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Wizard Patterns, Component Strategy, Design Tokens, Responsive, Accessibility]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1, Story 1.1 AC et requirements]
- [Source: Shadcn UI v4 docs — Installation Vite, @theme inline, components.json]
- [Source: Vite 8 Migration Guide — Rolldown natif, resolve.tsconfigPaths]
- [Source: SUVA 44094.F — Édition mai 2025]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
