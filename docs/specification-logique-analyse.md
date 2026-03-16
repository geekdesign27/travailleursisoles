# SPÉCIFICATION COMPLÈTE — LOGIQUE D'ANALYSE TRAVAILLEUR ISOLÉ

## Méthode SUVA 44094.F + Surcouche opérationnelle

**Version 1.0 — Document de référence pour implémentation**

---

## PRÉAMBULE — PRINCIPES FONDAMENTAUX

Ce document décrit la logique complète d'une webapp d'analyse des postes de travail de travailleurs isolés. Elle est fondée sur la méthode officielle SUVA 44094.F (édition mai 2025), obligatoire en Suisse selon l'OPA art. 8 al. 1, enrichie d'une surcouche opérationnelle qui rend les conclusions concrètes et directement applicables.

### Ce qui est RÉGLEMENTAIRE et non modifiable

Tout élément marqué **[SUVA_CONST]** est une constante réglementaire. Elle ne peut pas être modifiée par configuration utilisateur. Elle est codée en dur.

### Ce qui est CONFIGURABLE par l'entreprise

Tout élément marqué **[CONFIG]** peut être personnalisé dans les paramètres de l'entreprise.

### Unité d'analyse

L'unité d'analyse n'est pas le poste de travail mais la combinaison **TÂCHE × PÉRIODE**. Un même poste peut générer plusieurs analyses si la situation de travail isolé varie selon les activités ou les horaires. Chaque combinaison produit une fiche indépendante avec sa propre zone et ses propres mesures.

---

## PARTIE 1 — STRUCTURE DU FORMULAIRE D'ANALYSE

L'analyse est un wizard conditionnel en 4 niveaux séquentiels. Chaque niveau peut produire un NO-GO qui arrête l'analyse. Si aucun NO-GO n'est atteint, on descend au niveau suivant.

```
NIVEAU 1 → Gate réglementaire (GO/NO-GO binaire)
NIVEAU 2 → Matrice des risques SUVA (zone de base)
NIVEAU 3 → Gate de faisabilité du sauvetage (GO/NO-GO par période)
NIVEAU 4 → Validation de l'outil d'alerte (GO/NO-GO par outil)
           ↓
           DÉCISION FINALE + MESURES OBLIGATOIRES
```

---

## PARTIE 2 — IDENTIFICATION (pré-analyse)

Avant d'entrer dans les niveaux, collecter les données d'identification. Ces données structurent le contexte mais n'entrent pas dans les calculs.

### 2.1 Données administratives [CONFIG]

- Entreprise
- Département / Service (hiérarchie à 2 niveaux, liste configurable)
- Responsable de l'analyse (nom + rôle)
- Numéro d'analyse (UUID auto-généré)
- Date de l'analyse
- Date de révision planifiée

### 2.2 Description de la tâche analysée

- Titre de la tâche (libellé court, max 80 caractères)
- Description détaillée (travaux prévus, environnement, équipements utilisés)
- Nombre de personnes effectuant cette tâche en simultané (si > 1 : afficher info "poste non isolé en fonctionnement normal, mais l'analyse couvre les périodes où la personne serait seule")

### 2.3 Contexte temporel — CRITIQUE

Ces données conditionnent l'ensemble de l'analyse. Elles doivent être renseignées avec précision.

**Période(s) de travail active(s)** (sélection multiple obligatoire) :

- **JOUR** : heures d'exploitation normales, collègues/équipes présents dans l'entreprise
- **NUIT** : en dehors des heures d'exploitation, bâtiment peu ou pas occupé
- **WEEKEND** : samedi, dimanche, jours fériés

> **Important** : si plusieurs périodes sont sélectionnées, l'analyse de faisabilité (Niveau 3) est calculée SÉPARÉMENT pour chaque période active. Les conclusions peuvent donc différer d'une période à l'autre.

**Fréquence de la tâche isolée** [CONFIG — libellés modifiables, codes fixes] :

- **F0** : Jamais ou marginale — moins de 1 fois par trimestre
- **F1** : Rare — 1 à 3 fois par mois
- **F2** : Régulière — 1 à 2 fois par semaine
- **F3** : Fréquente — quotidienne ou quasi-quotidienne

> Rôle de la fréquence : elle n'entre pas dans le calcul de la matrice. Elle influence la validation de l'outil d'alerte (Niveau 4) et documente l'exposition cumulée dans le rapport.

**Charge cognitive de la tâche** :

- **C1 — Faible** : ronde de surveillance, tâche administrative terrain, monitoring. Personne mobile, disponible mentalement pour déclencher une alerte.
- **C2 — Moyenne** : opération technique standard, maintenance préventive planifiée, procédure connue et maîtrisée.
- **C3 — Élevée** : dépannage, intervention d'urgence, manipulation complexe ou inhabituelle. Attention mobilisée sur la tâche — risque d'incapacitation soudaine sans avoir pu déclencher l'alerte.

> Rôle de la charge cognitive : elle entre dans la validation de l'outil d'alerte (Niveau 4). C3 impose un système à déclenchement automatique.

---

## PARTIE 3 — NIVEAU 1 : GATE RÉGLEMENTAIRE

### Objectif

Identifier immédiatement les situations où le travail isolé est légalement interdit, indépendamment de tout autre facteur.

### Fonctionnement

Présenter une checklist de 14 questions. Chaque question a trois réponses possibles : **OUI / NON / HORS PÉRIMÈTRE**. Un seul OUI déclenche un NO-GO absolu avec le motif légal exact.

