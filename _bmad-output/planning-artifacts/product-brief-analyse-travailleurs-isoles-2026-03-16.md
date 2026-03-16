---
stepsCompleted: [1, 2]
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
