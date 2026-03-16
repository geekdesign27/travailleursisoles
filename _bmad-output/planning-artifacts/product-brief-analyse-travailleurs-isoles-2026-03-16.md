---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - docs/cahier-des-charges.md
  - docs/specification-logique-analyse.md
date: 2026-03-16
author: Pierre-Alain
---

# Product Brief: Analyse Travailleurs Isolés - SUVA 44094.F

## Résumé exécutif

La webapp **Analyse Travailleurs Isolés** est le premier outil digital suisse conforme à la méthode SUVA 44094.F (édition mai 2025) qui permet aux entreprises de conduire, documenter et tracer leurs analyses de postes de travailleurs isolés. Elle remplace les formulaires papier et Excel non structurés par un wizard guidé en 4 niveaux avec gates GO/NO-GO, produisant des décisions réglementaires claires et des rapports professionnels exportables.

---

## Vision produit

### Problème central

L'analyse des postes de travailleurs isolés en Suisse repose aujourd'hui sur des approches subjectives et peu tangibles. La méthode SUVA 44094.F fournit un cadre structuré, mais son application terrain reste manuelle, fragmentée et sous-documentée. Les spécialistes STPS et chargés de sécurité au travail manquent d'un outil qui transforme cette méthode en un processus d'analyse complet, digital et visuel — de la gate réglementaire jusqu'à la validation de l'outil d'alerte.

### Impact du problème

- **Pour les spécialistes STPS** : des heures perdues à produire des analyses sur papier ou Excel, sans cohérence ni traçabilité. Impossibilité de consolider les résultats à l'échelle d'une entreprise.
- **Pour les cadres et le management** : aucune visibilité claire sur la conformité réglementaire de leurs postes isolés. Décisions prises sans données structurées.
- **Pour les collaborateurs** : une protection qui dépend de la rigueur individuelle du responsable SST, sans processus standardisé ni aide à la décision.
- **Pour la conformité légale** : risque de non-conformité OPA art. 8 al. 1 difficile à détecter et à corriger sans outil adapté.

### Pourquoi les solutions existantes échouent

Aucun outil digital simple, guidé et conforme SUVA n'existe pour les PME/PMI suisses. Les solutions actuelles :

