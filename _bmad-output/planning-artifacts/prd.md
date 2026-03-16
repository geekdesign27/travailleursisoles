---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
workflowStatus: complete
completedAt: 2026-03-16
lastEdited: 2026-03-16
editHistory:
  - date: 2026-03-16
    changes: "DaisyUI remplacé par Shadcn UI + palette Tailwind dans Executive Summary et Web App Requirements"
  - date: 2026-03-16
    changes: "Post-validation: FR2/FR9/FR37/FR42 affinées SMART, FR29-34 abstraction implémentation, FR8/FR21 intégrées parcours"
  - date: 2026-03-16
    changes: "Alignement Brief/PRD: suppression phasage Phase 1/2/3, V1 livre l'intégralité des 44 FRs, section Scoping réécrite avec séquence d'implémentation par blocs"
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-analyse-travailleurs-isoles-2026-03-16.md
  - docs/cahier-des-charges.md
  - docs/specification-logique-analyse.md
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 2
classification:
  projectType: web_app
  domain: workplace_safety_regulatory_compliance
  complexity: high
  projectContext: greenfield
workflowType: 'prd'
---

# Product Requirements Document - Analyse Travailleurs Isolés - SUVA 44094.F

**Author:** Pierre-Alain
**Date:** 2026-03-16

## Executive Summary

**Analyse Travailleurs Isolés** est une webapp publique qui implémente la méthode SUVA 44094.F (édition mai 2025) sous forme d'un wizard conditionnel à 4 niveaux avec gates GO/NO-GO. Elle permet aux spécialistes STPS et responsables SST de conduire des analyses de postes de travailleurs isolés conformes à l'OPA art. 8 al. 1, produisant des décisions réglementaires explicites et des rapports bi-couche (langage naturel pour le management + détail technique pour le spécialiste).

L'unité d'analyse est la combinaison **TÂCHE × PÉRIODE** — pas le poste de travail. Chaque combinaison traverse 4 niveaux séquentiels : gate réglementaire (14 questions GO/NO-GO), matrice des risques SUVA (gravité × probabilité → zone 1 à 4), faisabilité du sauvetage (calcul t_max par période), et validation de l'outil d'alerte. Chaque niveau peut stopper l'analyse avec un motif légal précis.

L'application est sans backend propriétaire : les données sont stockées chez le client via Google Sheets, avec sauvegarde locale en localStorage. Stack technique : React 18, TypeScript, Vite, TailwindCSS avec palette de couleurs Tailwind, Shadcn UI (composants basés sur Radix UI). Déploiement statique sur Vercel ou Cloudflare Pages.

Utilisateurs cibles : les spécialistes STPS / consultants SST qui conduisent les analyses (utilisateurs primaires), les cadres et collaborateurs terrain qui reçoivent et appliquent les conclusions (destinataires du rapport).

### Ce qui le rend spécial

- **Premier outil digital conforme SUVA 44094.F** — aucun équivalent n'existe pour les PME/PMI suisses. Les alternatives actuelles (papier SUVA, Excel non structuré, logiciels SST génériques) ne couvrent pas la logique à 4 niveaux avec gates séquentiels.
- **Surcouche opérationnelle au-delà de la méthode SUVA** — charge cognitive (C1-C3), matrice de fiabilité des outils d'alerte, décision différenciée par période (jour/nuit/weekend). Des dimensions que la norme seule ne couvre pas.
- **Vulgarisation intelligente** — l'utilisateur ne manipule jamais de codes techniques. Des questionnaires en langage naturel calculent les valeurs réglementaires (probabilité P1-P4, charge cognitive) en coulisses.
- **Rapport qui parle deux langages** — couche 1 pour le cadre ("autorisé / interdit + actions concrètes") et couche 2 pour le spécialiste (scores, matrices, références légales). Le cadre comprend sans reformulation.
- **Distinction [SUVA_CONST] / [CONFIG]** — les constantes réglementaires sont codées en dur et non modifiables ; les éléments opérationnels sont configurables par l'entreprise. Transparence totale sur ce qui est imposé vs ajustable.

## Project Classification

| Dimension | Valeur |
|-----------|--------|
| **Type de projet** | Web App (SPA) |
| **Domaine** | Sécurité au travail / Conformité réglementaire suisse |
| **Complexité** | Élevée — réglementation SUVA, OPA, OTConst ; algorithmes de calcul réglementaires ; matrice 5×5 ; logique 4 niveaux avec gates |
| **Contexte** | Greenfield — nouveau produit, aucun code existant |

## Success Criteria

### User Success

| Critère | Métrique | Cible |
|---------|----------|-------|
| **Temps par analyse** | Durée du début du wizard au rapport finalisé | < 30 minutes (vs 2-4h estimées sur papier/Excel) |
| **Zéro blocage de saisie** | Les questionnaires intermédiaires suffisent à déterminer les codes techniques | < 1 utilisation "Je ne sais pas" par analyse en moyenne |
| **Complétude des analyses** | % d'analyses démarrées qui atteignent le rapport final | > 80% |
| **Rapport auto-suffisant** | Le rapport couche 1 est compris par un cadre non-spécialiste sans reformulation orale | Le spécialiste n'a pas besoin de "traduire" le rapport |
| **Confiance réglementaire** | L'utilisateur sait précisément ce qui est imposé [SUVA_CONST] vs ajustable [CONFIG] | Distinction claire et visible dans l'interface à chaque étape |