### Questions et références [SUVA_CONST — textes légaux non modifiables, libellés de questions modifiables]

| # | Question | Référence légale | Exigence si OUI |
|---|----------|-----------------|-----------------|
| Q1 | Ce travail implique-t-il des interventions sur des installations électriques SOUS TENSION ? | OIBT RS 734.27 art. 22 al. 3 | 2 personnes obligatoires, une désignée responsable |
| Q2 | Ce travail implique-t-il de pénétrer dans un réservoir, fosse, cuve, canal, puits ou local exigu avec présence de substances inflammables ou nocives ? | SUVA 1416.f ch. 2.3 | Minimum 2 personnes, une dédiée à la surveillance permanente |
| Q3 | Ce travail implique-t-il de la peinture au pistolet à l'intérieur d'un réservoir ou d'une zone confinée ? | RS 832.314.12 art. 32 | Surveillance externe permanente par une 2e personne |
| Q4 | Ce travail implique-t-il des travaux sur cordes ou l'utilisation d'un système d'arrêt des chutes (EPI antichute) ? | OTConst art. 118 et 119 | Minimum 2 travailleurs pouvant se surveiller mutuellement |
| Q5 | Ce travail implique-t-il des opérations de déconstruction ou de démolition ? | OTConst art. 81 al. 2b | Surveillance permanente d'une personne compétente |
| Q6 | Ce travail implique-t-il de travailler sur ou aux abords des voies ferrées sans protecteur (garde-voie) ? | PCT RS 742.173.001 ch. 3.1.6 | Maximum 2 personnes avec évacuation rapide assurée |
| Q7 | Ce travail implique-t-il des travaux forestiers comportant des dangers particuliers (abattage, débardage, travaux en pente) ? | Directive CFST 2134.f ch. 4.2.4 | Contact visuel, vocal ou radio assuré en permanence |
| Q8 | Ce travail implique-t-il des interventions sur des installations thermiques accessibles ou des cheminées d'usine ? | OTConst art. 114 | Surveillant positionné hors de la zone de danger |
| Q9 | Ce travail implique-t-il des travaux en milieu hyperbare ou des travaux de plongée professionnelle ? | RS 832.311.12 art. 37 et 50 | Gardien de sas + liaison vocale scaphandrier obligatoires |
| Q10 | Ce travail implique-t-il des travaux en hauteur sur des pylônes de lignes électriques à haute tension ? | ESTI 245 version 0619.f art. 5.1.3 | Minimum 2 collaborateurs à portée de vue ou de voix |
| Q11 | Ce travail implique-t-il l'utilisation d'unités d'irradiation mobiles pour des essais non destructifs (radiographie industrielle) ? | OUMR RS 814.554 art. 58 al. 3 | 2e personne professionnellement exposée aux radiations |
| Q12 | Ce travail implique-t-il des travaux à l'intérieur de conduites ? | OTConst art. 119 al. 1 | Surveillance permanente par une personne à l'extérieur |
| Q13 | La personne qui effectuera ce travail a-t-elle moins de 18 ans ? | Ordonnance sur la protection des jeunes travailleurs | Travail isolé interdit — aucune exception |
| Q14 | Ce travail peut-il provoquer une blessure nécessitant une aide immédiate (dans les secondes qui suivent) pour que la personne survive ? | SUVA 44094.F ch. 2 — définition du travail isolé interdit | Travail isolé interdit — présence d'une 2e personne obligatoire |

### Résultat du Niveau 1

**Si au moins un OUI :**

```
RÉSULTAT : NO-GO — TRAVAIL ISOLÉ INTERDIT
MOTIF : [liste des questions cochées OUI avec référence légale]
MESURE OBLIGATOIRE : Présence d'une 2e personne dédiée.
  Pour les zones 1 de la SUVA : cette 2e personne a pour SEULE et UNIQUE tâche
  la surveillance. Aucune autre fonction ne lui est attribuée.
  Une installation de surveillance (DATI, caméra, alarme) NE REMPLACE PAS
  la présence physique d'une 2e personne. [SUVA_CONST — ch. 6.1]
CONCEPT DE SAUVETAGE : À élaborer obligatoirement avec un spécialiste MSST.
```

**Si tous NON ou HORS PÉRIMÈTRE :**

→ Passer au Niveau 2

---

## PARTIE 4 — NIVEAU 2 : MATRICE DES RISQUES SUVA

### Objectif

Déterminer la zone de base selon la probabilité d'accident et la gravité du dommage prévisible. Ce résultat est la zone minimale — elle ne peut qu'être maintenue ou renforcée par les niveaux suivants.

### 4.1 Identification du danger principal

Demander à l'utilisateur de décrire en langage libre le danger le plus grave identifié pour cette tâche. Exemples guidants selon le contexte :

