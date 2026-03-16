---
stepsCompleted: [1, 2, 3, 4]
workflowStatus: complete
completedAt: 2026-03-16
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# Analyse Travailleurs Isolés - SUVA 44094.F - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Analyse Travailleurs Isolés - SUVA 44094.F, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Le spécialiste peut créer une nouvelle analyse en identifiant l'entreprise, le département, le responsable, le titre de l'activité, la description, le nombre de personnes, la période de travail et la fréquence d'activité isolée
FR2: Le spécialiste peut définir l'unité d'analyse comme une combinaison TÂCHE × PÉRIODE et créer au moins 2-3 analyses par poste pour capturer les variations par période (jour, nuit, weekend)
FR3: Le spécialiste peut répondre à une checklist de 14 catégories de travaux réglementés avec les références légales associées (Gate Niveau 1)
FR4: Le système stoppe l'analyse avec un motif légal précis si un travail réglementé est coché ou si le personnel est mineur (Gate NO-GO)
FR5: Le spécialiste peut évaluer la gravité du dommage (I à V) via des questions intermédiaires en langage naturel sans manipuler les codes techniques
FR6: Le spécialiste peut évaluer la probabilité d'accident (A à E) via des questions intermédiaires en langage naturel sans manipuler les codes techniques
FR7: Le système calcule la zone de risque (1 à 4) à partir de la matrice SUVA 5×5 (Gate Niveau 2)
FR8: Le spécialiste peut vérifier les aptitudes du travailleur selon 3 dimensions : psychique, physique, intellectuelle
FR9: Le spécialiste peut décrire le danger identifié via un champ texte structuré (150-300 caractères) avec une liste déroulante de catégories de dangers prédéfinies par type de travail réglementé
FR10: Le spécialiste peut saisir les conditions opérationnelles : couverture réseau, équipements DATI, centrale d'alarme, délais de secouristes (jour/nuit), délais secours publics
FR11: Le système calcule le t_max par période et détermine la faisabilité du sauvetage (Gate Niveau 3)
FR12: Le système reclasse automatiquement en Zone 2 si t_max ≤ 0 pour une période donnée
FR13: Le spécialiste peut valider l'outil d'alerte en fonction de la compatibilité zone × équipement × couverture × charge cognitive (Gate Niveau 4)
FR14: Le spécialiste peut évaluer la charge cognitive de la tâche (C1-C3) via des questions en langage naturel
FR15: Le spécialiste peut documenter le concept d'urgence selon les 4 composantes SUVA : alerte, premiers secours, formation, accès des secours
FR16: Le spécialiste peut documenter la formation et la validation (date, formateur, documentation, date de révision)
FR17: Le spécialiste peut naviguer librement entre les étapes du wizard (retour arrière, modification)
FR18: Le système recalcule les résultats en temps réel lorsque le spécialiste modifie une valeur
FR19: Le système génère un rapport bi-couche : couche 1 en langage naturel (décisions, actions concrètes) et couche 2 en détail technique (scores, matrices, références légales)
FR20: Le spécialiste peut exporter le rapport en PDF professionnel
FR21: Le spécialiste peut exporter les données d'analyse en CSV compatible Excel Windows
FR22: Le rapport distingue visuellement les exigences réglementaires des recommandations opérationnelles
FR23: Le rapport affiche la zone de risque avec un badge coloré et les mesures de surveillance correspondantes
FR24: Le rapport mentionne systématiquement la référence "SUVA 44094.F — Édition mai 2025"
FR25: Le système implémente la matrice SUVA 5×5 exacte comme constante non modifiable
FR26: Le système applique les 7 règles de conformité non négociables (R1 à R7) sans exception
FR27: Le système distingue visuellement les éléments [SUVA_CONST] (verrouillés, non modifiables) des éléments [CONFIG] (paramétrables)
FR28: Le système affiche les références légales exactes à chaque étape pertinente du wizard
FR29: Le système sauvegarde automatiquement l'analyse en cours localement dans le navigateur (toutes les 30s ou à chaque changement d'étape)
FR30: Le spécialiste peut reprendre une analyse interrompue après fermeture du navigateur ou coupure de courant
FR31: Le spécialiste peut connecter un espace de stockage cloud d'entreprise pour la synchronisation des données
FR32: Le système synchronise les analyses avec l'espace de stockage cloud connecté
FR33: Le système crée automatiquement la structure de données dans l'espace de stockage cloud au premier accès
FR34: Le système reste 100% fonctionnel sans connexion internet (sauvegarde locale seule, synchronisation cloud différée)
FR35: Le spécialiste peut configurer les départements et services de l'entreprise
FR36: Le spécialiste peut configurer la liste des équipements DATI disponibles
FR37: Le spécialiste peut personnaliser jusqu'à 5 champs taxonomiques [CONFIG] (départements, types d'équipement, types d'alerte, libellés de fréquence, prestataires de formation) avec validation de format
FR38: Le spécialiste ne peut pas modifier les constantes réglementaires [SUVA_CONST]
FR39: Le spécialiste peut consulter la liste de toutes les analyses sauvegardées avec leur statut et leur zone
FR40: Le spécialiste peut filtrer et rechercher des analyses par entreprise, département, zone, statut
FR41: Le système signale les analyses dont la date de révision est dépassée
FR42: Le système affiche un tooltip d'aide contextuelle sur 100% des champs de saisie du wizard (Niveaux 1-4), couvrant la définition réglementaire, un exemple et les erreurs courantes
FR43: Le système affiche un résumé dynamique de l'analyse en cours mis à jour en temps réel
FR44: Le système présente un écran d'introduction expliquant la méthode en 3 étapes

### NonFunctional Requirements