### Business Success

| Objectif | Horizon | Indicateur |
|----------|---------|-----------|
| **Validation terrain** | 3 mois | Pierre-Alain utilise l'outil pour ses propres mandats SST et le préfère à sa méthode actuelle |
| **Adoption pair-à-pair** | 6 mois | 4-5 collègues spécialistes STPS utilisent l'outil activement |
| **Positionnement expert** | 12 mois | L'outil devient une référence citée dans le milieu SST suisse romand |
| **Modèle économique** | À définir | Outil gratuit au lancement — monétisation à évaluer après validation terrain |

### Technical Success

| Critère | Métrique | Cible |
|---------|----------|-------|
| **Exactitude réglementaire** | Conformité des calculs avec la matrice SUVA et les formules de la spécification | 100% — zéro écart sur les constantes [SUVA_CONST] |
| **Persistance fiable** | Données sauvegardées en localStorage ET synchronisées avec Google Sheets | Aucune perte de données, reprise d'analyse interrompue fonctionnelle |
| **Performance** | Temps de chargement initial et transitions entre étapes du wizard | < 2s chargement initial, transitions instantanées |
| **Responsive tablette** | Interface utilisable sur tablette pour les visites terrain | Formulaire complet utilisable sans zoom ni scroll horizontal |

### Measurable Outcomes