- Chute de hauteur (passerelle, échelle, toit)
- Écrasement ou coincement par machine / pièce mobile
- Chute de plain-pied (glissance, obstacles, verglas)
- Asphyxie ou intoxication (espace confiné, produits chimiques)
- Électrocution (travaux à proximité d'éléments sous tension)
- Malaise ou accident médical soudain (effort physique intense, chaleur)
- Agression (travail seul en contact avec le public, nuit)
- Effondrement ou explosion

> Note importante : définir le danger le plus grave uniquement, pas une liste exhaustive.

### 4.2 Gravité du dommage [SUVA_CONST]

Sélectionner le niveau de gravité probable pour le danger identifié, en l'absence de premiers secours immédiats.

| Code | Libellé | Description | Exemples |
|------|---------|-------------|----------|
| I | TRÈS GRAVE | Blessure mortelle ou mettant la vie en danger sans secours immédiats | Chute de plus de 3m sur sol dur, électrocution HT, asphyxie en espace confiné |
| II | GRAVE | Blessure grave avec atteinte irréversible (séquelle permanente) | Fracture du crâne, amputation, perte de conscience prolongée, chute de 1-3m sur sol dur |
| III | MOYEN | Blessure moyenne avec atteinte irréversible | Fracture complexe, lésion articulaire irréversible, brûlure étendue |
| IV | FAIBLE | Blessure avec arrêt de travail sans atteinte irréversible | Fracture simple, entorse grave, plaie profonde, commotion cérébrale légère |
| V | TRÈS FAIBLE | Blessure légère sans arrêt de travail | Contusion, égratignure, entorse légère, foulure de poignet |

### 4.3 Probabilité d'accident [SUVA_CONST]

Estimer la probabilité d'occurrence du dommage décrit. Base de référence : imaginer 1000 travailleurs effectuant cette même tâche dans les mêmes conditions sur une période de 20 ans.

| Code | Libellé | Description |
|------|---------|-------------|
| A | FRÉQUENT | Plus de 1 fois par mois dans la population de référence |
| B | OCCASIONNEL | Entre 1 fois par an et 1 fois par mois |
| C | RARE | Entre 1 fois en 5 ans et 1 fois par an |
| D | IMPROBABLE | Entre 1 fois en 20 ans et 1 fois en 5 ans |
| E | QUASI IMPOSSIBLE | Entre 1 fois en 100 ans et 1 fois en 20 ans |

**Aide contextuelle** à afficher selon la fréquence de la tâche saisie à l'étape d'identification :

- Si F3 (quotidienne) et gravité II ou I : "Avec cette fréquence d'exposition, une probabilité D ou E est difficile à justifier sans mesures de protection techniques solides. Vérifier l'état de la technique."
- Si F0 (rare) et gravité IV ou V : "Une probabilité D ou E est cohérente avec une tâche rare et un risque faible."

> Note : la fréquence de la TÂCHE aide à estimer la probabilité d'ACCIDENT, mais ne la détermine pas mécaniquement. Un travail fréquent avec mesures de protection solides peut avoir une probabilité D. L'utilisateur décide et justifie.

### 4.4 Calcul de la zone [SUVA_CONST]

```
MATRICE DES RISQUES — source de vérité absolue, non modifiable

             V (TF)  IV (F)  III (M)  II (G)  I (TG)
A (Fréq.)     4       3a       2        1        1
B (Occas.)    4       3a       2        2        1
C (Rare)      4       3a       3b       2        2
D (Improb.)   4       3a       3b       3b       3b
E (Q.imp.)    4        4        4        4       3b
```

```typescript
const MATRIX = {
  A: { V:'4', IV:'3a', III:'2',  II:'1',  I:'1'  },
  B: { V:'4', IV:'3a', III:'2',  II:'2',  I:'1'  },
  C: { V:'4', IV:'3a', III:'3b', II:'2',  I:'2'  },
  D: { V:'4', IV:'3a', III:'3b', II:'3b', I:'3b' },
  E: { V:'4', IV:'4',  III:'4',  II:'4',  I:'3b' }
}

zone_base = MATRIX[probabilite][gravite]
```

### 4.5 Signification des zones [SUVA_CONST — noms et descriptions]

| Zone | Libellé | Description |
|------|---------|-------------|
| Zone 1 | INTERDIT DE TRAVAILLER SEUL | Même résultat que NO-GO Niveau 1. Appliquer les mêmes mesures. |
| Zone 2 | SURVEILLANCE CONTINUE INDÉPENDANTE DE LA VOLONTÉ | Le travailleur peut travailler seul mais doit être surveillé en permanence par un système qui se déclenche automatiquement sans son action volontaire. |
| Zone 3a | SURVEILLANCE PÉRIODIQUE — INTERVALLE MAX 8 HEURES | Surveillance à intervalles réguliers. Intervalle exact calculé au Niveau 3. Applicable si la blessure probable n'entraîne pas d'atteinte irréversible. |
| Zone 3b | SURVEILLANCE PÉRIODIQUE — INTERVALLE MAX 4 HEURES | Surveillance à intervalles réguliers. Intervalle exact calculé au Niveau 3. Applicable si la blessure probable peut entraîner une atteinte irréversible. |
| Zone 4 | TRAVAIL SEUL AUTORISÉ | Risque comparable à la vie courante. Le travailleur conserve sa mobilité et sa réactivité en cas d'accident. Il peut demander de l'aide seul. Mesures de base suffisantes : information, instruction, moyen de communication. |

---

## PARTIE 5 — NIVEAU 3 : GATE DE FAISABILITÉ DU SAUVETAGE

### Objectif

Vérifier que les délais réels de sauvetage sont compatibles avec la zone déterminée à la matrice. Ce niveau transforme une zone abstraite en décision opérationnelle par période de travail.

### 5.1 Données de délais à collecter

| Champ | Description |
|-------|-------------|
| delai_secouristes_jour_min | Temps en minutes entre le déclenchement de l'alerte et l'arrivée des premiers secouristes internes formés, pendant les heures d'exploitation normales. Si aucun secouriste interne : saisir le délai d'arrivée des premiers secours publics. |
| delai_secouristes_nuit_min | Même mesure, pour la nuit et le weekend (équipe réduite ou absente). Champ affiché uniquement si les périodes NUIT ou WEEKEND sont actives. |
| delai_ambulance_min | Temps en minutes entre l'appel au 144 / 1414 et l'arrivée de l'ambulance ou du SMUR sur le lieu précis du travail. Intègre les accès difficiles, l'attente, les barrières de sécurité à franchir. |
| delai_sauvetage_technique_min | Temps supplémentaire pour atteindre la personne si elle se trouve dans un espace difficile d'accès (toit, silo, sous-sol, zone confinée). Si accès direct : saisir 0. |

### 5.2 Gate G4 — Survie immédiate (Zone 1 dérivée)

S'applique uniquement si la gravité saisie est I (très grave) ou II (grave). Basé sur la courbe de survie SUVA ch. 7.1 : les chances de survie sont pratiquement nulles après 6-7 minutes sans premiers secours. [SUVA_CONST]

```
Pour chaque période active :
  Si gravite IN [I, II] :
    delai_total_periode = delai_secouristes_periode + delai_sauvetage_technique
    Si delai_total_periode > 7 :
      → NO-GO : Zone 2 insuffisante pour cette gravité
      → Reclasser en Zone 1 pour cette période
      → Message : "La gravité du dommage identifié (décès probable sans secours immédiats)
        exige une présence humaine pouvant intervenir en moins de 7 minutes.
        Le délai constaté de [X] minutes est incompatible avec un travail isolé,
        même sous surveillance continue. (SUVA 44094.F ch. 7.1)"
```

### 5.3 Calcul du t_max — Zone 3 [SUVA_CONST]

Le t_max est l'intervalle maximum entre deux vérifications de l'état du travailleur. Au-delà, les chances de sauvetage en cas de blessure grave deviennent insuffisantes.

**Base temporelle selon la zone :**

- Zone 3a : base = 480 minutes (8 heures) — Applicable si gravité IV ou V (blessure sans atteinte irréversible attendue)
- Zone 3b : base = 240 minutes (4 heures) — Applicable si gravité II ou III (blessure avec atteinte irréversible possible)

**Formule pour chaque période active [SUVA_CONST] :**

```
t_max_periode = base
  − delai_premiers_secours_periode  (secouristes internes ou publics)
  − delai_ambulance_min
  − delai_sauvetage_technique_min

Intervalle de surveillance recommandé = t_max_periode − 15 min
  (marge de sécurité pour garantir que le délai est tenu)
```

### 5.4 Gate G5 — Faisabilité Zone 3

```
Pour chaque période active, après calcul du t_max :

  Si t_max_periode > 30 min :
    → GO Zone 3 pour cette période
    → Intervalle de surveillance = t_max_periode − 15 min
    → Si intervalle < 60 min : afficher avertissement "Intervalle contraignant —
      s'assurer que le système de surveillance peut tenir ce rythme de manière fiable"

  Si t_max_periode entre 0 et 30 min inclus :
    → NO-GO Zone 3 pour cette période
    → Reclasser en Zone 2 pour cette période
    → Message : "Le délai de sauvetage calculé ([X] min) ne laisse pas un intervalle
      de surveillance praticable. La zone est reclassée en Zone 2 pour la période [période].
      Un système de surveillance continue automatique est requis."

  Si t_max_periode < 0 :
    → NO-GO absolu pour cette période
    → Si gravité I ou II : reclasser en Zone 1 (délai fatal dépassé même en urgence)
    → Si gravité III ou IV : reclasser en Zone 2
    → Message : "Le délai de sauvetage dépasse la fenêtre d'intervention sûre.
      Le travail isolé est incompatible avec les conditions de sauvetage de ce site
      pour la période [période]."
```

### 5.5 Gate G6 — Distance excessive (Zone 2)

S'applique si la zone résultante est Zone 2 après le Niveau 2 ou après reclassement.

```
Si zone = 2 ET delai_ambulance_min > 15 :
  → Avertissement (non bloquant mais documenté dans le rapport) :
    "Le délai d'arrivée des secours publics dépasse 15 minutes.
    Selon le ch. 7.2 de la SUVA 44094.F, si le lieu de l'accident est trop éloigné
    pour permettre un sauvetage rapide, le travail isolé doit être interdit même
    si la matrice des risques semble l'autoriser.
    Évaluer si les premiers secours internes peuvent compenser ce délai.
    Dans le cas contraire, interdire le travail isolé."

Si zone = 2 ET delai_ambulance_min > 30 :
  → NO-GO : Zone 2 insuffisante si gravité I ou II
  → Reclasser en Zone 1 pour cette configuration
```

### 5.6 Résultat du Niveau 3

À l'issue de ce niveau, chaque période active a sa propre zone résultante (qui peut être différente de la zone de base) et son propre intervalle de surveillance si applicable.

```json
{
  "periode": "NUIT",
  "zone_base": "3b",
  "t_max_calcule": 175,
  "zone_finale": "3b",
  "intervalle_surveillance_min": 160,
  "go_nogo": "GO",
  "motif": null
}

{
  "periode": "WEEKEND",
  "zone_base": "3b",
  "t_max_calcule": -10,
  "zone_finale": "1",
  "intervalle_surveillance_min": null,
  "go_nogo": "NO-GO",
  "motif": "t_max négatif — délai de sauvetage incompatible avec travail isolé"
}
```

---

## PARTIE 6 — NIVEAU 4 : VALIDATION DE L'OUTIL D'ALERTE

### Objectif

Vérifier que les équipements d'alerte disponibles sont compatibles avec la zone résultante et avec les conditions réelles de la tâche (fréquence, charge cognitive, infrastructure réseau).

### 6.1 Infrastructure disponible

**Couverture réseau sur le lieu de travail :**

| Code | Description |
|------|-------------|
| R1 | GSM et/ou WIFI permanent et testé sur toute la zone d'intervention |
| R2 | Réseau partiel — zones mortes connues, couverture intermittente |
| R3 | Réseau inexistant ou non fiable |
| R4 | GPS non disponible (intérieur, sous-sol, zone industrielle dense). Note : R4 peut s'ajouter à R1, R2 ou R3 |

Combinaisons possibles : R1, R1+R4, R2, R2+R4, R3, R3+R4

**Centrale d'alarme disponible :**

| Code | Description |
|------|-------------|
| CA1 | Centrale interne avec permanence humaine 24h/24 7j/7 |
| CA2 | Centrale externe professionnelle avec permanence 24h/24 7j/7 |
| CA3 | Centrale interne aux heures d'exploitation uniquement |
| CA4 | Aucune centrale permanente — ronde humaine planifiée uniquement |
| CA5 | Aucune centrale, aucune ronde — travailleur seul sans réception d'alerte |

### 6.2 Équipements d'alerte — définitions et capacités [CONFIG — liste configurable]

Chaque équipement est caractérisé par deux propriétés fixes :

- **MODE** : AUTOMATIQUE (se déclenche sans action du travailleur) ou MANUEL (requiert une action volontaire)
- **DÉPENDANCE** : indique si l'outil dépend d'un réseau GSM, WIFI, ou fonctionne indépendamment

| Code | Libellé | Mode | Dépendance | Capacités | Limites |
|------|---------|------|------------|-----------|---------|
| PTI_AUTO | PTI — Dispositif de Protection du Travailleur Isolé (automatique) | AUTOMATIQUE | GSM ou WIFI | Détection automatique de chute, d'immobilité, d'absence de mouvement. Compatible Zone 2. | Dépend du réseau. Faux positifs possibles sur tâches statiques. Nécessite CA1 ou CA2. |
| PTI_RADIO | PTI sur réseau radio (indépendant GSM) | AUTOMATIQUE | Réseau radio propriétaire ou TETRA | Mêmes capacités que PTI_AUTO mais indépendant du réseau GSM/WIFI. Solution pour R2 et R3. | Infrastructure radio requise. Coût de mise en place. |
| DATI_AUTO | DATI — déclenchement automatique | AUTOMATIQUE | GSM ou WIFI | Détection automatique + déclenchement manuel possible. Compatible Zone 2. | Même que PTI_AUTO. |
| DATI_MANUEL | DATI — déclenchement manuel uniquement | MANUEL | GSM | Alerte par action volontaire (bouton SOS). Compatible Zone 3 uniquement. INCOMPATIBLE Zone 2. | Requiert conscience et capacité d'agir. Incompatible C3. Requiert R1. |
| APP_MOBILE | Application mobile DATI (smartphone) | MANUEL (ou hybride) | GSM + GPS | Si mode automatique confirmé : traiter comme DATI_AUTO. Si mode manuel : traiter comme DATI_MANUEL. | Batterie, réseau, activation préalable. Incompatible F0/F1 en mode manuel. |
| RADIO_MANUELLE | Radio manuelle (talkie-walkie) | MANUEL | Réseau radio | Communication bidirectionnelle. Compatible Zone 3. INCOMPATIBLE Zone 2 seul. Compatible Zone 2 si couplé avec ronde ≤ 15 min. | Ne détecte pas incapacitation. |
| TELEPHONE_FIXE | Téléphone fixe ou filaire | MANUEL | Infrastructure téléphonique | Compatible Zone 3 et Zone 4. | Immobilité — uniquement à proximité du poste. |
| RONDE_HUMAINE | Ronde humaine planifiée | ACTIF | Disponibilité humaine | Compatible toutes zones si intervalle respecté. Zone 2 : ronde ≤ 15 min. Zone 3 : ronde ≤ t_max. | Dépend de la rigueur organisationnelle. |
| APPEL_PLANIFIE | Appel téléphonique ou radio à heures fixes | ACTIF | Téléphone ou radio | Compatible Zone 3 uniquement. INCOMPATIBLE Zone 2. | Ne détecte pas incapacitation si appel sortant du travailleur. Préférer appel entrant. |

### 6.3 Matrice de compatibilité Zone × Mode [SUVA_CONST — logique, pas les libellés]

| Zone | Compatibles | Incompatibles |
|------|-------------|---------------|
| Zone 1 | Aucun équipement technique. Présence humaine obligatoire. | Tous |
| Zone 2 | PTI_AUTO, PTI_RADIO, DATI_AUTO, RONDE_HUMAINE (≤ 15 min) | DATI_MANUEL, APP_MOBILE (si manuel), RADIO_MANUELLE seule, TELEPHONE_FIXE, APPEL_PLANIFIE |
| Zone 3a/3b | Tous si intervalle ≤ t_max et C ≤ C2. Pour C3 : PTI_AUTO ou PTI_RADIO uniquement | APP_MOBILE si F0 ou F1 |
| Zone 4 | Tout moyen de communication fonctionnel | — |

### 6.4 Matrice de fiabilité de l'outil selon contexte opérationnel

**Règles absolues (appliquées en premier, dans l'ordre) :**

**RÈGLE A [SUVA_CONST]** : Si charge_cognitive = C3 → APP_MOBILE, DATI_MANUEL, RADIO_MANUELLE, TELEPHONE_FIXE, APPEL_PLANIFIE → INVALIDE. Seuls PTI_AUTO et PTI_RADIO sont VALIDES.

**RÈGLE B** : Si réseau = R3 → APP_MOBILE, DATI_MANUEL, DATI_AUTO, PTI_AUTO → INVALIDE. Seuls PTI_RADIO, RADIO_MANUELLE, RONDE_HUMAINE, APPEL_PLANIFIE, TELEPHONE_FIXE restent évaluables.

**RÈGLE C** : Si fréquence IN [F0, F1] ET outil = APP_MOBILE ET mode = MANUEL → INVALIDE.

**RÈGLE D** : Si zone = 2 ET outil.mode = MANUEL → INVALIDE.

**Tableau de fiabilité (si aucune règle absolue ne s'applique) :**

| Outil | F0+C1 | F0+C2 | F1+C1 | F1+C2 | F2+C1 | F2+C2 | F3+C1 | F3+C2 |
|-------|-------|-------|-------|-------|-------|-------|-------|-------|
| PTI_AUTO | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PTI_RADIO | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| DATI_AUTO | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| DATI_MANUEL | ⚠️P | ❌ | ⚠️P | ⚠️P | ✅ | ✅ | ✅ | ✅ |
| APP_MOBILE | ❌ | ❌ | ⚠️P | ⚠️P | ✅ | ✅ | ✅ | ✅ |
| RADIO_MANUELLE | ⚠️P | ⚠️P | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| APPEL_PLANIFIE | ⚠️P | ⚠️P | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| RONDE_HUMAINE | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

- ✅ = VALIDE
- ⚠️P = VALIDE_AVEC_PROCÉDURE
- ❌ = INVALIDE

> **VALIDE_AVEC_PROCÉDURE** signifie : procédure écrite formalisée, documentée, signée et contrôlée comprenant : a) Vérification du fonctionnement AVANT chaque intervention, b) Point de départ et retour déclarés, c) Contrôle périodique du respect, d) Si procédure non documentée : reclasser en INVALIDE.