NFR1: Chargement initial de l'application < 2s sur connexion 4G (CDN statique)
NFR2: Transition entre étapes du wizard < 100ms (rendu côté client uniquement)
NFR3: Recalcul matrice/t_max/zone après modification < 50ms (instantané perçu)
NFR4: Génération du rapport bi-couche (rendu HTML) < 500ms
NFR5: Export PDF complet < 5s pour un rapport de 3-4 pages
NFR6: Sauvegarde localStorage < 100ms (non bloquant)
NFR7: Synchronisation Google Sheets < 3s par opération
NFR8: Authentification Google OAuth2 avec scope minimal (spreadsheets uniquement) — aucun accès au Drive, Gmail ou profil
NFR9: Stockage local — Aucune donnée personnelle des travailleurs analysés dans localStorage — l'analyse porte sur le poste, pas sur la personne
NFR10: Transmission des données HTTPS obligatoire pour toutes les communications avec l'API Google Sheets
NFR11: Token management — Les tokens OAuth2 ne sont jamais stockés en clair dans localStorage — utilisation de la session Google uniquement
NFR12: Isolation des données — Chaque entreprise accède uniquement à son propre Google Sheet — aucune donnée croisée entre entreprises
NFR13: Conformité WCAG 2.1 niveau AA
NFR14: Navigation clavier — 100% du wizard navigable au clavier (Tab, Enter, Escape)
NFR15: Contraste couleurs — Ratio ≥ 4.5:1 pour tout texte, y compris les badges de zone Z1-Z4
NFR16: Labels ARIA — Tous les champs de formulaire, la matrice des risques et les badges de zone ont des labels ARIA
NFR17: Focus visible — Outline de focus visible sur tous les éléments interactifs
NFR18: Google Sheets API v4 — Respect du quota (100 requêtes/100s/utilisateur) — batch des écritures si nécessaire
NFR19: Dégradation gracieuse — Si Google Sheets est indisponible, l'application reste 100% fonctionnelle en mode localStorage
NFR20: Compatibilité export CSV — UTF-8 BOM + séparateur point-virgule pour compatibilité Excel Windows français
NFR21: Compatibilité export PDF — Rendu correct des caractères accentués français et des tableaux de la matrice SUVA
NFR22: Zéro perte de données — Sauvegarde automatique localStorage toutes les 30s ou à chaque changement d'étape du wizard
NFR23: Reprise après interruption — 100% des analyses en cours récupérables après fermeture de navigateur ou crash
NFR24: Exactitude des calculs — 100% de conformité matrice SUVA — couvert par tests unitaires sur les 25 cellules + tous les cas limites de t_max
NFR25: Disponibilité — 99.9% — hébergement statique CDN (Vercel/Cloudflare), aucune dépendance serveur pour le fonctionnement de base

### Additional Requirements

**Starter Template:**
- Template sélectionné : Shadcn CLI v4 (officiel, maintenu)
- Commande : `npx shadcn@latest init -t vite -n analyse-travailleurs-isoles`
- Stack : Vite 8 + React 19 + TypeScript + Tailwind v4 + Shadcn UI

**Infrastructure & Déploiement:**
- Hébergement : Vercel (déploiement statique CDN, HTTPS auto, SLA 99.9%)
- Build : Vite 8 avec Rolldown (bundler Rust)
- CI/CD : GitHub Actions (Build + Vitest + Playwright sur chaque PR)
- Target bundle : < 200KB gzip

**Intégrations Externes:**
- Google Identity Services : OAuth2 (scope `spreadsheets` uniquement)
- Google Sheets API v4 : CRUD analyses + config, 5 onglets, ~80 colonnes par analyse
- jsPDF + html2canvas : génération PDF côté client
- Quota Google Sheets : 100 req/100s → sync batch avec retry exponential

**Modèle de Données:**
- Schéma de vérité : Zod `AnalysisSchema` dans `/src/types/analysis.schema.ts`
- Persistance primaire : localStorage avec clés par analyse (`analysis:{uuid}`) + index (`analyses:index`)
- Sync strategy : Queue-based (`sync:queue` dans localStorage) → batch auto (timer 30s ou événement `online`)
- Mapping : camelCase interne ↔ snake_case Google Sheets (isolé dans `sheetsMapper.ts`)

**Sécurité:**
- Tokens OAuth2 jamais stockés en localStorage (session Google uniquement)
- 1 Google Sheet par entreprise, aucune donnée croisée
- Constantes réglementaires codées en dur avec annotation `// SUVA_REGULATORY_CONSTANT`
- SUVA_CONST → `/src/constants/`, CONFIG → `/features/config/`

**Patterns Techniques:**
- State Management : Context + useReducer (3 contextes : Analysis, Config, App)
- Validation : Zod → React Hook Form (resolver Zod) → UI
- Error Boundaries : un par feature (wizard, rapport, dashboard)
- Moteur de calcul : 100% fonctions pures TypeScript, sans dépendance React
- Anti-patterns : pas de `utils.ts` fourre-tout, pas de `any`, pas de données calculées en localStorage

**Structure de Projet:**
- Organisation par feature : `/features/wizard`, `/features/engine`, `/features/report`, `/features/persistence`, `/features/config`, `/features/dashboard`, `/features/help`
- Composants partagés : `/components/ui` (Shadcn), `/components/shared` (ZoneBadge, RegulatoryLock, etc.)
- Constantes : `/constants/` (suvaMatrix, suvaRules, suvaZones, regulatedWork, etc.)
- 7 routes principales : `/`, `/analysis/new`, `/analysis/:id`, `/analysis/:id/report`, `/analysis/:id/export`, `/config`, `/onboarding`

**Tests:**
- Unitaires : Vitest, co-localisés `*.test.ts`
- E2E : Playwright (`/e2e/`)
- Accessibilité : `@axe-core/playwright` pour WCAG 2.1 AA

**Séquence d'implémentation recommandée:**
1. Init Shadcn CLI v4
2. Schéma Zod + types TS
3. Moteur calcul réglementaire (pures + tests Vitest)
4. localStorage + persistence hook
5. Wizard React Hook Form + React Router v7
6. Rapport bi-couche + exports PDF/CSV
7. Google Sheets sync OAuth2 + queue
8. Config entreprise + dashboard
9. Aide contextuelle + onboarding

### UX Design Requirements