- **Réduction du temps** : une analyse complète en < 30 min vs 2-4h actuellement = gain de productivité ×4 minimum
- **Qualité documentaire** : 100% des analyses finalisées passent toutes les validations croisées (cohérence entre niveaux, t_max calculé, outil d'alerte validé)
- **Couverture méthodologique** : les 4 niveaux SUVA + surcouche opérationnelle sont opérationnels avec tous les algorithmes de la spécification logique
- **Adoption mesurable** : nombre d'analyses créées et finalisées par mois par utilisateur

## User Journeys

### Parcours 1 — Marc, Spécialiste STPS : L'analyse complète (chemin principal)

**Scène d'ouverture :** Marc, 47 ans, consultant SST, arrive dans une PME industrielle pour analyser les postes de travailleurs isolés. Jusqu'ici, il passait 3-4 heures par analyse avec son classeur SUVA, ses feuilles Excel et sa calculatrice. À chaque mandat, il reproduisait le même travail artisanal, avec le sentiment que ses conclusions étaient défendables mais mal documentées. Aujourd'hui, il ouvre la webapp sur sa tablette.

**Action montante :** Marc crée une nouvelle analyse. Il identifie le poste : "Contrôle des cuves de stockage — Week-end". Le wizard l'emmène au Niveau 1. Les 14 questions réglementaires s'affichent avec les références légales exactes. Il coche "Travaux en réservoirs / locaux exigus" → l'application affiche immédiatement : **Zone 1 — Travail isolé INTERDIT** avec la référence SUVA 1416.f ch. 2.3. L'analyse s'arrête net avec un motif légal précis.

Marc revient en arrière et lance une deuxième analyse pour un autre poste : "Ronde de surveillance site industriel — Nuit". Cette fois, aucun travail réglementé n'est coché. Le wizard passe au Niveau 2. Marc vérifie les aptitudes du travailleur selon les 3 dimensions (psychique, physique, intellectuelle) — tout est conforme. Les questions intermédiaires en langage naturel l'aident à déterminer la gravité (III — Moyen) et la probabilité (C — Rare). Il ne manipule aucun code — l'outil traduit ses réponses. La matrice affiche : **Zone 3b**.

Le Niveau 3 calcule le t_max pour la période nuit : les délais de secouristes de nuit (25 min) et des secours publics (18 min) produisent un t_max de 12 minutes. Faisable. Le Niveau 4 valide l'outil d'alerte : un PTI GSM avec couverture réseau partielle. La matrice de fiabilité alerte sur la couverture — Marc note une mesure corrective.

**Climax :** Marc génère le rapport bi-couche. La couche 1 affiche en langage clair : "Ronde de surveillance autorisée en période nuit sous condition d'un contrôle périodique toutes les 4h et d'un PTI avec vérification de couverture réseau." La couche 2 détaille les scores, la matrice, les formules de t_max et les références SUVA. Pour la première fois, Marc a un rapport qu'il peut envoyer directement au cadre sans devoir le "traduire".

**Résolution :** Marc exporte le PDF et le CSV des données brutes pour archivage, puis synchronise sur le Google Sheet du client. L'analyse complète a pris 22 minutes. Il programme la date de révision à 12 mois. Sur le dashboard, il voit les 5 analyses du site consolidées avec leurs zones respectives. Il envoie le rapport couche 1 à Sandra, la responsable d'exploitation.

---

### Parcours 2 — Marc : Le cas limite (edge case / récupération d'erreur)

**Scène d'ouverture :** Marc reprend une analyse interrompue la veille. Son navigateur s'était fermé en plein Niveau 3. Il rouvre la webapp — le localStorage a sauvegardé son brouillon. Il reprend exactement où il en était.

**Action montante :** Au Niveau 3, le calcul de t_max pour la période nuit donne un résultat ≤ 0 — les délais de secours sont incompatibles avec la zone 3. L'application déclenche le reclassement automatique en **Zone 2** et affiche l'alerte : "Zone 3 impossible pour la période nuit — t_max insuffisant → reclassement Zone 2."

Marc hésite sur la gravité du dommage. Il revient à l'étape 5, modifie sa réponse. La matrice se recalcule en temps réel dans la sidebar. Il teste plusieurs scénarios.

**Climax :** Marc réalise que le poste nécessite deux analyses distinctes : la tâche de jour (Zone 3b) et la même tâche de nuit (Zone 2 — surveillance continue obligatoire). L'unité TÂCHE × PÉRIODE prend tout son sens. Il crée la deuxième analyse en quelques minutes, les paramètres communs sont déjà en mémoire.

**Résolution :** Le rapport final montre les deux périodes côte à côte avec des conclusions différentes. Le cadre comprend immédiatement pourquoi la nuit nécessite un niveau de surveillance supérieur.

---

### Parcours 3 — Sandra, Responsable d'exploitation : Réception et compréhension du rapport

**Scène d'ouverture :** Sandra, 52 ans, responsable d'exploitation, reçoit un email de Marc avec le rapport PDF en pièce jointe. Elle n'a jamais lu la doc SUVA. Pour elle, "travailleur isolé" = quelqu'un qui travaille seul, point. Elle s'attend à un document technique incompréhensible.

**Action montante :** Sandra ouvre le PDF. La première page (couche 1) affiche un en-tête clair avec le nom du poste, la période et un badge coloré : **Zone 3b — Surveillance périodique obligatoire (max 4h)**. Dessous, une liste numérotée d'actions concrètes : (1) Équiper le collaborateur d'un PTI avec alarme automatique, (2) Vérifier la couverture réseau GSM avant chaque intervention, (3) Contrôle périodique toutes les 4 heures par le chef d'équipe.

**Climax :** Sandra comprend la décision sans aide. Elle n'a pas besoin d'appeler Marc pour se faire expliquer. Le rapport distingue clairement ce qui est imposé par la loi (badge rouge "Exigence réglementaire") et ce qui est une recommandation opérationnelle (badge bleu "Recommandation"). Elle sait exactement quoi mettre en place et pourquoi.

**Résolution :** Sandra transmet les actions concrètes à son chef d'équipe et montre la section pertinente du rapport à Luca, le collaborateur concerné. Luca comprend pourquoi on lui impose un PTI — le rapport l'explique en une phrase. Sandra archive le PDF dans le dossier SST du service.

---

### Parcours 4 — Marc (rôle admin) : Configuration entreprise

**Scène d'ouverture :** Marc commence un nouveau mandat pour une entreprise de BTP. Avant de lancer les analyses, il doit configurer les paramètres spécifiques de cette entreprise.

**Action montante :** Dans les Paramètres (M6), Marc connecte le Google Sheet de l'entreprise via OAuth2. Il configure les départements et services (Chantier Nord, Chantier Sud, Atelier), ajoute les équipements DATI disponibles dans l'entreprise (PTI Emerit, téléphone GSM standard, radio VHF) et personnalise les libellés des fréquences d'activité. Les éléments [SUVA_CONST] sont grisés et non modifiables — Marc voit exactement ce qu'il peut ajuster et ce qui est verrouillé.

**Climax :** Marc teste la connexion Google Sheets. Les onglets "Config", "Taxonomies" et "Analyses" sont créés automatiquement. Il lance une première analyse de test — les taxonomies personnalisées apparaissent dans les listes déroulantes du wizard.

**Résolution :** L'entreprise est configurée. Marc peut maintenant lancer les analyses pour chaque poste isolé. Les données seront consolidées dans le Google Sheet du client. Quand Marc terminera son mandat, le client conservera ses données et pourra les consulter via le Sheet.

### Journey Requirements Summary

| Parcours | Capacités révélées |
|----------|-------------------|
| **Marc — Analyse complète** | Wizard 4 niveaux, questionnaires intermédiaires, vérification aptitudes travailleur, matrice SUVA, calcul t_max, rapport bi-couche, export PDF, export CSV, synchronisation Google Sheets, sidebar résumé temps réel, programmation date de révision |
| **Marc — Cas limite** | Sauvegarde/reprise localStorage, reclassement automatique, recalcul en temps réel, navigation arrière dans le wizard, analyses multiples par poste (TÂCHE × PÉRIODE) |
| **Sandra — Rapport** | Rapport couche 1 en langage naturel, badges visuels de zone, distinction exigence réglementaire vs recommandation, actions concrètes numérotées, PDF professionnel |
| **Marc admin — Configuration** | Connexion OAuth2 Google Sheets, configuration taxonomies, personnalisation libellés, verrouillage visuel [SUVA_CONST], création automatique des onglets Sheet, gestion multi-entreprises |

## Domain-Specific Requirements

### Compliance & Regulatory

**Cadre légal suisse — références obligatoires :**

| Norme | Portée | Impact sur l'application |
|-------|--------|--------------------------|
| **OPA art. 8 al. 1** (RS 832.30) | Obligation de surveillance du travailleur isolé en situation dangereuse | Fondement légal de l'outil — cité dans chaque rapport |
| **SUVA 44094.F** (mai 2025) | Méthode d'analyse structurée : matrice 5×5, 4 zones, constantes réglementaires | Matrice, formules et gates codés en dur [SUVA_CONST] |
| **OTConst** art. 81, 114, 118, 119 | Travaux de déconstruction, thermiques, cordes, conduites | Gate Niveau 1 — travaux réglementés → Zone 1 forcée |
| **OIBT** RS 734.27 art. 22 | Travaux électriques BT sous tension | Gate Niveau 1 |
| **CFST 2134.f** ch. 4.2.4 | Travaux forestiers dangereux | Gate Niveau 1 |
| **Ordonnance protection jeunes travailleurs** | Personnel < 18 ans | Blocage absolu — Zone 1 obligatoire |
| **OLT3** art. 26 | Conditions de travail | Contexte réglementaire général |

**Règles de conformité non négociables :**

- R1 — Travail réglementé = OUI → Zone 1 forcée (aucune exception)
- R2 — Personnel < 18 ans → Zone 1 obligatoire
- R3 — Zone 1 : surveillance ne remplace pas la présence d'une 2e personne
- R4 — t_max ≤ 0 → Zone 3 impossible → reclassement Zone 2
- R5 — Délai secours > 15 min en Zone 2 → avertissement ch. 7.2 SUVA
- R6 — Matrice SUVA non modifiable par l'utilisateur
- R7 — Tout rapport mentionne "SUVA 44094.F — Édition mai 2025"

### Technical Constraints

**Séparation [SUVA_CONST] / [CONFIG] :**
- Les constantes réglementaires (matrice, formules, références légales, gates) sont codées en dur dans le code source, annotées `// SUVA_REGULATORY_CONSTANT`
- Les éléments configurables (taxonomies, libellés, délais par entreprise) sont stockés dans Google Sheets et modifiables par l'utilisateur
- L'interface distingue visuellement les deux catégories (éléments grisés/verrouillés vs éditables)

**Intégrité des calculs :**
- Matrice SUVA 5×5 : résultat exact pour chaque combinaison gravité (I-V) × probabilité (A-E)
- Calcul t_max : `t_max = délai_type_blessure - temps_secouristes - temps_ambulance - temps_sauvetage`
- Scores composites et algorithmes de reclassement conformes à la spécification logique
- Aucune approximation ni arrondi non documenté

**Persistance et confidentialité :**
- Zéro backend propriétaire — les données restent chez le client (Google Sheets)
- localStorage pour la sauvegarde brouillon (données sensibles SST sur le device de l'utilisateur)
- OAuth2 Google avec scope limité au Sheet spécifique
- Aucune donnée personnelle des travailleurs analysés n'est stockée (l'analyse porte sur le poste, pas sur la personne)

### Integration Requirements

| Système | Type d'intégration | Détails |
|---------|-------------------|---------|
| **Google Sheets API v4** | Lecture/écriture | 5 onglets : Analyses, Config, Taxonomies, Zones_Textes, Travailleurs_Reg |
| **Google Identity Services** | OAuth2 | Authentification pour accès au Sheet du client |
| **jsPDF + html2canvas** | Export client-side | Génération PDF bi-couche sans serveur |
| **Blob API** | Export CSV | UTF-8 BOM pour compatibilité Excel Windows |

### Risk Mitigations

| Risque | Impact | Mitigation |
|--------|--------|-----------|
| **Erreur dans la matrice SUVA** | Décision réglementaire fausse → responsabilité légale | Tests unitaires exhaustifs sur les 25 cellules de la matrice + constantes codées en dur non modifiables |
| **Calcul t_max incorrect** | Reclassement manqué → sous-estimation du risque | Tests de validation avec cas limites (t_max = 0, négatif, limite exacte) |
| **Perte de données analyse** | Analyse perdue en cours de saisie | Double persistance : localStorage (automatique) + Google Sheets (synchronisation) |
| **Confusion [SUVA_CONST] / [CONFIG]** | L'utilisateur modifie un élément réglementaire | Verrouillage technique + distinction visuelle + message explicatif |
| **Évolution de la norme SUVA** | Édition future de la 44094.F avec modifications | Architecture permettant la mise à jour des constantes via fichier de configuration versionné (mais pas modifiable par l'utilisateur) |
| **Couverture réseau terrain** | Impossibilité de synchroniser Google Sheets sur site | localStorage comme couche de persistance primaire, synchronisation différée |

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Création de catégorie — Premier outil digital conforme SUVA 44094.F**
Il ne s'agit pas d'améliorer un outil existant mais de digitaliser une méthode réglementaire qui n'a jamais eu d'équivalent numérique. Aucun concurrent direct n'existe dans le marché suisse des PME/PMI.

**2. Surcouche opérationnelle sur une norme réglementaire**
L'innovation clé est d'aller au-delà de ce que la méthode SUVA couvre en ajoutant des dimensions opérationnelles concrètes : charge cognitive (C1-C3), matrice de fiabilité des outils d'alerte, décision différenciée par période. La norme fournit le cadre ; l'outil fournit l'intelligence opérationnelle qui manque.

**3. Vulgarisation computationnelle**
Les questionnaires intermédiaires en langage naturel qui calculent les codes techniques en coulisses (probabilité, charge cognitive) représentent un pattern de "computation invisible" — l'utilisateur répond à des questions simples, l'algorithme produit les valeurs réglementaires. Ce pattern est transposable à d'autres domaines réglementaires.

**4. Unité d'analyse TÂCHE × PÉRIODE**
Rompre avec l'analyse par poste de travail pour analyser par combinaison tâche × période est un changement conceptuel significatif qui reflète mieux la réalité terrain.

### Market Context & Competitive Landscape

- **Aucun concurrent direct** dans le marché suisse des outils conformes SUVA 44094.F
- **Alternatives indirectes** : formulaires papier SUVA, fichiers Excel non structurés, logiciels SST génériques (qui ne couvrent pas la logique à 4 niveaux)
- **Barrière d'entrée** : expertise métier SST + connaissance approfondie de la méthode SUVA + compréhension des contraintes opérationnelles terrain. Cette combinaison de savoirs est le différenciateur défensif.

### Validation Approach

| Innovation | Méthode de validation | Critère de succès |
|-----------|----------------------|-------------------|
| Outil digital conforme | Pierre-Alain utilise l'outil pour ses mandats réels | Préféré à la méthode manuelle actuelle en < 3 mois |
| Surcouche opérationnelle | Retour terrain des 4-5 premiers spécialistes STPS | Les dimensions supplémentaires (charge cognitive, fiabilité outil) sont jugées pertinentes et utilisées |
| Vulgarisation computationnelle | Test utilisateur : un spécialiste complète une analyse sans aide | Aucun blocage sur les questionnaires intermédiaires |
| Unité TÂCHE × PÉRIODE | Comparaison avec analyses existantes | Les résultats par période révèlent des différences significatives que l'analyse par poste masquait |

### Risk Mitigation

| Risque innovation | Fallback |
|-------------------|----------|
| Les spécialistes STPS préfèrent leur méthode manuelle | UX de qualité exceptionnelle + gain de temps démontrable (×4) pour forcer l'adoption |
| La surcouche opérationnelle est jugée non pertinente | Les dimensions [CONFIG] sont désactivables — le cœur SUVA reste fonctionnel seul |
| La vulgarisation produit des valeurs incorrectes | Mode expert permettant la saisie directe des codes techniques (bypass des questionnaires intermédiaires) |
| L'unité TÂCHE × PÉRIODE complexifie trop | Option de regroupement par poste dans le dashboard pour simplifier la vue consolidée |

## Web App Specific Requirements

### Project-Type Overview

Application web monopage (SPA) déployée en statique, sans backend propriétaire. L'architecture client-side-only est un choix délibéré : zéro dépendance serveur, données chez le client, déploiement sur CDN. Stack : React 18 + TypeScript + Vite + TailwindCSS (palette de couleurs Tailwind) + Shadcn UI (composants React accessibles basés sur Radix UI primitives, copiés dans le projet et stylés via Tailwind).

### Technical Architecture Considerations

**SPA avec routing client-side :**
- React Router pour la navigation entre modules (M1-M7)
- État global via React Context + useReducer (pas de Redux — complexité non justifiée)
- Wizard multi-step avec état persisté entre les étapes

**Support navigateurs :**

| Navigateur | Version minimum | Priorité |
|-----------|----------------|----------|
| Chrome / Edge | 2 dernières versions | Principale — usage desktop et tablette |
| Safari | 2 dernières versions | Secondaire — iPad terrain |
| Firefox | 2 dernières versions | Secondaire |
| Mobile Safari / Chrome Android | 2 dernières versions | Responsive tablette uniquement (pas smartphone-first) |

**SEO :**
- Non prioritaire — l'outil est une application métier, pas un site de contenu
- Page d'accueil statique avec description du produit pour le référencement de base
- Les analyses et rapports ne sont pas indexables (données privées)

**Temps réel :**
- Pas de temps réel serveur (pas de WebSocket/SSE)
- Recalcul réactif côté client : la sidebar résumé se met à jour instantanément à chaque modification dans le wizard
- La matrice et les scores se recalculent en temps réel lors de la navigation entre étapes

### Responsive Design

| Breakpoint | Cible | Comportement |
|-----------|-------|-------------|
| ≥ 1024px | Desktop | Layout complet : wizard + sidebar résumé côte à côte |
| 768px – 1023px | Tablette paysage | Sidebar sous le formulaire ou en drawer |
| < 768px | Tablette portrait / Mobile | Wizard pleine largeur, sidebar accessible via toggle. Fonctionnel mais optimisé pour tablette, pas smartphone |

Priorité : **tablette** pour les visites terrain (iPad, Android tablet). Le formulaire doit être utilisable sans zoom ni scroll horizontal.

### Implementation Considerations

> **Note :** Les cibles de performance et d'accessibilité sont définies dans la section [Non-Functional Requirements](#non-functional-requirements) (NFR1-NFR7 pour la performance, NFR13-NFR17 pour l'accessibilité). Bundle size cible : < 200KB gzipped.

**Génération d'exports côté client :**
- PDF via jsPDF + html2canvas : le rapport bi-couche est rendu en HTML puis capturé. Alternative : génération directe jsPDF pour un contrôle pixel-perfect
- CSV via Blob API avec BOM UTF-8 pour compatibilité Excel Windows (caractères accentués français)

**Google Sheets comme "backend" :**
- OAuth2 avec scope `spreadsheets` limité
- Gestion du quota API Google (100 requêtes/100s par utilisateur)
- Fallback gracieux si le Sheet n'est pas connecté (localStorage seul)
- Création automatique de la structure d'onglets au premier accès

**Offline-first pattern :**
- localStorage comme couche primaire de persistance
- Synchronisation Google Sheets quand disponible
- Aucune fonctionnalité bloquée si hors-ligne (sauf sync)

## Project Scoping & Development Strategy

### V1 Strategy & Philosophy

**Approche : V1 complète — pas de découpage MVP**

Le produit résout un problème métier précis (analyse de travailleurs isolés conforme SUVA) dans un domaine où aucune alternative digitale n'existe. Une méthode SUVA à moitié implémentée n'a aucune valeur terrain. La V1 livre l'intégralité des 44 FRs.

Le product brief le confirme : "La spécification logique est suffisamment détaillée et le périmètre fonctionnel suffisamment bien cerné pour construire le produit complet d'emblée. Pas de découpage MVP — V1 livre l'intégralité."

**Ressources :** Développeur solo (Pierre-Alain, vibecodeur) avec assistance IA.

### V1 Feature Set (44 FRs — intégralité)

**Tous les parcours utilisateurs supportés :** Marc — Analyse complète + Marc — Cas limite + Sandra — Rapport + Marc admin — Configuration entreprise

**Capacités V1 :**

| # | Capacité | Justification |
|---|----------|---------------|
| 1 | Wizard 4 niveaux complet (FR1-FR18) | Cœur du produit — sans ça, pas de produit |
| 2 | Gate réglementaire (14 questions GO/NO-GO) | Niveau 1 — arrêt immédiat si travail réglementé |
| 3 | Matrice SUVA 5×5 | Niveau 2 — calcul de la zone de base |
| 4 | Questionnaires intermédiaires en langage naturel | Différenciateur clé — vulgarisation computationnelle |
| 5 | Calcul t_max par période | Niveau 3 — faisabilité du sauvetage |
| 6 | Reclassement automatique (t_max ≤ 0 → Zone 2) | Règle R4 — sécurité réglementaire |
| 7 | Validation outil d'alerte | Niveau 4 — complète la chaîne d'analyse |
| 8 | Rapport bi-couche (FR19-FR24) | Valeur délivrée — couche 1 (cadre) + couche 2 (spécialiste) |
| 9 | Distinction visuelle [SUVA_CONST] / [CONFIG] | Confiance réglementaire |
| 10 | Persistance localStorage + Google Sheets (FR29-FR34) | Sauvegarde locale + synchronisation cloud |
| 11 | Export PDF + CSV | Livrable tangible — rapport professionnel + données brutes |
| 12 | Configuration entreprise (FR35-FR38) | Taxonomies, départements, équipements DATI |
| 13 | Dashboard consolidé (FR39-FR41) | Vue d'ensemble, filtres, alertes de révision |
| 14 | Guidage complet (FR42-FR44) | Aide contextuelle, sidebar résumé, onboarding |
| 15 | Déploiement statique (Vercel) | Mise en ligne immédiate, zéro ops |

### Séquence d'implémentation recommandée

L'implémentation suit un ordre logique de dépendances techniques, pas un découpage en phases de livraison :

| Étape | Bloc fonctionnel | Dépendances |
|-------|-----------------|-------------|
| 1 | Moteur de calcul (matrice SUVA, t_max, reclassement) | Aucune — fondation technique |
| 2 | Wizard 4 niveaux (FR1-FR18) | Moteur de calcul |
| 3 | Persistance localStorage (FR29-FR30) | Wizard |
| 4 | Rapport bi-couche + exports (FR19-FR24) | Wizard + moteur de calcul |
| 5 | Conformité réglementaire (FR25-FR28) | Transversal — intégré à chaque étape |
| 6 | Google Sheets + OAuth2 (FR31-FR34) | Wizard + persistance locale |
| 7 | Configuration entreprise (FR35-FR38) | Google Sheets |
| 8 | Dashboard consolidé (FR39-FR41) | Persistance |
| 9 | Guidage et aide (FR42-FR44) | Wizard complet |

### Risk Mitigation Strategy

**Risques techniques :**

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|-----------|
| Complexité du moteur de calcul (matrice + t_max + reclassement) | Moyenne | Élevé | La spécification logique est exhaustive — implémenter un algorithme à la fois, tester unitairement chaque cellule de la matrice |
| Génération PDF côté client (rendu complexe) | Moyenne | Moyen | Commencer par un export simple, itérer sur le design. Fallback : export HTML imprimable |
| Quota API Google Sheets | Faible | Moyen | localStorage comme couche primaire — Sheet en sync différée |
| Scope complet pour V1 | Moyenne | Moyen | Séquence d'implémentation par blocs indépendants — chaque bloc est testable isolément |

**Risques marché :**

| Risque | Mitigation |
|--------|-----------|
| Les spécialistes STPS ne changent pas leurs habitudes | Pierre-Alain est le premier utilisateur — validation terrain en conditions réelles avant diffusion |
| La norme SUVA évolue | Architecture avec constantes réglementaires isolées et versionnées |

**Risques ressource :**

| Risque | Mitigation |
|--------|-----------|
| Développeur solo = bus factor 1 | Code propre, TypeScript strict, tests unitaires sur le moteur de calcul |
| Scope V1 complet ambitieux pour une personne | Séquence d'implémentation par blocs — progression incrémentale mesurable, chaque bloc livre de la valeur testable |

## Functional Requirements

### Analyse guidée (Wizard)

- **FR1:** Le spécialiste peut créer une nouvelle analyse en identifiant l'entreprise, le département, le responsable, le titre de l'activité, la description, le nombre de personnes, la période de travail et la fréquence d'activité isolée
- **FR2:** Le spécialiste peut définir l'unité d'analyse comme une combinaison TÂCHE × PÉRIODE et créer au moins 2-3 analyses par poste pour capturer les variations par période (jour, nuit, weekend)
- **FR3:** Le spécialiste peut répondre à une checklist de 14 catégories de travaux réglementés avec les références légales associées (Gate Niveau 1)
- **FR4:** Le système stoppe l'analyse avec un motif légal précis si un travail réglementé est coché ou si le personnel est mineur (Gate NO-GO)
- **FR5:** Le spécialiste peut évaluer la gravité du dommage (I à V) via des questions intermédiaires en langage naturel sans manipuler les codes techniques
- **FR6:** Le spécialiste peut évaluer la probabilité d'accident (A à E) via des questions intermédiaires en langage naturel sans manipuler les codes techniques
- **FR7:** Le système calcule la zone de risque (1 à 4) à partir de la matrice SUVA 5×5 (Gate Niveau 2)
- **FR8:** Le spécialiste peut vérifier les aptitudes du travailleur selon 3 dimensions : psychique, physique, intellectuelle
- **FR9:** Le spécialiste peut décrire le danger identifié via un champ texte structuré (150-300 caractères) avec une liste déroulante de catégories de dangers prédéfinies par type de travail réglementé
- **FR10:** Le spécialiste peut saisir les conditions opérationnelles : couverture réseau, équipements DATI, centrale d'alarme, délais de secouristes (jour/nuit), délais secours publics
- **FR11:** Le système calcule le t_max par période et détermine la faisabilité du sauvetage (Gate Niveau 3)
- **FR12:** Le système reclasse automatiquement en Zone 2 si t_max ≤ 0 pour une période donnée
- **FR13:** Le spécialiste peut valider l'outil d'alerte en fonction de la compatibilité zone × équipement × couverture × charge cognitive (Gate Niveau 4)
- **FR14:** Le spécialiste peut évaluer la charge cognitive de la tâche (C1-C3) via des questions en langage naturel
- **FR15:** Le spécialiste peut documenter le concept d'urgence selon les 4 composantes SUVA : alerte, premiers secours, formation, accès des secours
- **FR16:** Le spécialiste peut documenter la formation et la validation (date, formateur, documentation, date de révision)
- **FR17:** Le spécialiste peut naviguer librement entre les étapes du wizard (retour arrière, modification)
- **FR18:** Le système recalcule les résultats en temps réel lorsque le spécialiste modifie une valeur

### Rapport et exports

- **FR19:** Le système génère un rapport bi-couche : couche 1 en langage naturel (décisions, actions concrètes) et couche 2 en détail technique (scores, matrices, références légales)
- **FR20:** Le spécialiste peut exporter le rapport en PDF professionnel
- **FR21:** Le spécialiste peut exporter les données d'analyse en CSV compatible Excel Windows
- **FR22:** Le rapport distingue visuellement les exigences réglementaires des recommandations opérationnelles
- **FR23:** Le rapport affiche la zone de risque avec un badge coloré et les mesures de surveillance correspondantes
- **FR24:** Le rapport mentionne systématiquement la référence "SUVA 44094.F — Édition mai 2025"

### Conformité réglementaire

- **FR25:** Le système implémente la matrice SUVA 5×5 exacte comme constante non modifiable
- **FR26:** Le système applique les 7 règles de conformité non négociables (R1 à R7) sans exception
- **FR27:** Le système distingue visuellement les éléments [SUVA_CONST] (verrouillés, non modifiables) des éléments [CONFIG] (paramétrables)
- **FR28:** Le système affiche les références légales exactes à chaque étape pertinente du wizard

### Persistance et données

- **FR29:** Le système sauvegarde automatiquement l'analyse en cours localement dans le navigateur (toutes les 30s ou à chaque changement d'étape)
- **FR30:** Le spécialiste peut reprendre une analyse interrompue après fermeture du navigateur ou coupure de courant
- **FR31:** Le spécialiste peut connecter un espace de stockage cloud d'entreprise pour la synchronisation des données
- **FR32:** Le système synchronise les analyses avec l'espace de stockage cloud connecté
- **FR33:** Le système crée automatiquement la structure de données dans l'espace de stockage cloud au premier accès
- **FR34:** Le système reste 100% fonctionnel sans connexion internet (sauvegarde locale seule, synchronisation cloud différée)