### 6.5 Gate G7 — Cohérence outil × zone × résultat

```
Pour chaque période active :
  Si verdict_outil = INVALIDE ET aucun outil valide disponible :
    → NO-GO pour cette période
    → Si zone 2 : "Aucun équipement compatible Zone 2 disponible.
      Options : acquérir un PTI automatique, ou organiser une ronde humaine ≤ 15 min,
      ou interdire ce travail isolé pour cette période."
    → Si zone 3 : "Aucun équipement fiable disponible pour cette combinaison
      fréquence/charge/réseau. Options : acquérir un outil adapté, ou formaliser
      une procédure stricte avec outil conditionnel, ou interdire ce travail isolé."

  Si plusieurs outils disponibles : prendre le plus fiable
  Si au moins un outil VALIDE ou VALIDE_AVEC_PROCÉDURE : GO avec conditions
```

---

## PARTIE 7 — DÉCISION FINALE ET RAPPORT

### 7.1 Agrégation des résultats par période

```
Pour chaque période active (JOUR, NUIT, WEEKEND) :
  Collecter :
    - zone_finale_periode (après Niveaux 2, 3 et 4)
    - go_nogo_periode
    - intervalle_surveillance_periode (si Zone 3)
    - outil_valide_periode
    - conditions_periode (liste des conditions à respecter)
    - motif_nogo_periode (si NO-GO)

Décision globale :
  Si au moins une période = NO-GO Zone 1 : afficher interdiction totale pour cette période
  Si toutes les périodes actives = GO : afficher autorisation avec conditions
  Si mix GO / NO-GO selon périodes : afficher décision différenciée par période
```