- **Formulaires papier SUVA** : pas de calcul automatique, pas de traçabilité, pas d'aide à la décision
- **Fichiers Excel non structurés** : mélangent les concepts (fréquence de tâche vs probabilité d'accident), ne couvrent pas les 4 niveaux d'analyse, pas de validation croisée
- **Logiciels SST génériques** : ne sont pas spécifiquement conçus pour la méthode SUVA 44094.F et sa logique à 4 niveaux avec gates séquentiels
- **La méthode SUVA elle-même** ne couvre pas tous les éléments opérationnels (charge cognitive, validation de l'outil d'alerte, décision par période)

### Solution proposée

Une webapp publique, légère, sans backend propriétaire, connectée à Google Sheets, qui implémente un **wizard conditionnel en 4 niveaux** :

1. **Gate réglementaire** — 14 questions GO/NO-GO avec références légales exactes
2. **Matrice des risques SUVA** — gravité × probabilité → zone de base (1 à 4)
3. **Gate de faisabilité du sauvetage** — calcul du t_max par période (jour/nuit/weekend), reclassement automatique si délais incompatibles
4. **Validation de l'outil d'alerte** — compatibilité équipement × zone × charge cognitive × fréquence × réseau

Chaque niveau produit une décision claire et peut arrêter l'analyse avec un motif légal précis. L'unité d'analyse est la combinaison **TÂCHE × PÉRIODE**, pas le poste de travail.

### Différenciateurs clés

- **Conformité réglementaire intégrée** : constantes SUVA codées en dur, non modifiables, matrice officielle exacte, références légales à chaque étape
- **Surcouche opérationnelle unique** : charge cognitive (C1-C3), matrice de fiabilité des outils, décision différenciée par période — des dimensions que la méthode SUVA seule ne couvre pas
- **Vulgarisation intelligente** : questionnaires intermédiaires qui calculent les codes techniques (probabilité, charge cognitive) à partir de questions en langage naturel
- **Autonomie totale** : aucun backend, données chez le client (Google Sheets), déploiement statique, zéro dépendance
- **Outil de présentation** : résultats en deux couches (langage naturel pour le management + détail technique pour les spécialistes)

---

## Utilisateurs cibles

### Utilisateurs primaires

**Persona : Marc, 47 ans — Spécialiste STPS / Consultant SST**

- **Contexte** : Travaille comme chargé de sécurité interne ou consultant SST externe pour des PME/PMI industrielles suisses. Connaît bien l'OPA et la documentation SUVA. Le même profil qu'il soit interne à une entreprise ou consultant externe.
- **Frustration actuelle** : Dispose de la doc SUVA 44094.F mais aucun outil ne l'aide à formaliser les valeurs limites (délais de secours, couverture réseau, moyens de surveillance, variation par tâche et non par poste). Chaque analyse est un exercice artisanal, difficilement reproductible et peu défendable face au management. Aucun système clair et complet ne fournit une aide décisionnelle basée sur des éléments mesurables et explicites.
- **Besoin clé** : Un outil qui transforme la méthode SUVA en décisions explicites, traçables et présentables — pas un formulaire à remplir, mais un système qui calcule, décide et justifie.
- **Moment "aha!"** : Quand le rapport produit une conclusion claire par période avec les mesures concrètes à mettre en place, et que le cadre comprend sans poser de questions.

### Utilisateurs secondaires (destinataires du rapport)

**Persona : Sandra, 52 ans — Responsable d'exploitation / Cadre**

- **Contexte** : Gère une équipe avec des postes isolés. N'a jamais lu la doc SUVA. Pour elle, le travailleur isolé c'est "quelqu'un qui travaille seul" sans plus de nuance.
- **Frustration actuelle** : Le spécialiste SST lui dit "il faut un PTI" ou "il faut réorganiser" mais elle ne comprend pas pourquoi, ni sur quelle base. Elle a l'impression qu'on exagère les contraintes sans fondement clair. La méthode d'évaluation est inconnue et très peu définie pour elle.
- **Besoin clé** : Un document qui dit en langage clair : autorisé ou interdit, et voici exactement ce que vous devez mettre en place concrètement. Pas de codes, pas de zones — des actions.

**Persona : Luca, 34 ans — Collaborateur terrain**

- **Contexte** : Effectue des tâches en situation d'isolement. N'est pas impliqué dans l'analyse mais en subit les conséquences (équipement imposé, procédures modifiées).
- **Besoin clé** : Comprendre pourquoi on lui impose tel équipement ou telle contrainte. Le rapport doit pouvoir lui être montré et être compréhensible.

### Parcours utilisateur

- **Découverte** : Le spécialiste STPS découvre l'outil via recommandation professionnelle ou recherche liée à la SUVA 44094.F
- **Onboarding** : Écran d'introduction en 3 étapes (définition travailleur isolé, vue d'ensemble des 4 niveaux, liste des informations à préparer)
- **Usage principal** : Le spécialiste conduit l'analyse via le wizard guidé → produit un rapport
- **Valeur délivrée** : Le rapport couche 1 (langage naturel) est envoyé au cadre / montré au collaborateur. Le spécialiste conserve la couche 2 (détail technique) pour son dossier de conformité
- **Cycle** : Révision planifiée selon la date définie dans l'analyse, ou lors de changement de conditions (nouvelle tâche, nouvel équipement, modification des délais de secours)

---

## Métriques de succès

### Succès utilisateur

| Métrique | Indicateur | Cible |
|----------|-----------|-------|
| **Temps par analyse** | Durée entre le début du wizard et le rapport finalisé | < 30 minutes pour une analyse complète (vs estimé 2-4h sur papier/Excel) |
| **Qualité du rapport** | Analyse complète sans champ manquant ni incohérence détectée | 100% des analyses finalisées passent toutes les validations |
| **Clarté de saisie** | L'utilisateur ne bloque jamais sur une question — les questionnaires intermédiaires et fourchettes suffisent | < 1 utilisation du bouton "Je ne sais pas" par analyse en moyenne |
| **Acceptation par le cadre** | Le rapport couche 1 est compris et accepté sans reformulation nécessaire | Le spécialiste n'a pas besoin de "traduire" le rapport oralement |

### Objectifs business

| Objectif | Horizon | Indicateur |
|----------|---------|-----------|
| **Validation terrain** | 3 mois | Pierre-Alain utilise l'outil pour ses propres mandats et le préfère à sa méthode actuelle |
| **Adoption pair-à-pair** | 6 mois | 4-5 collègues spécialistes STPS utilisent l'outil activement |
| **Positionnement expert** | 12 mois | L'outil devient une référence citée dans le milieu SST suisse romand |
| **Modèle économique** | À définir | Outil gratuit en phase 1 — monétisation à évaluer après validation terrain |

### KPIs de qualité produit

| KPI | Mesure | Cible |
|-----|--------|-------|
| **Taux de complétion** | % d'analyses démarrées qui arrivent au rapport final | > 80% |
| **Fine-tuning utilisateur** | L'utilisateur peut ajuster les éléments configurables [CONFIG] et comprend ce qui est modifiable vs réglementaire [SUVA_CONST] | Distinction claire dans l'interface |
| **Exactitude des calculs** | Résultats conformes à la matrice SUVA et aux formules de la spécification | 100% — zéro écart sur les constantes réglementaires |
| **Image concrète** | Le rapport donne une vision claire et actionnable de la situation | Chaque analyse produit des mesures concrètes, pas des zones abstraites |
