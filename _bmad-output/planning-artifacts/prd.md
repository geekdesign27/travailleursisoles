---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
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