### 7.2 Structure de la décision finale

```
ANALYSE N° [id]
TÂCHE : [titre_activite]
DATE : [date_analyse]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MATRICE DES RISQUES
  Danger identifié   : [danger_principal]
  Gravité            : [code] — [libellé] — [description]
  Probabilité        : [code] — [libellé]
  Zone SUVA de base  : [zone]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÉSULTAT PAR PÉRIODE

  [Période] : [GO ✅ / NO-GO ❌] — Zone [zone_finale]
    Si GO :
      Type de surveillance : [libellé zone]
      Intervalle max.      : [intervalle] minutes (calculé)
      Outil requis         : [outil_valide] [avec procédure si applicable]
      Conditions           : [liste]
    Si NO-GO :
      Motif                : [motif_nogo]
      Mesure obligatoire   : [mesure selon zone]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONDITIONS OBLIGATOIRES
  [Liste numérotée des conditions à respecter]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERSPECTIVES ET AMÉLIORATIONS
  [Recommandations non obligatoires]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONCEPT D'URGENCE
  Organisation de l'alerte : [saisie libre]
  Premiers secours         : [saisie libre]
  Formation et comportement: [saisie libre]
  Accès des secours        : [saisie libre]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉLAIS DE SAUVETAGE
  Secouristes internes de jour   : [X] min
  Secouristes internes de nuit   : [X] min
  Secours publics (144/1414)     : [X] min
  Accès technique au lieu        : [X] min

CALCUL t_max PAR PÉRIODE :
  [Formule avec valeurs pour chaque période]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATION
  Documentée       : [OUI / NON]
  Date             : [date]
  Formateur        : [nom]
  Date de révision : [date]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Référence méthode   : SUVA 44094.F — Édition mai 2025
Base légale         : OPA RS 832.30 art. 8 al. 1
Analysé par         : [responsable]
Date                : [date]
Statut              : [BROUILLON / COMPLET / VALIDÉ]
```

