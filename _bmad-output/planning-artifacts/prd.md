---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
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