### Configuration entreprise

- **FR35:** Le spécialiste peut configurer les départements et services de l'entreprise
- **FR36:** Le spécialiste peut configurer la liste des équipements DATI disponibles
- **FR37:** Le spécialiste peut personnaliser jusqu'à 5 champs taxonomiques [CONFIG] (départements, types d'équipement, types d'alerte, libellés de fréquence, prestataires de formation) avec validation de format
- **FR38:** Le spécialiste ne peut pas modifier les constantes réglementaires [SUVA_CONST]

### Dashboard et consolidation

- **FR39:** Le spécialiste peut consulter la liste de toutes les analyses sauvegardées avec leur statut et leur zone
- **FR40:** Le spécialiste peut filtrer et rechercher des analyses par entreprise, département, zone, statut
- **FR41:** Le système signale les analyses dont la date de révision est dépassée

### Guidage et aide contextuelle

- **FR42:** Le système affiche un tooltip d'aide contextuelle sur 100% des champs de saisie du wizard (Niveaux 1-4), couvrant la définition réglementaire, un exemple et les erreurs courantes
- **FR43:** Le système affiche un résumé dynamique de l'analyse en cours mis à jour en temps réel
- **FR44:** Le système présente un écran d'introduction expliquant la méthode en 3 étapes

## Non-Functional Requirements