---

## PARTIE 8 — RÈGLES DE VALIDATION FORMULAIRE

### Règles bloquantes (empêchent la finalisation)

- Niveau 1 : au moins une question doit avoir une réponse (OUI / NON / HORS PÉRIMÈTRE)
- Niveau 2 : gravité ET probabilité doivent être renseignées
- Niveau 3 : les délais de sauvetage pour toutes les périodes actives doivent être renseignés
- Niveau 4 : au moins un outil d'alerte doit être sélectionné
- Concept d'urgence : organisation de l'alerte doit être renseignée (même succincte)

### Règles d'avertissement (n'empêchent pas la finalisation)

- Visite médicale annuelle non faite → "Vérifier l'aptitude du personnel (ch. 3 SUVA)"
- Évaluation des dangers non faite → "Une évaluation complète des dangers est recommandée"
- Formation non documentée → "La formation doit être documentée selon ch. 8 SUVA"
- Délai ambulance > 15 min + Zone 2 → avertissement spécifique (voir Gate G6)

---

## PARTIE 9 — MODÈLE DE DONNÉES (Google Sheets)

### 9.1 Structure des onglets

| Onglet | Description |
|--------|-------------|
| Analyses | Une ligne par analyse (voir 9.2) |
| Config | Paramètres de l'entreprise |
| Taxonomies | Listes de valeurs configurables |
| Zones_Textes | Textes Z1-Z4 paramétrables [CONFIG] |
| Travaux_Reg | 14 travaux réglementés (références non modifiables, libellés modifiables) |