UX-DR1: Créer palette de couleurs SUVA conforme WCAG 2.1 AA — 7 tokens primaires (Orange SUVA #E36C09, zones Z1-Z4, texte principal/secondaire) + palette utilitaire (success, warning, error, info, SUVA_CONST)
UX-DR2: Implémenter échelle typographique Inter avec 8 niveaux (h1 30px à caption 12px) + import Google Fonts variable
UX-DR3: Définir système d'espacement sur échelle 4px Tailwind (space-1 4px à space-12 48px) dans `@theme {}`
UX-DR4: Installer 28 composants Shadcn UI via CLI (button, card, badge, tabs, tooltip, progress, form, input, label, select, radio-group, checkbox, textarea, switch, calendar, sheet, separator, scroll-area, accordion, table, dialog, alert-dialog, breadcrumb, navigation-menu, pagination, popover, skeleton, toast)
UX-DR5: Créer variantes custom Badge : `zone-1` à `zone-4`, `suva-const`, `config`, `exigence`, `recommandation` — tous conformes WCAG AA
UX-DR6: Créer variante `gate` pour Card (bordure gauche colorée 4px correspondant à la zone)
UX-DR7: Configurer Toast (Sonner) avec palette sémantique du projet (success vert, warning ambre, error rouge, info bleu)
UX-DR8: Créer composant `WizardStepper` — navigation multi-niveaux (4 groupes × 13 étapes), states par étape (completed/active/upcoming/gate-blocked), variants horizontal/compact/textual, ARIA navigation
UX-DR9: Créer composant `WizardSidebar` — résumé temps réel (identification, zone, mesures, scores, progression), sections collapsibles, recalcul < 100ms, variants docked/drawer/minimized
UX-DR10: Créer composant `ZoneBadge` — badge zone 1-4 avec couleur SUVA + libellé, clic = popover détail, states default/pending/reclassified, variants inline/prominent/report, ARIA live region
UX-DR11: Créer composant `GateAlert` — alerte gate NO-GO avec motif légal + zone forcée + conséquences, states blocking/warning/info, focus automatique, ARIA role="alert"
UX-DR12: Créer composant `RiskMatrix` — matrice SUVA 5×5 interactive (gravité I-V × probabilité A-E), cellule active surlignée, variants full/compact/print, ARIA grid
UX-DR13: Créer composant `RegulatoryLock` — indicateur SUVA_CONST (cadenas gris) / CONFIG (crayon vert), states locked/editable/editing, variants inline/section
UX-DR14: Implémenter layout 3 breakpoints — Desktop ≥1024px (2 colonnes wizard 65% + sidebar 35%), Tablette paysage 768-1023px (1 colonne + Sheet drawer), Tablette portrait <768px (1 colonne + FAB)
UX-DR15: Adapter les 6 composants custom aux 3 breakpoints (WizardStepper horizontal→compact→textual, WizardSidebar docked→drawer→FAB, etc.)
UX-DR16: Configurer Tailwind CSS avec breakpoints natifs (lg, md, sm) — unités rem/% /fr, pas de media queries custom
UX-DR17: Implémenter sauvegarde automatique localStorage (30s + changement d'étape), toast "Brouillon enregistré", restauration avec notification "Reprendre l'analyse ?"
UX-DR18: Implémenter recalcul temps réel sidebar (< 100ms par modification, transitions CSS 300ms, aria-live="polite")
UX-DR19: Implémenter feedback validation inline — au blur (check vert ou erreur rouge), au submit (scroll + focus premier champ erreur), temps réel champs numériques
UX-DR20: Implémenter notifications de reclassement de zone (GateAlert warning ambre, slide down 300ms, pas de dismissal auto)
UX-DR21: Implémenter gates NO-GO avec détection automatique aux 4 niveaux, GateAlert blocking, référence légale + lien Dialog
UX-DR22: Implémenter pattern questionnaire langage naturel — questions français 16px, RadioGroup/Checkbox, mapping invisible réponse → code SUVA
UX-DR23: Implémenter hiérarchie boutons stricte — Primary (orange, 1 seul/écran, à droite), Secondary (bordure), Ghost (texte orange)
UX-DR24: Implémenter navigation wizard — Suivant (valide + avance + scroll top), Précédent (sans perte), stepper cliquable (étapes complétées), Sauvegarder et quitter
UX-DR25: Implémenter empty states avec messages français et CTA (dashboard vide, filtres sans résultat, Google Sheets non connecté)
UX-DR26: Implémenter loading states — Skeleton pour Google Sheets, spinner inline dans boutons, pas de loading full-screen
UX-DR27: Implémenter système aide contextuelle SUVA — icône ? sur chaque champ, Popover avec titre + extrait légal + exemple + lien
UX-DR28: Implémenter patterns modals — AlertDialog (destructif), Dialog (détail réglementaire), Sheet (sidebar tablette), Popover (aide), Tooltip (info rapide), jamais de modal dans le flux wizard
UX-DR29: Implémenter Tooltip aide (Radix UI) — hover desktop, long-press tablette, délai 200ms, max 2 lignes
UX-DR30: Implémenter rapport bi-couche avec onglets Tabs — Vue Management (décision + actions numérotées + badges exigence/recommandation) + Vue Technique (scores + matrice + calculs + références)
UX-DR31: Implémenter export PDF côté client (jsPDF + html2canvas, < 5s, A4 portrait, couleurs SUVA, en-tête/pied professionnel)
UX-DR32: Implémenter export CSV UTF-8 BOM pour Excel Windows (données complètes, séparateur virgule, accentués corrects)
UX-DR33: Implémenter onboarding 3 écrans — Bienvenue, Grille 2×2 des 4 niveaux, Google Sheets optionnel — < 30s, skip possible, 1 seule fois (localStorage flag)
UX-DR34: Implémenter configuration entreprise — Google Sheets connexion, taxonomies CONFIG éditables (départements, DATI, fréquences), éléments SUVA_CONST grisés + cadenas, test de config
UX-DR35: Implémenter persistance configuration localStorage + Google Sheets sync asynchrone
UX-DR36: Utiliser ton professionnel neutre — pas d'alarmisme, français clair, références légales inclusives
UX-DR37: Assurer conformité WCAG 2.1 AA sur tous les contrastes (axe-core à chaque PR, Lighthouse ≥ 90)
UX-DR38: Implémenter navigation clavier complète (Tab, Enter, Space, Escape, flèches) avec focus ring orange visible
UX-DR39: Implémenter landmarks ARIA (form, navigation, complementary, alert, status, grid) + aria-labels français
UX-DR40: Implémenter `prefers-reduced-motion` — transitions désactivées, spinner maintenu
UX-DR41: Implémenter skip link "Aller au contenu principal" + HTML sémantique (main, nav, aside, form, fieldset, legend)
UX-DR42: Tests unitaires Vitest + Testing Library pour chaque état/variant des 6 composants custom (≥ 80% coverage, axe-core intégré)
UX-DR43: Tests responsive sur devices réels (Desktop Chrome/Firefox/Safari, iPad Pro, iPad Air, Surface Pro)
UX-DR44: Tests accessibilité manuels (navigation clavier, VoiceOver, NVDA, Lighthouse ≥ 90/100)
UX-DR45: Tests de conformité SUVA (validation matrice 25 cellules, formules t_max, 14 travaux réglementés, rapport couche 1 sans jargon)

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | Créer analyse avec identification poste |
| FR2 | Epic 1 | Unité TÂCHE × PÉRIODE |
| FR3 | Epic 1 | Checklist 14 travaux réglementés (Niveau 1) |
| FR4 | Epic 1 | Gate NO-GO si travail réglementé/mineur |
| FR5 | Epic 1 | Évaluation gravité langage naturel |
| FR6 | Epic 1 | Évaluation probabilité langage naturel |
| FR7 | Epic 1 | Calcul zone matrice SUVA 5×5 |
| FR8 | Epic 1 | Vérification aptitudes travailleur |
| FR9 | Epic 1 | Description danger structurée |
| FR10 | Epic 1 | Conditions opérationnelles (réseau, DATI, délais) |
| FR11 | Epic 1 | Calcul t_max et faisabilité sauvetage |
| FR12 | Epic 1 | Reclassement auto Zone 2 si t_max ≤ 0 |
| FR13 | Epic 1 | Validation outil d'alerte (Niveau 4) |
| FR14 | Epic 1 | Évaluation charge cognitive C1-C3 |
| FR15 | Epic 1 | Documentation concept d'urgence |
| FR16 | Epic 1 | Documentation formation/validation |
| FR17 | Epic 1 | Navigation libre wizard |
| FR18 | Epic 1 | Recalcul temps réel |
| FR19 | Epic 2 | Rapport bi-couche |
| FR20 | Epic 2 | Export PDF |
| FR21 | Epic 2 | Export CSV |
| FR22 | Epic 2 | Distinction exigences/recommandations |
| FR23 | Epic 2 | Badge zone + mesures surveillance |
| FR24 | Epic 2 | Référence SUVA systématique |
| FR25 | Epic 1 | Matrice SUVA 5×5 non modifiable |
| FR26 | Epic 1 | 7 règles conformité R1-R7 |
| FR27 | Epic 1 | Distinction visuelle SUVA_CONST/CONFIG |
| FR28 | Epic 1 | Références légales à chaque étape |
| FR29 | Epic 1 | Sauvegarde auto localStorage |
| FR30 | Epic 1 | Reprise analyse interrompue |
| FR31 | Epic 3 | Connexion stockage cloud |
| FR32 | Epic 3 | Synchronisation analyses cloud |
| FR33 | Epic 3 | Création auto structure données cloud |
| FR34 | Epic 1 | 100% fonctionnel sans internet |
| FR35 | Epic 4 | Configuration départements/services |
| FR36 | Epic 4 | Configuration équipements DATI |
| FR37 | Epic 4 | Personnalisation 5 champs CONFIG |
| FR38 | Epic 4 | Verrouillage SUVA_CONST |
| FR39 | Epic 5 | Liste analyses sauvegardées |
| FR40 | Epic 5 | Filtres et recherche |
| FR41 | Epic 5 | Alertes date de révision |
| FR42 | Epic 6 | Tooltips aide contextuelle 100% champs |
| FR43 | Epic 1 | Résumé dynamique sidebar |
| FR44 | Epic 6 | Écran introduction méthode |

## Epic List

### Epic 1: Conduire une analyse complète via le wizard guidé
Le spécialiste peut créer une analyse, traverser les 4 niveaux (gate réglementaire, matrice des risques, faisabilité sauvetage, validation outil d'alerte), voir les résultats en temps réel dans la sidebar, et sauvegarder/reprendre son travail.
**FRs couverts:** FR1-FR18, FR25-FR28, FR29-FR30, FR34, FR43

### Epic 2: Générer et exporter des rapports bi-couche
Le spécialiste peut consulter le rapport bi-couche (Vue Management en langage naturel + Vue Technique avec scores et matrices), l'exporter en PDF professionnel et en CSV compatible Excel Windows.
**FRs couverts:** FR19-FR24

### Epic 3: Synchroniser les données avec Google Sheets
Le spécialiste peut connecter un Google Sheet d'entreprise via OAuth2, synchroniser ses analyses automatiquement, et conserver une persistance cloud fiable avec dégradation gracieuse hors-ligne.
**FRs couverts:** FR31-FR33

### Epic 4: Configurer les paramètres d'entreprise
Le spécialiste peut configurer les taxonomies spécifiques à l'entreprise (départements, équipements DATI, fréquences) tout en voyant clairement ce qui est verrouillé [SUVA_CONST] vs modifiable [CONFIG].
**FRs couverts:** FR35-FR38

### Epic 5: Gérer et suivre les analyses depuis le dashboard
Le spécialiste peut consulter la liste de toutes ses analyses avec leur zone et statut, filtrer par critères (entreprise, département, zone), et être alerté quand une date de révision est dépassée.
**FRs couverts:** FR39-FR41

### Epic 6: Aide contextuelle et onboarding
Le spécialiste bénéficie d'un écran d'introduction expliquant la méthode en 3 étapes et d'une aide contextuelle SUVA sur 100% des champs du wizard.
**FRs couverts:** FR42, FR44

## Epic 1: Conduire une analyse complète via le wizard guidé

Le spécialiste peut créer une analyse, traverser les 4 niveaux (gate réglementaire, matrice des risques, faisabilité sauvetage, validation outil d'alerte), voir les résultats en temps réel dans la sidebar, et sauvegarder/reprendre son travail.

### Story 1.1: Scaffold projet et création d'analyse

As a spécialiste STPS,
I want to create a new analysis by identifying the workplace, department, task and period,
So that I can begin a structured isolated worker assessment.

**Acceptance Criteria:**

**Given** le projet est initialisé avec Shadcn CLI v4 (React 19, TypeScript, Vite 8, Tailwind v4)
**When** le développeur lance `npm run dev`
**Then** l'application démarre sans erreur avec la route `/` (dashboard vide) et `/analysis/new` (wizard)
**And** les design tokens sont configurés (couleurs SUVA, typographie Inter, espacement 4px) dans `@theme {}`
**And** les composants Shadcn UI nécessaires sont installés (Button, Card, Form, Input, Label, Select, Badge, Toast, Progress, Separator)

**Given** le spécialiste accède à `/analysis/new`
**When** il remplit le formulaire d'identification (entreprise, département, responsable, titre activité, description, nombre de personnes, période, fréquence)
**Then** les données sont validées par le schéma Zod `AnalysisSchema`
**And** une nouvelle analyse est créée avec un UUID et sauvegardée dans localStorage
**And** le wizard affiche les boutons Primary "Suivant" (à droite) et Secondary "Précédent" (à gauche)
**And** les messages de validation sont en français ("Ce champ est requis")

**Given** une analyse est créée
**When** le spécialiste clique "Suivant"
**Then** le formulaire est validé (inline au blur + global au submit)
**And** le spécialiste est redirigé vers la première étape du Niveau 1
**And** la page scroll en haut automatiquement

### Story 1.2: Niveau 1 — Gate réglementaire

As a spécialiste STPS,
I want to verify if the isolated task involves regulated work or underage personnel,
So that I receive an immediate, legally-grounded GO/NO-GO decision.

**Acceptance Criteria:**

**Given** les constantes SUVA sont implémentées dans `/src/constants/` (14 travaux réglementés avec références légales, matrice 5×5, règles R1-R7) annotées `// SUVA_REGULATORY_CONSTANT`
**When** le développeur lance `npm run test`
**Then** les tests unitaires Vitest passent pour toutes les fonctions du moteur de calcul (`gateEvaluator`, 14 travaux × cas positif/négatif, mineur)

**Given** le spécialiste est à l'étape "Travaux réglementés" du Niveau 1
**When** il voit la checklist des 14 catégories de travaux
**Then** chaque catégorie affiche la référence légale exacte (OTConst, OIBT, CFST, etc.)
**And** chaque checkbox a un tooltip d'aide avec la définition SUVA

**Given** le spécialiste coche "Travaux en réservoirs / locaux exigus"
**When** le système évalue le gate
**Then** un `GateAlert` style `blocking` (fond rouge, `role="alert"`) apparaît avec focus automatique
**And** le message affiche : "Zone 1 — Travail isolé interdit. Référence : SUVA 1416.f ch. 2.3"
**And** un `ZoneBadge` Zone 1 (rouge, texte blanc) est affiché
**And** le ton reste factuel, jamais alarmiste

**Given** le spécialiste indique du personnel < 18 ans
**When** le système évalue le gate
**Then** un `GateAlert` blocking affiche "Zone 1 — Ordonnance protection jeunes travailleurs"

**Given** aucun travail réglementé n'est coché et le personnel est majeur
**When** le spécialiste clique "Suivant"
**Then** le wizard avance au Niveau 2 sans alerte

### Story 1.3: Niveau 2 — Évaluation des risques et matrice SUVA

As a spécialiste STPS,
I want to evaluate risk severity and probability through natural language questions and see the resulting risk zone on the SUVA matrix,
So that I get a clear, automated risk classification without manipulating technical codes.

**Acceptance Criteria:**

**Given** le spécialiste est au Niveau 2
**When** il accède à la vérification des aptitudes du travailleur
**Then** il peut évaluer les 3 dimensions (psychique, physique, intellectuelle) via un formulaire structuré
**And** si une dimension est non conforme, un `GateAlert` blocking s'affiche

**Given** les aptitudes sont conformes
**When** le spécialiste répond aux questions de gravité en langage naturel
**Then** les réponses sont mappées invisiblement vers les codes G I-V
**And** un lien ghost "Voir le critère technique" est disponible pour les experts
**And** les questions sont affichées en 16px minimum, en français clair

**Given** la gravité est déterminée
**When** le spécialiste répond aux questions de probabilité en langage naturel
**Then** les réponses sont mappées vers les codes P A-E
**And** le composant `RiskMatrix` s'affiche en variant `full` (5×5 avec légende)
**And** la cellule correspondante (G × P) est surlignée avec un contour épais orange
**And** le `ZoneBadge` affiche la zone calculée (1 à 4)

**Given** le spécialiste peut décrire le danger
**When** il saisit un texte de 150-300 caractères et sélectionne une catégorie de danger
**Then** la description est validée (longueur min/max) et sauvegardée

**Given** la zone calculée est Zone 1
**When** le résultat est affiché
**Then** un `GateAlert` blocking s'affiche (risque extrême)

**Given** la zone calculée est Zone 4
**When** le résultat est affiché
**Then** un message "Autorisé sans restriction" s'affiche et le wizard propose de passer au rapport

**Given** la zone est 2 ou 3
**When** le résultat est affiché
**Then** le wizard propose de passer au Niveau 3

### Story 1.4: Niveau 3 — Faisabilité du sauvetage

As a spécialiste STPS,
I want to enter rescue delays and have the system calculate t_max per period,
So that I know if rescue is feasible and if zone reclassification is needed.

**Acceptance Criteria:**

**Given** le spécialiste est au Niveau 3
**When** il saisit les conditions opérationnelles (couverture réseau, équipements DATI, centrale d'alarme, délais secouristes jour/nuit, délais secours publics)
**Then** les champs numériques sont validés en temps réel (≥ 0)
**And** la validation inline s'affiche au blur (check vert ou erreur rouge)

**Given** les délais sont saisis
**When** le système calcule t_max
**Then** le calcul est conforme à la formule SUVA : `t_max = délai_type_blessure - temps_secouristes - temps_ambulance - temps_sauvetage`
**And** le résultat est affiché en minutes pour chaque période
**And** le test unitaire `tmaxCalculator.test.ts` couvre tous les cas limites

**Given** t_max > 0 pour la période en cours
**When** le calcul est terminé
**Then** le wizard propose de passer au Niveau 4

**Given** t_max ≤ 0 et la zone actuelle est Zone 3
**When** le système détecte l'incohérence
**Then** un reclassement automatique en Zone 2 est déclenché (règle R4)
**And** un `GateAlert` style `warning` (ambre) apparaît avec animation slide down 300ms
**And** le message explique : "Zone reclassée de 3 → 2. t_max insuffisant pour la période nuit."
**And** le `ZoneBadge` dans la sidebar se met à jour avec transition CSS 300ms
**And** l'alerte reste visible jusqu'à action utilisateur (pas de dismissal auto)

### Story 1.5: Niveau 4 — Validation outil d'alerte

As a spécialiste STPS,
I want to validate the alert device against zone requirements, network coverage and cognitive load,
So that I ensure the worker has an appropriate and reliable safety device.

**Acceptance Criteria:**

**Given** le spécialiste est au Niveau 4
**When** il évalue la charge cognitive de la tâche via des questions en langage naturel
**Then** les réponses sont mappées vers C1, C2 ou C3 sans que le code technique soit visible

**Given** la charge cognitive est déterminée
**When** le spécialiste sélectionne le type d'équipement DATI (PTI, GSM, radio, etc.)
**Then** le système évalue la compatibilité zone × équipement × couverture × charge cognitive via la matrice de fiabilité
**And** les résultats sont affichés clairement (compatible / incompatible / avec réserves)

**Given** l'outil d'alerte est incompatible ou avec réserves
**When** le résultat est affiché
**Then** des mesures correctives sont proposées
**And** le spécialiste peut les documenter

**Given** la validation est complète
**When** le spécialiste clique "Suivant"
**Then** le wizard passe à l'étape documentation

### Story 1.6: Documentation et finalisation de l'analyse

As a spécialiste STPS,
I want to document the emergency concept and training details,
So that the analysis is complete with all required SUVA documentation.

**Acceptance Criteria:**

**Given** le spécialiste a traversé les 4 niveaux
**When** il accède à l'étape documentation du concept d'urgence
**Then** il peut remplir les 4 composantes SUVA : alerte, premiers secours, formation, accès des secours
**And** chaque composante a un champ texte structuré avec aide contextuelle

**Given** le concept d'urgence est documenté
**When** le spécialiste accède à la documentation formation
**Then** il peut saisir : date de formation, formateur, documentation, date de révision prévue
**And** la date de révision est saisie via le `DatePicker` Shadcn UI

**Given** toutes les étapes sont complétées
**When** le wizard affiche l'écran de finalisation
**Then** un résumé complet est affiché (poste, période, zone, mesures)
**And** le `ZoneBadge` en variant `prominent` est affiché
**And** les boutons "Voir le rapport" et "Retour au dashboard" sont proposés

### Story 1.7: Navigation wizard avancée et distinction réglementaire

As a spécialiste STPS,
I want to navigate freely between completed wizard steps and clearly see which values are regulatory vs configurable,
So that I can review and modify my assessment while understanding the regulatory framework.

**Acceptance Criteria:**

**Given** le spécialiste a complété les étapes 1 à 5
**When** il voit le `WizardStepper` en haut du wizard
**Then** les étapes complétées affichent un check vert et sont cliquables
**And** l'étape active affiche un cercle plein orange
**And** les étapes futures sont grisées et non cliquables
**And** les 4 niveaux sont visuellement groupés dans le stepper
**And** le stepper a `role="navigation"` et `aria-current="step"` sur l'étape active

**Given** le spécialiste clique sur une étape complétée
**When** la navigation se déclenche
**Then** le wizard affiche l'étape avec les données pré-remplies
**And** aucune donnée des étapes suivantes n'est perdue
**And** la page scroll en haut

**Given** le spécialiste est sur tablette (768-1023px)
**When** il voit le stepper
**Then** le `WizardStepper` passe en variant `compact` (noms tronqués)
**And** sur tablette portrait (<768px), un indicateur textuel "Étape 5/13 — Niveau 2" remplace le stepper

**Given** un champ est lié à une constante réglementaire
**When** le spécialiste le voit
**Then** un `RegulatoryLock` variant `inline` affiche l'icône cadenas + badge "SUVA_CONST" gris
**And** l'élément est grisé et non modifiable avec `aria-disabled="true"`

**Given** un champ est configurable
**When** le spécialiste le voit
**Then** un `RegulatoryLock` variant `inline` affiche l'icône crayon + badge "CONFIG" vert

**Given** le spécialiste est à une étape avec référence légale
**When** l'étape est affichée
**Then** la référence SUVA exacte est visible

### Story 1.8: Sidebar résumé temps réel et recalcul

As a spécialiste STPS,
I want to see a live summary of my analysis that updates instantly when I change any value,
So that I always know the current risk assessment status without leaving the form.

**Acceptance Criteria:**

**Given** le spécialiste est dans le wizard sur desktop (≥1024px)
**When** la sidebar est affichée
**Then** le `WizardSidebar` est en variant `docked` (colonne fixe 35%, position sticky)
**And** il affiche : Identification, Zone actuelle (`ZoneBadge`), Mesures requises, Scores intermédiaires (dépliable), Progression
**And** il a `role="complementary"` et `aria-label="Résumé de l'analyse"`

**Given** le spécialiste modifie une réponse
**When** la valeur change
**Then** la sidebar se recalcule en < 100ms
**And** le `ZoneBadge` se met à jour avec transition CSS 300ms
**And** `aria-live="polite"` annonce le changement aux lecteurs d'écran

**Given** le spécialiste est sur tablette paysage (768-1023px)
**When** il veut voir la sidebar
**Then** un bouton toggle flottant avec `ZoneBadge` actuel est visible
**And** le clic ouvre un `Sheet` drawer depuis la droite

**Given** le spécialiste est sur tablette portrait (<768px)
**When** il veut voir la sidebar
**Then** un FAB avec `ZoneBadge` miniature est visible
**And** le clic ouvre un `Sheet` bottom

**Given** `prefers-reduced-motion` est activé
**When** la zone change
**Then** le changement est instantané (pas de transition)

### Story 1.9: Sauvegarde automatique et reprise

As a spécialiste STPS,
I want my analysis to be automatically saved and fully recoverable after any interruption,
So that I never lose my work, even without internet connection.

**Acceptance Criteria:**

**Given** le spécialiste est dans le wizard
**When** 30 secondes passent ou qu'il change d'étape
**Then** l'analyse est sauvegardée dans localStorage (< 100ms, non bloquant)
**And** un toast discret "Brouillon enregistré" apparaît (vert, durée 2s)

**Given** le navigateur est fermé pendant une analyse
**When** le spécialiste rouvre l'application
**Then** une notification "Reprendre l'analyse ?" apparaît avec boutons [Reprendre] / [Ignorer]
**And** "Reprendre" restaure l'état complet (formulaire + étape + sidebar)
**And** "Ignorer" retourne au dashboard

**Given** l'application est hors ligne
**When** le spécialiste utilise le wizard
**Then** l'application reste 100% fonctionnelle (localStorage seule)
**And** aucune erreur réseau n'apparaît

## Epic 2: Générer et exporter des rapports bi-couche

Le spécialiste peut consulter le rapport bi-couche (Vue Management + Vue Technique), l'exporter en PDF et CSV.

### Story 2.1: Rapport bi-couche — Vue Management et Vue Technique

As a spécialiste STPS,
I want to view a bi-layer report with a management view in plain language and a technical view with detailed scores,
So that both managers and specialists can understand the analysis results without translation.

**Acceptance Criteria:**

**Given** une analyse est complétée
**When** le spécialiste clique "Voir le rapport"
**Then** la route `/analysis/:id/report` affiche le rapport avec des onglets `Tabs`
**And** l'onglet "Vue Management" est actif par défaut

**Given** l'onglet "Vue Management" est actif
**When** le rapport s'affiche
**Then** l'en-tête montre : poste, période, `ZoneBadge` variant `prominent`
**And** la décision est affichée en une ligne claire
**And** les actions concrètes sont numérotées avec badges `exigence` (rouge) ou `recommandation` (bleu)
**And** aucun jargon technique n'apparaît
**And** la référence "SUVA 44094.F — Édition mai 2025" est affichée

**Given** l'onglet "Vue Technique" est activé
**When** le spécialiste bascule
**Then** les scores détaillés, le `RiskMatrix` variant `full`, les calculs t_max et les références légales sont visibles
**And** chaque niveau a sa section détaillée

**Given** le rapport est généré
**When** le temps de rendu est mesuré
**Then** le rendu HTML est < 500ms

### Story 2.2: Export PDF professionnel

As a spécialiste STPS,
I want to export the report as a professional PDF document,
So that I can send it directly to managers and archive it.

**Acceptance Criteria:**

**Given** le spécialiste est sur la page rapport
**When** il clique "Exporter PDF"
**Then** un PDF A4 portrait est généré côté client via jsPDF + html2canvas
**And** le bouton affiche spinner + "En cours..." pendant la génération (< 5s)

**Given** le PDF est généré
**When** le téléchargement démarre
**Then** le fichier est nommé `Analyse_[Poste]_[Période]_[Date].pdf`
**And** un toast "PDF généré" apparaît
**And** le PDF contient : en-tête professionnel, sections Management + Technique, matrice en couleur, badges SUVA, pied de page
**And** les caractères accentués français sont corrects

### Story 2.3: Export CSV compatible Excel

As a spécialiste STPS,
I want to export the analysis data as a CSV file compatible with Excel on Windows,
So that I can archive raw data and perform custom analyses.

**Acceptance Criteria:**

**Given** le spécialiste est sur la page rapport
**When** il clique "Exporter CSV"
**Then** un fichier CSV est généré avec toutes les données (questions, réponses, scores, zone, mesures)
**And** l'encodage est UTF-8 avec BOM, séparateur virgule
**And** le fichier est nommé `Analyse_[Poste]_[Période]_[Date].csv`
**And** un toast "CSV exporté" apparaît
**And** le fichier s'ouvre correctement dans Excel Windows

## Epic 3: Synchroniser les données avec Google Sheets

Le spécialiste peut connecter un Google Sheet d'entreprise, synchroniser ses analyses, et travailler avec persistance cloud.

### Story 3.1: Connexion Google Sheets via OAuth2

As a spécialiste STPS,
I want to connect my company's Google Sheet via a simple authorization flow,
So that my analyses can be stored in the cloud alongside local storage.

**Acceptance Criteria:**

**Given** le spécialiste accède à `/config`
**When** il clique "Connecter Google Sheets"
**Then** le flux OAuth2 Google Identity Services se lance avec scope minimal `spreadsheets` uniquement
**And** aucun accès au Drive, Gmail ou profil n'est demandé

**Given** l'autorisation est accordée
**When** la connexion est établie
**Then** le token est géré via session Google uniquement (jamais en clair dans localStorage)
**And** l'état "Connecté" avec l'URL du Sheet est affiché
**And** un toast "Google Sheets connecté" apparaît

**Given** l'autorisation échoue
**When** l'erreur se produit
**Then** un message français clair est affiché
**And** l'application reste fonctionnelle en mode localStorage

### Story 3.2: Création automatique de la structure et synchronisation

As a spécialiste STPS,
I want the system to automatically create the data structure in my Google Sheet and sync analyses,
So that I don't have to set up sheets manually and my data is always backed up.

**Acceptance Criteria:**

**Given** un Google Sheet est connecté pour la première fois
**When** la première synchronisation se lance
**Then** les 5 onglets sont créés automatiquement (Analyses, Config, Taxonomies, Zones_Textes, Travailleurs_Reg)
**And** un toast "Structure créée" apparaît

**Given** une analyse est complétée ou modifiée
**When** la synchronisation se déclenche
**Then** les données sont envoyées via la sync queue (batch auto 30s ou événement `online`)
**And** le mapping camelCase → snake_case est appliqué
**And** la sync prend < 3s par opération, quota Google respecté (100 req/100s)

**Given** Google Sheets est indisponible
**When** la synchronisation échoue
**Then** les opérations restent dans la queue pour retry
**And** un toast "Synchronisation impossible — données sauvegardées localement" apparaît
**And** l'application reste 100% fonctionnelle

## Epic 4: Configurer les paramètres d'entreprise

Le spécialiste peut configurer les taxonomies spécifiques et voir clairement SUVA_CONST vs CONFIG.

### Story 4.1: Configuration des taxonomies entreprise

As a spécialiste STPS,
I want to configure company-specific departments, DATI equipment and custom taxonomies,
So that the wizard dropdowns reflect my client's actual organization.

**Acceptance Criteria:**

**Given** le spécialiste accède à `/config`
**When** la page de configuration s'affiche
**Then** la section "Taxonomies" affiche les 5 champs configurables avec badge "CONFIG" vert

**Given** le spécialiste veut ajouter un département
**When** il clique [+] Ajouter
**Then** un champ inline edit apparaît, il peut saisir et valider
**And** la donnée est sauvegardée dans localStorage et synchronisée si Google Sheets connecté

**Given** le spécialiste personnalise les 5 champs taxonomiques
**When** il modifie départements, types d'équipement, types d'alerte, libellés de fréquence ou prestataires de formation
**Then** chaque modification est validée et sauvegardée
**And** un toast "Configuration enregistrée" apparaît

**Given** la configuration est terminée
**When** le spécialiste lance une analyse
**Then** les taxonomies personnalisées apparaissent dans les listes déroulantes du wizard

### Story 4.2: Verrouillage visuel des constantes réglementaires

As a spécialiste STPS,
I want to clearly see which values are locked regulatory constants and cannot be modified,
So that I understand the regulatory boundaries and trust the system's integrity.

**Acceptance Criteria:**

**Given** le spécialiste est sur la page configuration
**When** les éléments SUVA_CONST sont affichés
**Then** chaque élément est grisé avec `RegulatoryLock` variant `section` (bandeau cadenas + badge "SUVA_CONST" gris)
**And** le hover affiche tooltip "Valeur réglementaire SUVA imposée — non modifiable"
**And** les éléments ont `aria-disabled="true"`

**Given** le spécialiste tente de modifier une constante SUVA
**When** il clique sur un élément verrouillé
**Then** rien ne se passe, le tooltip explique pourquoi

## Epic 5: Gérer et suivre les analyses depuis le dashboard

Le spécialiste peut consulter, filtrer et suivre toutes ses analyses.

### Story 5.1: Dashboard avec liste des analyses et filtres

As a spécialiste STPS,
I want to see all my saved analyses with their status and risk zone, and filter them by criteria,
So that I can quickly find and manage my assessments across multiple companies.

**Acceptance Criteria:**

**Given** le spécialiste accède au dashboard (`/`)
**When** des analyses existent
**Then** une liste de cartes affiche chaque analyse avec : titre, entreprise, département, période, `ZoneBadge`, statut, date

**Given** le spécialiste veut filtrer
**When** il utilise les filtres (entreprise, département, zone, statut)
**Then** le filtrage est instantané (côté client)
**And** si aucun résultat : "Aucun résultat pour ces filtres" + lien "Réinitialiser"

**Given** le dashboard est vide
**When** aucune analyse n'existe
**Then** empty state : "Aucune analyse pour le moment" + bouton "Créer ma première analyse"

**Given** plus de 10 analyses
**When** le spécialiste scroll
**Then** une pagination permet de naviguer

### Story 5.2: Alertes de révision

As a spécialiste STPS,
I want to be alerted when an analysis revision date has passed,
So that I can ensure regulatory compliance through timely re-assessments.

**Acceptance Criteria:**

**Given** une analyse a une date de révision dépassée
**When** le spécialiste consulte le dashboard
**Then** la carte affiche une bordure orange + badge "Révision requise" (ambre)
**And** un bandeau en haut indique le nombre d'analyses à réviser
**And** les analyses concernées sont triées en premier

**Given** le spécialiste clique sur une analyse à réviser
**When** il ouvre l'analyse
**Then** il peut relancer le wizard avec les données pré-remplies

## Epic 6: Aide contextuelle et onboarding

Le spécialiste bénéficie d'un onboarding clair et d'aide SUVA sur chaque champ.

### Story 6.1: Écran d'onboarding

As a spécialiste STPS,
I want a brief introduction screen explaining the SUVA method when I first use the app,
So that I understand the 4-level structure before starting my first analysis.

**Acceptance Criteria:**

**Given** le spécialiste accède à l'application pour la première fois
**When** aucun flag `onboarding-shown` n'existe dans localStorage
**Then** la route `/onboarding` affiche max 3 écrans

**Given** l'écran 1 (Bienvenue) est affiché
**When** le spécialiste le voit
**Then** une carte centrée affiche "Bienvenue dans Analyse Travailleurs Isolés"
**And** un bouton Primary "Voir les étapes" permet d'avancer

**Given** l'écran 2 (4 niveaux) est affiché
**When** le spécialiste le voit
**Then** une grille 2×2 présente les 4 niveaux avec icône + description courte
**And** un bouton Primary "Commencer une analyse" permet d'avancer

**Given** le spécialiste termine l'onboarding
**When** il clique le dernier bouton
**Then** le flag est enregistré, l'onboarding ne réapparaît plus, redirection vers dashboard

**Given** le spécialiste veut passer l'onboarding
**When** il clique "Passer" (ghost)
**Then** l'onboarding est marqué comme vu et le dashboard s'affiche

### Story 6.2: Aide contextuelle SUVA sur les champs du wizard

As a spécialiste STPS,
I want contextual SUVA help on every wizard field,
So that I understand each regulatory criterion and can make informed decisions.

**Acceptance Criteria:**

**Given** le spécialiste est dans le wizard
**When** il voit un champ de saisie
**Then** une icône `?` (16px, gris slate-500) est affichée à côté du label

**Given** le spécialiste clique sur l'icône `?`
**When** le `Popover` s'ouvre
**Then** le contenu affiche : titre ("Référence SUVA [code]"), extrait légal, exemple pratique, lien "Voir la référence complète"
**And** le popover est non-bloquant
**And** le champ a `aria-describedby` pointant vers le contenu

**Given** la couverture est vérifiée
**When** un auditeur parcourt le wizard complet
**Then** 100% des champs des Niveaux 1-4 ont un tooltip d'aide couvrant définition, exemple et erreurs courantes

**Given** le spécialiste est sur tablette
**When** il appuie longuement sur l'icône `?`
**Then** le popover s'ouvre (long-press fallback)
