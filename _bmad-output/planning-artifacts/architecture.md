---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-03-starter
  - step-04-decisions
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-analyse-travailleurs-isoles-2026-03-16.md
  - docs/cahier-des-charges.md
  - docs/specification-logique-analyse.md
workflowType: 'architecture'
project_name: 'Analyse Travailleurs Isolés - SUVA 44094.F'
user_name: 'Pierre-Alain'
date: '2026-03-16'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (44 FRs — V1 complète) :**

| Domaine | FRs | Implications architecturales |
|---------|-----|------------------------------|
| Wizard 4 niveaux (FR1-FR18) | 18 FRs | Moteur de calcul réglementaire, state machine multi-étapes, questionnaires intermédiaires avec mapping vers codes techniques, recalcul temps réel |
| Rapport et exports (FR19-FR24) | 6 FRs | Moteur de rendu bi-couche (langage naturel + technique), génération PDF côté client (jsPDF), export CSV avec BOM UTF-8 |
| Conformité réglementaire (FR25-FR28) | 4 FRs | Séparation SUVA_CONST/CONFIG au niveau données ET UI, matrice SUVA codée en dur avec tests exhaustifs |
| Persistance et données (FR29-FR34) | 6 FRs | Architecture offline-first (localStorage primaire), synchronisation cloud (Google Sheets API v4), mode dégradé gracieux |
| Configuration entreprise (FR35-FR38) | 4 FRs | Taxonomies configurables stockées en Google Sheets, verrouillage UI des constantes réglementaires |
| Dashboard et guidage (FR39-FR44) | 6 FRs | Liste consolidée avec filtres, sidebar temps réel, aide contextuelle sur 100% des champs, onboarding |

**Non-Functional Requirements (25 NFRs) :**

| Catégorie | Impact architectural |
|-----------|---------------------|
| Performance (NFR1-7) | Bundle < 200KB gzip, recalcul < 50ms, transitions < 100ms — optimisation critique du moteur de calcul |
| Sécurité (NFR8-12) | OAuth2 scope minimal, tokens jamais en clair dans localStorage, isolation données par entreprise |
| Accessibilité (NFR13-17) | WCAG 2.1 AA, navigation clavier 100%, contraste 4.5:1 sur les badges de zone colorés |
| Intégration (NFR18-21) | Quota Google Sheets (100 req/100s), batch des écritures, dégradation gracieuse |
| Fiabilité (NFR22-25) | Zéro perte de données, sauvegarde auto 30s, 99.9% disponibilité CDN |

**Scale & Complexity :**

- Domaine principal : Web App SPA client-side-only
- Complexité : Élevée
- Composants architecturaux estimés : ~15-20 (moteur calcul, wizard, persistance, exports, config, dashboard, aide)

### Technical Constraints & Dependencies