### 9.2 Colonnes de l'onglet "Analyses"

**Identification**

| Colonne | Type |
|---------|------|
| id | UUID |
| date_creation | ISO 8601 |
| date_revision | ISO 8601 |
| statut | BROUILLON / COMPLET / VALIDE |
| entreprise | texte |
| departement | texte |
| service | texte |
| responsable | texte |

**Description de la tâche**

| Colonne | Type |
|---------|------|
| titre_tache | texte |
| description_tache | texte long |
| nbr_personnes_simultane | entier |
| periode_travail | JOUR / NUIT / WEEKEND / JOUR+NUIT / JOUR+WE / NUIT+WE / TOUT |
| frequence_tache_code | F0 / F1 / F2 / F3 |
| charge_cognitive_code | C1 / C2 / C3 |

**Niveau 1 — Gate réglementaire**

| Colonne | Type |
|---------|------|
| travaux_reg_q01 à q14 | OUI / NON / HORS_PERIMETRE (14 colonnes) |
| niv1_nogo | OUI / NON |
| niv1_motif | texte |

**Niveau 2 — Matrice**

| Colonne | Type |
|---------|------|
| danger_principal | texte |
| gravite_code | I / II / III / IV / V |
| gravite_label | texte |
| probabilite_code | A / B / C / D / E |
| probabilite_label | texte |
| zone_base | 1 / 2 / 3a / 3b / 4 |

**Niveau 3 — Faisabilité sauvetage**

| Colonne | Type |
|---------|------|
| delai_secouristes_jour_min | entier |
| delai_secouristes_nuit_min | entier |
| delai_ambulance_min | entier |
| delai_sauvetage_technique_min | entier |
| tmax_jour_min | entier (calculé) |
| tmax_nuit_min | entier (calculé) |
| tmax_we_min | entier (calculé) |
| intervalle_surveillance_jour_min | entier (calculé) |
| intervalle_surveillance_nuit_min | entier (calculé) |
| intervalle_surveillance_we_min | entier (calculé) |
| zone_finale_jour | 1 / 2 / 3a / 3b / 4 / NOGO |
| zone_finale_nuit | 1 / 2 / 3a / 3b / 4 / NOGO |
| zone_finale_we | 1 / 2 / 3a / 3b / 4 / NOGO |
| niv3_nogo_periodes | texte |

**Niveau 4 — Outil d'alerte**

| Colonne | Type |
|---------|------|
| couverture_reseau_code | R1 / R2 / R3 / R1+R4 / R2+R4 / R3+R4 |
| centrale_alarme_code | CA1 / CA2 / CA3 / CA4 / CA5 |
| centrale_alarme_nom | texte |
| delai_centrale_min | entier |
| outils_disponibles | texte (séparateur \|) |
| outil_retenu_jour | code outil |
| outil_retenu_nuit | code outil |
| outil_retenu_we | code outil |
| verdict_outil_jour | VALIDE / VALIDE_AVEC_PROC / INVALIDE / NOGO |
| verdict_outil_nuit | VALIDE / VALIDE_AVEC_PROC / INVALIDE / NOGO |
| verdict_outil_we | VALIDE / VALIDE_AVEC_PROC / INVALIDE / NOGO |

**Décision finale**

| Colonne | Type |
|---------|------|
| decision_jour | GO / NO-GO |
| decision_nuit | GO / NO-GO |
| decision_we | GO / NO-GO |
| conditions_obligatoires | texte (séparateur \|) |
| perspectives | texte |

**Infrastructure et aptitudes**