### Performance

| NFR | Critère | Mesure |
|-----|---------|--------|
| **NFR1** | Chargement initial de l'application | < 2s sur connexion 4G (CDN statique) |
| **NFR2** | Transition entre étapes du wizard | < 100ms (rendu côté client uniquement) |
| **NFR3** | Recalcul matrice/t_max/zone après modification | < 50ms (instantané perçu) |
| **NFR4** | Génération du rapport bi-couche (rendu HTML) | < 500ms |
| **NFR5** | Export PDF complet | < 5s pour un rapport de 3-4 pages |
| **NFR6** | Sauvegarde localStorage | < 100ms (non bloquant) |
| **NFR7** | Synchronisation Google Sheets | < 3s par opération |

### Security

| NFR | Critère | Mesure |
|-----|---------|--------|
| **NFR8** | Authentification Google | OAuth2 avec scope minimal (`spreadsheets` uniquement) — aucun accès au Drive, Gmail ou profil |
| **NFR9** | Stockage local | Aucune donnée personnelle des travailleurs analysés dans localStorage — l'analyse porte sur le poste, pas sur la personne |
| **NFR10** | Transmission des données | HTTPS obligatoire pour toutes les communications avec l'API Google Sheets |
| **NFR11** | Token management | Les tokens OAuth2 ne sont jamais stockés en clair dans localStorage — utilisation de la session Google uniquement |
| **NFR12** | Isolation des données | Chaque entreprise accède uniquement à son propre Google Sheet — aucune donnée croisée entre entreprises |

