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

L'application est sans backend propriétaire : les données sont stockées chez le client via Google Sheets, avec sauvegarde locale en localStorage. Stack technique : React 18, TypeScript, Vite, TailwindCSS, DaisyUI. Déploiement statique sur Vercel ou Cloudflare Pages.

Utilisateurs cibles : les spécialistes STPS / consultants SST qui conduisent les analyses (utilisateurs primaires), les cadres et collaborateurs terrain qui reçoivent et appliquent les conclusions (destinataires du rapport).

### What Makes This Special

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
| **Modèle économique** | À définir | Outil gratuit en phase 1 — monétisation à évaluer après validation terrain |

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

## Product Scope

### MVP - Minimum Viable Product

> **Note importante :** Le product brief définit explicitement qu'il n'y a pas de découpage MVP progressif. La V1 livre l'intégralité des fonctionnalités car la spécification logique est suffisamment détaillée et le périmètre bien cerné. Cependant, pour structurer le développement, le scope est organisé en phases de livraison.

**Phase 1 — Cœur fonctionnel (MVP technique) :**
- Wizard 4 niveaux complet (gate réglementaire → matrice SUVA → faisabilité sauvetage → validation outil d'alerte)
- Questionnaires intermédiaires en langage naturel
- Moteur de calcul complet (matrice SUVA, t_max, scores composites, reclassement automatique)
- Rapport bi-couche (langage naturel + détail technique)
- Distinction visuelle [SUVA_CONST] / [CONFIG]
- Unité d'analyse TÂCHE × PÉRIODE
- Persistance localStorage + export PDF/CSV
- Déploiement statique

**Phase 2 — Intégration données :**
- Connexion Google Sheets (OAuth2, synchronisation, multi-tenant)
- Configuration entreprise de base
- Sidebar résumé temps réel

### Growth Features (Post-MVP)

- Dashboard consolidé (vue d'ensemble multi-analyses, statuts, alertes de révision)
- Taxonomies paramétrables complètes
- Logo entreprise dans PDF
- Écran d'introduction / onboarding 3 étapes
- Mode comparaison entre analyses
- Import CSV

### Vision (Future)

- Multi-langue (allemand, italien) pour couvrir toute la Suisse
- Bibliothèque de cas types par secteur (industrie, BTP, santé, agriculture)
- Mode collaboratif multi-spécialistes
- API / connecteurs vers logiciels SST du marché suisse
- Intelligence augmentée (suggestions basées sur l'historique)
- Certification / labellisation officielle SUVA ou organismes STPS
- PWA mode hors-ligne pour les visites terrain sans réseau

## User Journeys

### Parcours 1 — Marc, Spécialiste STPS : L'analyse complète (chemin principal)

**Scène d'ouverture :** Marc, 47 ans, consultant SST, arrive dans une PME industrielle pour analyser les postes de travailleurs isolés. Jusqu'ici, il passait 3-4 heures par analyse avec son classeur SUVA, ses feuilles Excel et sa calculatrice. À chaque mandat, il reproduisait le même travail artisanal, avec le sentiment que ses conclusions étaient défendables mais mal documentées. Aujourd'hui, il ouvre la webapp sur sa tablette.

**Action montante :** Marc crée une nouvelle analyse. Il identifie le poste : "Contrôle des cuves de stockage — Week-end". Le wizard l'emmène au Niveau 1. Les 14 questions réglementaires s'affichent avec les références légales exactes. Il coche "Travaux en réservoirs / locaux exigus" → l'application affiche immédiatement : **Zone 1 — Travail isolé INTERDIT** avec la référence SUVA 1416.f ch. 2.3. L'analyse s'arrête net avec un motif légal précis.

Marc revient en arrière et lance une deuxième analyse pour un autre poste : "Ronde de surveillance site industriel — Nuit". Cette fois, aucun travail réglementé n'est coché. Le wizard passe au Niveau 2. Les questions intermédiaires en langage naturel l'aident à déterminer la gravité (III — Moyen) et la probabilité (C — Rare). Il ne manipule aucun code — l'outil traduit ses réponses. La matrice affiche : **Zone 3b**.

Le Niveau 3 calcule le t_max pour la période nuit : les délais de secouristes de nuit (25 min) et des secours publics (18 min) produisent un t_max de 12 minutes. Faisable. Le Niveau 4 valide l'outil d'alerte : un PTI GSM avec couverture réseau partielle. La matrice de fiabilité alerte sur la couverture — Marc note une mesure corrective.

**Climax :** Marc génère le rapport bi-couche. La couche 1 affiche en langage clair : "Ronde de surveillance autorisée en période nuit sous condition d'un contrôle périodique toutes les 4h et d'un PTI avec vérification de couverture réseau." La couche 2 détaille les scores, la matrice, les formules de t_max et les références SUVA. Pour la première fois, Marc a un rapport qu'il peut envoyer directement au cadre sans devoir le "traduire".

**Résolution :** Marc exporte le PDF, le synchronise sur le Google Sheet du client. L'analyse complète a pris 22 minutes. Il programme la date de révision à 12 mois. Sur le dashboard, il voit les 5 analyses du site consolidées avec leurs zones respectives. Il envoie le rapport couche 1 à Sandra, la responsable d'exploitation.

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
| **Marc — Analyse complète** | Wizard 4 niveaux, questionnaires intermédiaires, matrice SUVA, calcul t_max, rapport bi-couche, export PDF, synchronisation Google Sheets, sidebar résumé temps réel, programmation date de révision |
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

Application web monopage (SPA) déployée en statique, sans backend propriétaire. L'architecture client-side-only est un choix délibéré : zéro dépendance serveur, données chez le client, déploiement sur CDN. Le stack React 18 + TypeScript + Vite + TailwindCSS + DaisyUI est défini dans le cahier des charges.

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

### Performance Targets

| Métrique | Cible | Justification |
|---------|-------|---------------|
| First Contentful Paint | < 1.5s | Déploiement statique CDN — pas de SSR nécessaire |
| Time to Interactive | < 2s | Bundle léger, pas de backend à attendre |
| Transition entre étapes wizard | < 100ms | Tout est côté client, recalcul instantané |
| Génération PDF | < 5s | jsPDF + html2canvas côté client |
| Bundle size (gzipped) | < 200KB | React + TailwindCSS + DaisyUI + jsPDF |

### Accessibility

| Niveau | Cible | Détails |
|--------|-------|---------|
| **WCAG** | 2.1 AA | Minimum requis pour une application professionnelle |
| Navigation clavier | Complète | Toutes les étapes du wizard navigables au clavier |
| Contraste couleurs | Ratio ≥ 4.5:1 | Attention particulière aux badges de zone (couleurs Z1-Z4 sur fond blanc) |
| Lecteur d'écran | Labels ARIA | Formulaires, matrice des risques, badges de zone |
| Focus visible | Outline visible | Navigation claire dans le wizard multi-step |

### Implementation Considerations

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

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**Approche MVP : "Problem-Solving MVP" complet**

Le produit résout un problème métier précis (analyse de travailleurs isolés conforme SUVA) dans un domaine où aucune alternative digitale n'existe. La stratégie n'est pas de livrer un sous-ensemble minimal, mais de livrer la **méthode complète en version digitale** — car une méthode SUVA à moitié implémentée n'a aucune valeur terrain.

Le product brief le confirme : "La spécification logique est suffisamment détaillée et le périmètre fonctionnel suffisamment bien cerné pour construire le produit complet d'emblée."

**Ressources :** Développeur solo (Pierre-Alain, vibecodeur) avec assistance IA.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported :** Marc — Analyse complète + Marc — Cas limite

**Must-Have Capabilities :**

| # | Capacité | Justification |
|---|----------|---------------|
| 1 | Wizard 4 niveaux complet | Cœur du produit — sans ça, pas de produit |
| 2 | Gate réglementaire (14 questions GO/NO-GO) | Niveau 1 — arrêt immédiat si travail réglementé |
| 3 | Matrice SUVA 5×5 | Niveau 2 — calcul de la zone de base |
| 4 | Questionnaires intermédiaires en langage naturel | Différenciateur clé — vulgarisation computationnelle |
| 5 | Calcul t_max par période | Niveau 3 — faisabilité du sauvetage |
| 6 | Reclassement automatique (t_max ≤ 0 → Zone 2) | Règle R4 — sécurité réglementaire |
| 7 | Validation outil d'alerte | Niveau 4 — complète la chaîne d'analyse |
| 8 | Rapport bi-couche | Valeur délivrée — couche 1 (cadre) + couche 2 (spécialiste) |
| 9 | Distinction visuelle [SUVA_CONST] / [CONFIG] | Confiance réglementaire |
| 10 | Persistance localStorage | Sauvegarde automatique, reprise d'analyse interrompue |
| 11 | Export PDF | Livrable tangible — le rapport professionnel |
| 12 | Export CSV | Intégration avec les systèmes existants |
| 13 | Déploiement statique (Vercel) | Mise en ligne immédiate, zéro ops |

**Explicitement hors Phase 1 :**
- Google Sheets (ajouté en Phase 2)
- Dashboard consolidé (Phase 3)
- Sidebar résumé temps réel (Phase 2)
- Onboarding / introduction (Phase 3)

### Post-MVP Features

**Phase 2 — Intégration données :**

| # | Fonctionnalité | Dépend de |
|---|---------------|-----------|
| 1 | Connexion Google Sheets (OAuth2) | Phase 1 complète |
| 2 | Synchronisation analyses → Sheet | Connexion OAuth2 |
| 3 | Lecture configuration entreprise depuis Sheet | Connexion OAuth2 |
| 4 | Sidebar résumé temps réel | Wizard Phase 1 |
| 5 | Configuration entreprise de base | Google Sheets |

**Parcours débloqué :** Marc admin — Configuration entreprise + Sandra — Rapport (via consolidation Sheet)

**Phase 3 — Expérience complète :**

| # | Fonctionnalité | Valeur ajoutée |
|---|---------------|----------------|
| 1 | Dashboard consolidé multi-analyses | Vue d'ensemble par entreprise |
| 2 | Taxonomies paramétrables complètes | Personnalisation métier |
| 3 | Logo entreprise dans PDF | Professionnalisme du rapport |
| 4 | Écran d'introduction / onboarding | Autonomie des nouveaux utilisateurs |
| 5 | Alertes de révision | Conformité continue |
| 6 | Mode comparaison entre analyses | Aide à la décision |
| 7 | Import CSV | Migration données existantes |

### Risk Mitigation Strategy

**Risques techniques :**

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|-----------|
| Complexité du moteur de calcul (matrice + t_max + reclassement) | Moyenne | Élevé | La spécification logique est exhaustive — implémenter un algorithme à la fois, tester unitairement chaque cellule de la matrice |
| Génération PDF côté client (rendu complexe) | Moyenne | Moyen | Commencer par un export simple, itérer sur le design. Fallback : export HTML imprimable |
| Quota API Google Sheets | Faible | Moyen | localStorage comme couche primaire — Sheet en sync différée |

**Risques marché :**

| Risque | Mitigation |
|--------|-----------|
| Les spécialistes STPS ne changent pas leurs habitudes | Pierre-Alain est le premier utilisateur — validation terrain en conditions réelles avant diffusion |
| La norme SUVA évolue | Architecture avec constantes réglementaires isolées et versionnées |

**Risques ressource :**

| Risque | Mitigation |
|--------|-----------|
| Développeur solo = bus factor 1 | Code propre, TypeScript strict, tests unitaires sur le moteur de calcul |
| Scope trop large pour une personne | Phases clairement découpées — Phase 1 livrable indépendamment |