| Colonne | Type |
|---------|------|
| couverture_gps | OUI / NON / PARTIELLE |
| personnel_moins_18ans | OUI / NON |
| visite_medicale | OUI / NON |
| evaluation_dangers | OUI / NON / EN_COURS |
| aptitude_psychique | OK / AVEC_RESERVES / NON_APTE |
| aptitude_physique | OK / AVEC_RESERVES / NON_APTE |
| aptitude_intellectuelle | OK / AVEC_RESERVES / NON_APTE |

**Concept d'urgence**

| Colonne | Type |
|---------|------|
| urgence_alerte | texte |
| urgence_premiers_secours | texte |
| urgence_formation | texte |
| urgence_acces | texte |

**Formation**

| Colonne | Type |
|---------|------|
| formation_documentee | OUI / NON |
| formation_date | ISO 8601 |
| formation_formateur | texte |

**Traçabilité**

| Colonne | Type |
|---------|------|
| nbr_travailleurs_total | entier |
| methode_version | "SUVA 44094.F — mai 2025" |
| app_version | texte |

---

## PARTIE 10 — CONSTANTES RÉGLEMENTAIRES [SUVA_CONST]

Ces valeurs sont codées en dur dans l'application. Elles ne peuvent pas être modifiées par l'interface utilisateur ni par la configuration Google Sheets. Toute modification nécessite une mise à jour du code avec validation SST.

```typescript
// SUVA_CONST — Matrice des risques SUVA 44094.F ch. 5
const MATRIX = {
  A: { V:'4', IV:'3a', III:'2',  II:'1',  I:'1'  },
  B: { V:'4', IV:'3a', III:'2',  II:'2',  I:'1'  },
  C: { V:'4', IV:'3a', III:'3b', II:'2',  I:'2'  },
  D: { V:'4', IV:'3a', III:'3b', II:'3b', I:'3b' },
  E: { V:'4', IV:'4',  III:'4',  II:'4',  I:'3b' }
}

// SUVA_CONST — Base temporelle Zone 3 ch. 7.3
const BASE_ZONE_3A_MIN = 480  // 8 heures — blessure sans atteinte irréversible
const BASE_ZONE_3B_MIN = 240  // 4 heures — blessure avec atteinte irréversible possible

// SUVA_CONST — Seuil de survie Zone 1 / Zone 2 ch. 7.1
const SEUIL_SURVIE_MIN = 7    // Chances de survie pratiquement nulles après 7 min sans secours

// SUVA_CONST — Seuil d'alerte distance Zone 2 ch. 7.2
const SEUIL_DISTANCE_ZONE2_MIN = 15  // Alerte si ambulance > 15 min pour Zone 2

// SUVA_CONST — Marge de sécurité sur t_max
const MARGE_SECURITE_MIN = 15  // Intervalle = t_max − 15 min

// SUVA_CONST — Seuil minimum t_max pour Zone 3 applicable
const TMAX_MIN_ZONE3_MIN = 30  // En dessous : reclasser en Zone 2

// Gravités entraînant une vérification du seuil de survie
const GRAVITES_CRITIQUES = ['I', 'II']

// Zones exigeant un outil à mode automatique
const ZONES_REQUIERANT_AUTO = ['2']

// Zones interdisant tout travail isolé
const ZONES_INTERDITES = ['1']
```

---

## PARTIE 11 — GUIDE D'IMPLÉMENTATION

### Ordre de traitement lors de la soumission du formulaire

1. Vérifier le Gate réglementaire (Niveau 1) → Si niv1_nogo = true : stopper, retourner NO-GO Zone 1
2. Calculer zone_base = MATRIX[probabilite][gravite] → Si zone_base = '1' : stopper, retourner NO-GO Zone 1
3. Pour chaque période active : calculer t_max, appliquer Gates G4, G5, G6
4. Pour chaque période active : appliquer Règles A, B, C, D + tableau de fiabilité + Gate G7
5. Agréger les résultats par période
6. Générer conditions obligatoires et perspectives
7. Retourner la structure complète pour affichage et export

### Priorité des règles en cas de conflits

```
Niveau 1 (réglementaire) > Zone 1 de la matrice > Gate G4 (survie) > Gate G5 (t_max) > Gate G6 (distance) > Gate G7 (outil) > Décision finale
```

Un reclassement à la hausse est toujours possible (Zone 4 → Zone 3 → Zone 2 → Zone 1). Un assouplissement n'est jamais possible.

### Affichage conditionnel dans le formulaire

- Afficher "délai secouristes de nuit" uniquement si NUIT ou WEEKEND est coché
- Afficher "délai sauvetage technique" avec info-bulle : "Laisser 0 si accès direct sans obstacle"
- Afficher le calcul t_max en temps réel dès que les délais sont renseignés
- Afficher la zone résultante en temps réel dès que gravité ET probabilité sont sélectionnées
- Afficher les règles de compatibilité outil en temps réel

### Cas particulier : plusieurs outils disponibles

Hiérarchie de fiabilité : PTI_AUTO = PTI_RADIO > DATI_AUTO > DATI_MANUEL > APP_MOBILE > RADIO_MANUELLE > APPEL_PLANIFIE > RONDE_HUMAINE

La décision finale retient l'outil le plus fiable parmi ceux disponibles.

---

**Référence méthode** : SUVA 44094.F — Édition mai 2025
**Base légale** : OPA RS 832.30 art. 8 al. 1 — OLT3 art. 26
*Ce document est une spécification technique de développement. Il ne constitue pas un document SST officiel.*