- **Stack imposée** : React 19, TypeScript, Vite 8, TailwindCSS v4, Shadcn UI (Radix UI)
- **Zéro backend** : SPA statique déployée sur Vercel/Cloudflare Pages
- **Google Sheets comme "BDD"** : API v4, OAuth2, 5 onglets, ~80 colonnes par analyse
- **Offline-first** : localStorage comme couche primaire, Google Sheets en sync différée
- **Modèle de données riche** : ~80 colonnes par analyse (14 travaux réglementés, 3 aptitudes, résultats par période jour/nuit/weekend, 4 gates, concept d'urgence)
- **Spécification logique exhaustive** : algorithmes de calcul entièrement documentés (matrice, t_max, reclassement, fiabilité outil) — pas d'ambiguïté d'implémentation
- **Responsive** : 3 breakpoints (desktop ≥1024px, tablette paysage 768-1023px, tablette portrait <768px)

### Cross-Cutting Concerns Identified

1. **Exactitude réglementaire** — traverse TOUS les composants : matrice, gates, reclassement, rapport. Toute erreur = conséquence légale. Nécessite des tests unitaires exhaustifs sur les 25 cellules de la matrice + tous les cas limites.
2. **Distinction SUVA_CONST / CONFIG** — impacte le modèle de données, les composants UI (verrouillage visuel), la persistance (constantes en code vs config en Google Sheets) et les exports.
3. **Persistance duale et synchronisation** — localStorage + Google Sheets avec gestion des conflits, mode hors-ligne, et dégradation gracieuse. Pattern transversal sur toute la couche données.
4. **Multi-période** — chaque analyse peut avoir des résultats différents par période (jour/nuit/weekend). Impacte le wizard, le moteur de calcul, le rapport, et le modèle de données.
5. **Vulgarisation computationnelle** — les questionnaires intermédiaires (probabilité, charge cognitive) calculent les codes techniques en coulisses. Pattern de mapping réponses → codes utilisé dans plusieurs parties du wizard.

## Starter Template Evaluation

### Primary Technology Domain

Web App SPA (Single Page Application) client-side-only, basée sur les exigences du PRD et du cahier des charges.

### Versions Technologiques Vérifiées (mars 2026)

| Package | Version | Notes |
|---------|---------|-------|
| Vite | 8.0.0 | Rolldown (bundler Rust), builds 10-30x plus rapides |
| React | 19.2.4 | Mise à jour depuis React 18 (PRD) — version courante, supportée par tout l'écosystème |
| TailwindCSS | 4.2.1 | Config CSS-first via `@theme`, plugin Vite natif `@tailwindcss/vite` |
| Shadcn UI CLI | v4 | Scaffolding complet Vite, primitives Radix UI unifiées |
| Radix UI | 1.4.3 | Package unifié `radix-ui` (remplace les packages individuels `@radix-ui/react-*`) |
| TypeScript | 5.x | Strict mode |

### Starter Options Considered

| Option | Avantages | Inconvénients | Verdict |
|--------|-----------|---------------|---------|
| **Shadcn CLI v4** (`npx shadcn@latest init -t vite`) | Officiel, toujours à jour, une commande, Tailwind v4 + Radix UI auto-configurés | Moins de contrôle sur l'étape initiale | **Retenu** |
| Vite CLI + init manuelle | Contrôle total sur chaque étape | 2 étapes au lieu d'une, même résultat | Alternative viable |
| Starters communautaires (doinel1a, dan5py) | Pré-configurés avec linting/hooks | Risque de non-maintenance, opinions superflues | Écarté |

### Selected Starter: Shadcn CLI v4

**Rationale :** Officiellement maintenu, scaffolde exactement la stack requise (Vite + React + TypeScript + Tailwind v4 + Shadcn UI) en une seule commande. Aucune dépendance tierce. Compatible avec la stratégie de copie-dans-le-projet de Shadcn UI (composants personnalisables, pas de lock-in).

**Initialization Command:**

```bash
npx shadcn@latest init -t vite -n analyse-travailleurs-isoles
cd analyse-travailleurs-isoles
npx shadcn@latest add button card dialog badge tooltip tabs separator
npm run dev
```

**Architectural Decisions Provided by Starter:**

- **Language & Runtime :** TypeScript strict, React 19, SWC pour le dev server
- **Styling :** TailwindCSS v4 via `@tailwindcss/vite` plugin — config CSS-first, palette de couleurs Tailwind définie dans `@theme { }`
- **Build :** Vite 8 + Rolldown — builds de production ultra-rapides
- **Composants UI :** Shadcn UI copiés dans `/src/components/ui/`, stylés via Tailwind, basés sur Radix UI 1.4.3
- **Structure de base :** `/src/components/ui/`, `/src/lib/utils.ts` (cn helper)
- **Dev Experience :** Hot reload instantané, TypeScript type-checking, path aliases `@/`

**Changement majeur Tailwind v4 :** Plus de `tailwind.config.js` ni de `postcss.config.js`. Configuration via `@theme { }` directement dans le CSS. Plugin Vite natif `@tailwindcss/vite`. Détection automatique du contenu. Builds 5x plus rapides.

**Note :** L'initialisation du projet via cette commande sera la première story d'implémentation.

## Core Architectural Decisions

### Decision Priority Analysis

**Décisions critiques (bloquent l'implémentation) :**
- Validation des données : Zod
- Gestion formulaires : React Hook Form + Zod resolver
- Moteur de calcul réglementaire : fonctions pures TypeScript avec tests exhaustifs

**Décisions importantes (façonnent l'architecture) :**
- Routing : React Router v7
- Testing : Vitest + Playwright
- Sync Google Sheets : Queue-based avec batch automatique
- Structure localStorage : clés par analyse

**Décisions différées :**
- Aucune — V1 complète, toutes les décisions sont prises

### Data Architecture

| Décision | Choix | Rationale |
|----------|-------|-----------|
| **Validation runtime** | Zod | Schéma unique → types TypeScript + validation formulaire + validation sync. Élimine la duplication pour les ~80 colonnes du modèle de données |
| **Structure localStorage** | Clés par analyse (`analysis:{uuid}`) + index (`analyses:index`) | Évite la sérialisation complète à chaque sauvegarde auto (30s). Performant pour les opérations fréquentes |
| **Sync Google Sheets** | Queue-based avec sync automatique (batch 30s) | Respecte le quota Google (100 req/100s), compatible offline-first, pas de perte de données |
| **Modèle de données** | Schéma Zod unique `AnalysisSchema` qui dérive les types TS et la validation | Source de vérité unique pour la structure de données |
| **Données réglementaires** | Constantes TypeScript `as const` annotées `SUVA_REGULATORY_CONSTANT` | Non modifiables par l'utilisateur, testables unitairement |

**Stratégie de sync détaillée :**
```
localStorage (primaire) → Queue de modifications → Batch sync → Google Sheets
                                                    ↑
                                            Timer 30s ou online event
```
- Les modifications s'accumulent dans `sync:queue` (localStorage)
- Un timer (30s) ou un événement `online` déclenche le batch
- En cas d'échec, retry avec backoff exponentiel (3 tentatives)
- Résolution de conflits : last-write-wins (l'utilisateur est seul sur ses analyses)

### Authentication & Security

| Décision | Choix | Rationale |
|----------|-------|-----------|
| **Authentification** | Google Identity Services (OAuth2) | Imposé par l'intégration Google Sheets — scope `spreadsheets` uniquement |
| **Tokens** | Session Google uniquement, jamais stockés en localStorage | NFR11 — sécurité des tokens |
| **Données sensibles** | Aucune donnée personnelle des travailleurs stockée | L'analyse porte sur le poste, pas sur la personne |
| **Isolation** | Un Google Sheet par entreprise, aucune donnée croisée | NFR12 — isolation par entreprise |

### Frontend Architecture

| Décision | Choix | Rationale |
|----------|-------|-----------|
| **State management** | React Context + useReducer | Suffisant pour une SPA sans temps réel serveur. Un contexte pour l'analyse en cours, un pour la config entreprise |
| **Formulaires** | React Hook Form + `@hookform/resolvers/zod` | Wizard multi-step avec validation conditionnelle, renders optimisés, intégration Zod native |
| **Routing** | React Router v7 | 7 routes principales (M1-M7), pas de data loading serveur, simple et éprouvé |
| **Composants UI** | Shadcn UI (copiés dans le projet) + composants métier custom | Composants de base (Button, Card, Dialog, Badge, Tooltip) via Shadcn. Composants métier (RiskMatrix, ZoneBadge, WizardStep) custom |
| **Bundle optimization** | Code splitting par route (React.lazy), tree-shaking Vite 8 | NFR1 — bundle < 200KB gzip |

### Infrastructure & Deployment

| Décision | Choix | Rationale |
|----------|-------|-----------|
| **Hébergement** | Vercel (primaire) / Cloudflare Pages (alternative) | Déploiement statique CDN, HTTPS automatique, 99.9% SLA |
| **Testing unitaire** | Vitest | Natif Vite 8, zéro config, rapide. Couverture exhaustive du moteur de calcul réglementaire |
| **Testing e2e** | Playwright | Multi-navigateur (Chrome, Safari, Firefox), parcours wizard complets, génération rapport |
| **CI/CD** | GitHub Actions | Build + tests Vitest + tests Playwright sur chaque PR |
| **Environnement** | Variables d'env Vite (`VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_API_KEY`) | Config Google OAuth2 par environnement |

### Decision Impact Analysis

**Séquence d'implémentation :**
1. Schéma Zod + types TypeScript (fondation données)
2. Moteur de calcul réglementaire (fonctions pures + tests Vitest)
3. Structure localStorage + persistence hook
4. Wizard React Hook Form + routing React Router
5. Rapport bi-couche + exports (PDF, CSV)
6. Google Sheets sync (OAuth2 + queue-based)
7. Configuration entreprise + dashboard
8. Aide contextuelle + onboarding

**Dépendances croisées :**
- Zod schema → React Hook Form validation → localStorage persistence → Google Sheets sync
- Moteur de calcul → Wizard (recalcul temps réel) → Rapport (données calculées)
- Shadcn UI composants de base → Composants métier → Pages