### Accessibility

| NFR | Critère | Mesure |
|-----|---------|--------|
| **NFR13** | Conformité WCAG | 2.1 niveau AA |
| **NFR14** | Navigation clavier | 100% du wizard navigable au clavier (Tab, Enter, Escape) |
| **NFR15** | Contraste couleurs | Ratio ≥ 4.5:1 pour tout texte, y compris les badges de zone Z1-Z4 |
| **NFR16** | Labels ARIA | Tous les champs de formulaire, la matrice des risques et les badges de zone ont des labels ARIA |
| **NFR17** | Focus visible | Outline de focus visible sur tous les éléments interactifs |

### Integration

| NFR | Critère | Mesure |
|-----|---------|--------|
| **NFR18** | Google Sheets API v4 | Respect du quota (100 requêtes/100s/utilisateur) — batch des écritures si nécessaire |
| **NFR19** | Dégradation gracieuse | Si Google Sheets est indisponible, l'application reste 100% fonctionnelle en mode localStorage |
| **NFR20** | Compatibilité export CSV | UTF-8 BOM + séparateur point-virgule pour compatibilité Excel Windows français |
| **NFR21** | Compatibilité export PDF | Rendu correct des caractères accentués français et des tableaux de la matrice SUVA |

### Reliability

| NFR | Critère | Mesure |
|-----|---------|--------|
| **NFR22** | Zéro perte de données | Sauvegarde automatique localStorage toutes les 30s ou à chaque changement d'étape du wizard |
| **NFR23** | Reprise après interruption | 100% des analyses en cours récupérables après fermeture de navigateur ou crash |
| **NFR24** | Exactitude des calculs | 100% de conformité matrice SUVA — couvert par tests unitaires sur les 25 cellules + tous les cas limites de t_max |
| **NFR25** | Disponibilité | 99.9% — hébergement statique CDN (Vercel/Cloudflare), aucune dépendance serveur pour le fonctionnement de base |
