---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
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
