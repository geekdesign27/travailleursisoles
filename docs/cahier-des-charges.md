# CAHIER DES CHARGES FONCTIONNEL

## Webapp — Analyse des postes de travailleurs isolés

**Méthode SUVA 44094.F — Édition mai 2025**

| | |
|---|---|
| Version | 1.0 |
| Auteur | Pierre-Alain — Consultant SST & Vibecodeur |
| Date | Mars 2025 |
| Références | SUVA 44094.F (mai 2025), OPA RS 832.30, OLT3 art. 26 |
| Statut | Prêt pour développement |

---

## 1. CONTEXTE ET OBJECTIFS

### 1.1 Contexte réglementaire

La gestion des travailleurs isolés est encadrée en Suisse par l'art. 8 al. 1 OPA qui impose à l'employeur de faire surveiller tout travailleur qui exécute seul un travail dangereux. La SUVA a publié la notice 44094.F (édition mai 2025) qui fournit une méthode structurée d'analyse des postes de travail isolés, fondée sur une matrice risque probabilité × gravité débouchant sur 4 zones d'action.

Aujourd'hui, la grande majorité des employeurs suisses documentent ces analyses sur papier ou dans des fichiers Excel non structurés, sans cohérence entre les services, sans traçabilité consolidée et sans aide à la décision réglementaire.

**Problème central à résoudre :**

- Aucun outil digital simple, guidé et conforme SUVA n'existe pour les PME/PMI suisses.
- Les analyses sont sous-documentées, non consolidées, rarement mises à jour.
- La conformité aux exigences légales (OPA, OTConst, OIBT, etc.) est difficile à vérifier.
- Les équipements DATI/PTI et les contraintes opérationnelles (nuit, weekend, réseau) sont rarement intégrés à l'analyse.

### 1.2 Vision produit

Une webapp publique, légère, sans backend propriétaire, connectée à Google Sheets, qui permet à n'importe quelle entreprise suisse de :

- Conduire une analyse guidée étape par étape selon la méthode SUVA 44094.F
- Intégrer les contraintes opérationnelles réelles (couverture réseau, temps de secours, équipements, période de travail)
- Obtenir une conclusion réglementaire claire (zone 1 à 4, mesures obligatoires)
- Exporter un rapport PDF professionnel et un fichier CSV pour intégration dans leur système existant
- Sauvegarder l'analyse dans un Google Sheet propre à l'entreprise (multi-tenant)
- Paramétrer les taxonomies de leur entreprise (dangers, équipements, unités organisationnelles)

### 1.3 Public cible

| Profil | Rôle dans l'app | Niveau technique attendu |
|--------|----------------|------------------------|
| Responsable SST / QHSE | Crée et valide les analyses | Non-technique — usage formulaire |
| Préposé à la sécurité | Complète l'analyse, consulte les résultats | Non-technique |
| Chef de service / Contremaître | Fournit les données terrain | Non-technique |
| Consultant SST externe | Crée des analyses pour ses clients | Intermédiaire |
| Administrateur (par entreprise) | Configure les taxonomies | Intermédiaire — usage Settings |

---

## 2. ANALYSE CRITIQUE DES TAXONOMIES EXISTANTES

### 2.1 Colonnes à conserver — validées

| Colonne Excel | Évaluation | Recommandation |
|--------------|-----------|---------------|
| Entreprise / Département / Service | ✅ Indispensable | Conserver — saisie libre + sélection taxonomie configurable |
| Responsable / Titre activité / Description | ✅ Indispensable | Saisie libre — description guidée par prompt contextuel |
| Travaux réglementés (8 colonnes OUI/NON) | ✅ Critique | Transformer en checklist conditionnelle avec références légales affichées dynamiquement. Si OUI → alerte Zone 1 immédiate. |
| Période de travail (Jour / Nuit / Jour+Nuit) | ✅ Pertinent | Conserver — influence directement le calcul du délai de secours et le concept d'urgence |
| Couverture réseau (GSM/WIFI) | ✅ Pertinent | Transformer en 3 niveaux : Permanente / Partielle / Inexistante. Conditionne la faisabilité des DATI |
| Activité déjà couverte par moyen de liaison | ✅ Pertinent | Conserver avec liste déroulante configurable (téléphone, radio, DATI, PTI, etc.) |
| Délai maximal de sauvetage (min) | ✅ Critique | Calculé automatiquement selon la formule SUVA : t_max = délai type blessure – secouristes – ambulance – sauvetage |
| Temps secouristes entreprise (jour / nuit) | ✅ Très pertinent | Distinction jour/nuit essentielle — impact direct sur Zone 2/3. Saisie en minutes. |
| Temps arrivée secours 144/1414 | ✅ Pertinent | À saisir par l'utilisateur. Indicateur d'alerte si >15 min (cf. ch. 7.2 SUVA) |
| Zone de danger (Z1 à Z4) | ✅ Résultat calculé | Calculé automatiquement par la matrice. Non saisissable manuellement. |
| Statut + Exigences minimales | ✅ Résultat calculé | Généré automatiquement selon la zone. Texte paramétrable dans les taxonomies. |
| Centrale d'alarme (Interne/Externe) | ✅ Pertinent | Enrichir avec : disponibilité 24/7, type (interne/externe), nom |
| Personnel <18 ans | ✅ Légalement obligatoire | Si OUI → bloquer le résultat et afficher alerte réglementaire (Ordonn. protection jeunes travailleurs) |
| Visite médicale annuelle | ✅ Important | Si NON → avertissement non bloquant dans le rapport |

### 2.2 Colonnes à restructurer — problèmes identifiés

#### ⚠️ PROBLÈME CRITIQUE : Fréquence d'activité isolée (F0 à F3)

Taxonomie proposée : F0 Jamais / F1 Exceptionnel (≤1/trimestre) / F2 Rare (1–3/mois) / F3 Occasionnel (1–2/semaine)

**Problème :** Cette colonne mélange deux concepts distincts que la méthode SUVA distingue clairement :
1. La probabilité d'occurrence d'un ACCIDENT (lignes A à E de la matrice)
2. La fréquence de l'ACTIVITÉ isolée (indicateur contextuel)

La fréquence de l'activité n'est PAS la probabilité d'accident. Un travail fréquent avec risque bien maîtrisé peut avoir une probabilité D (Improbable). À l'inverse, un travail rare mais très dangereux peut avoir une probabilité B (Occasionnel).

**Recommandation :** Séparer en 2 champs distincts :
- Fréquence de l'activité isolée (F0-F3) : indicateur contextuel, pas de calcul
- Probabilité d'accident (A à E SUVA) : critère de calcul de la matrice, avec guide interactif

#### ⚠️ PROBLÈME : Durée d'exposition (T0 à T3)

Taxonomie proposée : T0=0 min / T1=<5 min / T2=5-15 min / T3=15-30 min

**Problème :** La durée d'exposition telle que définie correspond en réalité au délai de réponse des secouristes internes, pas à la durée d'exposition au danger.

**Recommandation :** Renommer en "Temps d'arrivée secouristes internes de jour" et maintenir la saisie numérique directe en minutes.

#### ⚠️ PROBLÈME : Colonne "Soumis à un danger particulier durant l'activité"

**Recommandation :** Supprimer cette colonne générique. La remplacer par la description structurée du danger principal (Step 3 du formulaire) et la matrice de risque (Steps 4+5).

#### ℹ️ COLONNES MANQUANTES IMPORTANTES

- Gravité du dommage (I à V) : colonne clé du calcul de la matrice
- Probabilité d'accident (A à E) : colonne clé du calcul de la matrice
- Aptitudes du travailleur validées (OUI/NON avec réserves)
- Formation documentée (OUI/NON + date + formateur)
- Concept d'urgence établi (OUI/NON + résumé)
- Évaluation faite par groupe d'évaluation (OUI/NON)
- Date de révision planifiée

### 2.3 Taxonomie de zones — validée avec ajustements

| Zone | Texte recommandé |
|------|-----------------|
| Z1 | Travail isolé INTERDIT — Présence obligatoire d'une 2e personne dédiée à la surveillance. Concept de sauvetage MSST requis. (OPA art. 8 al. 1) |
| Z2 | Surveillance continue automatique obligatoire — Système DATI/PTI avec alarme automatique ou surveillance constante d'une 2e personne à distance. |
| Z3a/3b | Distinguer Z3a (intervalle max. 8h) et Z3b (intervalle max. 4h). Ajouter le calcul du t_max selon la formule SUVA. |
| Z4 | Travail isolé autorisé — Risque comparable à la vie courante. Mesures de base : information, instruction, moyen d'alerte. (ch. 6.4 SUVA 44094.F) |

---

## 3. ARCHITECTURE FONCTIONNELLE

### 3.1 Vue d'ensemble — Modules de l'application

| Module | Code | Description |
|--------|------|-------------|
| Tableau de bord | M1 | Liste des analyses sauvegardées, filtres, statuts, accès rapide |
| Formulaire guidé | M2 | 10 étapes conditionnelles — cœur de l'application. Wizard multi-step avec barre de progression |
| Rapport d'analyse | M3 | Vue synthèse avec matrice visuelle, zone, mesures requises, concept d'urgence |
| Export | M4 | PDF professionnel SUVA-style + CSV pour Excel |
| Synchronisation Google Sheets | M5 | Connexion OAuth2, push des analyses, gestion du mapping colonnes |
| Paramètres / Taxonomies | M6 | Configuration entreprise, modification des listes de valeurs, sauvegarde dans Google Sheets |
| Aide contextuelle | M7 | Tooltips, fenêtres d'aide SUVA, références légales accessibles à chaque étape |

### 3.2 Formulaire guidé — Détail des 10 étapes (M2)

#### ÉTAPE 1 — Identification du poste

| Champ | Spécification |
|-------|--------------|
| Entreprise | Sélection dans taxonomie configurable + saisie libre |
| Département / Service | Sélection hiérarchique dans taxonomie |
| Responsable de l'analyse | Saisie libre (nom, rôle) |
| Titre de l'activité | Saisie libre — libellé court (max. 80 car.) |
| Description détaillée | Textarea — décrire les travaux prévus, l'environnement, les équipements utilisés |
| Nombre de personnes simultanées | Saisie numérique. Si >1 → afficher info "poste non isolé par définition" |
| Période de travail | Sélection multiple : Jour / Nuit / Weekend |
| Fréquence de l'activité isolée | F0 à F3 — indicateur contextuel uniquement |

#### ÉTAPE 2 — Travaux soumis à réglementation spécifique

⚡ Étape critique — résultat potentiel immédiat : Zone 1 imposée

Checklist de 13 catégories de travaux réglementés (ch. 9 SUVA). Si au moins un OUI → Zone 1 forcée.

| Type de travail | Référence légale |
|----------------|-----------------|
| Travaux électriques BT sous tension | OIBT RS 734.27 art. 22 |
| Travaux en réservoirs / locaux exigus | SUVA 1416.f ch. 2.3 |
| Peinture pistolet en réservoirs / zones confinées | RS 832.314.12 art. 32 |
| Travaux sur cordes / en hauteur avec EPI antichute | OTConst art. 118, 119 |
| Travaux de déconstruction / démolition | OTConst art. 81 |
| Travaux sur voies ferrées (sans protecteur) | PCT RS 742.173.001 ch. 3.1.6 |
| Travaux forestiers avec dangers particuliers | CFST 2134.f ch. 4.2.4 |
| Travaux sur installations thermiques / cheminées | OTConst art. 114 |
| Travaux en milieu hyperbare / plongée | RS 832.311.12 art. 37, 50 |
| Travaux en hauteur sur pylônes électriques | ESTI 245 art. 5.1.3 |
| Unités d'irradiation mobiles (radio NDT) | OUMR RS 814.554 art. 58 |
| Travaux dans des conduites | OTConst art. 119 |
| Service de piquet seul nuit/weekend avec intervention dangereuse | OPA art. 8 |

#### ÉTAPE 3 — Aptitudes du travailleur

Vérification des aptitudes selon ch. 3 SUVA. 3 blocs : Psychique / Physique / Intellectuelle.

**⚠️ Comportement par défaut :** Les 3 aptitudes ne sont **PAS cochées par défaut**. Le cadre ou le spécialiste doit évaluer activement chaque aptitude avant de la valider. Aucune aptitude ne doit être présumée acquise sans vérification explicite.

**📋 Responsabilité du cadre :** Il est de la responsabilité du cadre hiérarchique d'évaluer régulièrement les aptitudes du travailleur (ch. 3 SUVA). Cette évaluation doit être actualisée lors de chaque révision de l'analyse ou en cas de changement de situation du travailleur (état de santé, nouveau traitement médical, changement de poste, etc.). Une mention visible dans l'interface rappelle cette obligation.

**Aptitudes psychiques — contre-indications :**
- Manque d'assurance même en travail collectif
- Angoisses fréquentes en situation de solitude
- Troubles ou maladies psychiques
- Graves troubles de la concentration

**Aptitudes physiques — contre-indications :**
- Épilepsie, diabète mal maîtrisé, asthme, hypotension/hypertension
- Alcoolisme, pharmacodépendance, toxicomanie
- Médicaments sédatifs ou excitants
- Allergies graves (piqûres d'insectes, etc.)

**Aptitudes intellectuelles — critères requis :**
- Connaissance complète de la mission et formation reçue
- Capacité à lire et comprendre toutes instructions écrites
- Aptitude à utiliser et surveiller les équipements de travail
- Capacité à prendre des décisions en mode normal et dégradé

#### ÉTAPE 4 — Identification du danger principal

Description libre du danger le plus grave identifié avec aides contextuelles.

#### ÉTAPE 5 — Matrice des risques : Gravité du dommage

| Code | Libellé | Description | Exemples concrets |
|------|---------|-------------|-------------------|
| I | Très grave (Mortelle) | Risque de décès en l'absence de premiers secours immédiats | Chute de grande hauteur (>3m), électrocution haute tension, ensevelissement, noyade, intoxication par gaz mortel, écrasement par machine |
| II | Grave (Invalidité) | Invalidité permanente possible — blessure grave avec atteinte irréversible | Amputation d'un membre, lésion médullaire (paralysie), perte de la vue, traumatisme crânien sévère, brûlures étendues au 3e degré |
| III | Moyen (Arrêt prolongé) | Blessure grave avec arrêt de travail prolongé | Fracture ouverte, luxation grave, brûlure au 2e degré étendue, lésion dorsale traumatique (tassement vertébral), entorse grave avec ligaments déchirés |
| IV | Faible (Arrêt court) | Blessure nécessitant un traitement médical avec arrêt de travail temporaire | Fracture simple (doigt, poignet), entorse modérée, coupure nécessitant des points de suture, brûlure localisée au 1er-2e degré |
| V | Très faible (Légère) | Blessure légère, premiers soins suffisants — pas d'arrêt de travail | Écorchure, petite coupure superficielle, contusion légère, piqûre d'insecte sans allergie, courbature musculaire |

#### ÉTAPE 6 — Matrice des risques : Probabilité d'accident

| Code | Libellé | Description |
|------|---------|-------------|
| A | Fréquent | Plus de 1× par mois |
| B | Occasionnel | Entre 1×/an et 1×/mois |
| C | Rare | Entre 1×/5 ans et 1×/an |
| D | Improbable | Entre 1×/20 ans et 1×/5 ans |
| E | Quasi impossible | Entre 1×/100 ans et 1×/20 ans |

#### ÉTAPE 7 — Résultat de la matrice

Affichage de la matrice 5×5 avec cellule mise en évidence et zone résultante.

```
           V (TF)  IV (F)  III (M)  II (G)  I (TG)
A Fréquent   4      3a       2        1       1
B Occasion.  4      3a       2        2       1
C Rare       4      3a       3b       2       2
D Improbable 4      3a       3b       3b      3b
E Quasi imp. 4       4        4        4      3b
```

#### ÉTAPE 8 — Conditions opérationnelles et équipements

| Paramètre | Spécification |
|-----------|--------------|
| Couverture réseau | 3 niveaux : Permanente / Partielle / Inexistante |
| Équipement DATI/PTI disponible | Sélection multiple configurable |
| Centrale d'alarme | Type + nom + disponibilité 24/7 |
| Collègues à proximité | OUI / NON + délai estimé |
| Temps secouristes internes — DE JOUR | Minutes |
| Temps secouristes internes — DE NUIT/WEEKEND | Minutes (conditionnel) |
| Temps arrivée secours publics (144/1414) | Minutes — alerte si >15 min |
| Couverture GPS | OUI / NON / Partielle |
| Évaluation des dangers faite | OUI / NON / En cours |
| Nombre total de travailleurs qualifiés | Numérique |

#### ÉTAPE 9 — Concept d'urgence

4 composantes SUVA (ch. 7 44094.F) :
1. Organisation de l'alerte
2. Premiers secours
3. Formation et comportement
4. Accès des secours

Calcul automatique du t_max pour Zone 3.

#### ÉTAPE 10 — Formation et validation

Checklist de formation minimale (ch. 8 SUVA) + Date / Formateur / Documentation / Date révision.

---

## 4. RAPPORT D'ANALYSE ET EXPORTS

### 4.1 Vue Rapport (M3)

5 blocs visuels : En-tête identité, Matrice des risques, Décision et mesures, Conditions opérationnelles, Formation & urgence.

### 4.2 Export PDF

Format A4, matrice en couleur, signatures, filigrane BROUILLON si non finalisé.

### 4.3 Export CSV

Une ligne par analyse. UTF-8 BOM pour compatibilité Excel Windows.

---

## 5. MODÈLE DE DONNÉES — GOOGLE SHEETS

### 5.1 Principe multi-tenant

Chaque entreprise utilise son propre Google Sheet. La webapp n'héberge aucune donnée.

**Structure des onglets :**
- Onglet 1 : "Analyses" → une ligne par analyse
- Onglet 2 : "Config" → paramètres de l'entreprise
- Onglet 3 : "Taxonomies" → listes de valeurs configurables
- Onglet 4 : "Zones_Textes" → textes des statuts Z1 à Z4
- Onglet 5 : "Travailleurs_Reg" → textes des 13 catégories de travaux réglementés

### 5.2 Colonnes de l'onglet "Analyses" — 58 colonnes

```
1   id                              UUID auto
2   date_creation                   ISO 8601
3   date_revision                   ISO 8601
4   statut                          BROUILLON / COMPLET / VALIDE
5   entreprise                      Texte
6   departement_service             Texte
7   responsable                     Texte
8   titre_activite                  Texte
9   description_activite            Texte long
10  nbr_personnes_simultane         Entier
11  periode_travail                 Jour / Nuit / Jour+Nuit
12  frequence_activite_isolee       F0 / F1 / F2 / F3
13  travaux_reglementes_01          OUI / NON / HORS PERIM. — Électrique BT
14  travaux_reglementes_02          OUI / NON / HORS PERIM. — Réservoirs/exigus
15  travaux_reglementes_03          OUI / NON / HORS PERIM. — Peinture pistolet
16  travaux_reglementes_04          OUI / NON / HORS PERIM. — Cordes/antichute
17  travaux_reglementes_05          OUI / NON / HORS PERIM. — Déconstruction
18  travaux_reglementes_06          OUI / NON / HORS PERIM. — Voies ferrées
19  travaux_reglementes_07          OUI / NON / HORS PERIM. — Forestiers
20  travaux_reglementes_08          OUI / NON / HORS PERIM. — Thermiques
21  travaux_reglementes_09          OUI / NON / HORS PERIM. — Hyperbare
22  travaux_reglementes_10          OUI / NON / HORS PERIM. — Pylônes
23  travaux_reglementes_11          OUI / NON / HORS PERIM. — Irradiation NDT
24  travaux_reglementes_12          OUI / NON / HORS PERIM. — Conduites
25  travaux_reglementes_13          OUI / NON / HORS PERIM. — Piquet nuit/WE
26  aptitude_psychique              OK / AVEC_RESERVES / NON_APTE
27  aptitude_physique               OK / AVEC_RESERVES / NON_APTE
28  aptitude_intellectuelle         OK / AVEC_RESERVES / NON_APTE
29  personnel_moins_18ans           OUI / NON
30  danger_principal                Texte
31  gravite_code                    I / II / III / IV / V
32  gravite_label                   Texte
33  probabilite_code                A / B / C / D / E
34  probabilite_label               Texte
35  zone_matrice                    1 / 2 / 3a / 3b / 4
36  zone_forcee                     OUI / NON
37  type_surveillance               INTERDIT / CONTINUE_AUTO / PERIODIQUE_8H / PERIODIQUE_4H / AUTORISE
38  couverture_reseau               PERMANENTE / PARTIELLE / INEXISTANTE
39  equipements_dati                Texte multi-valeurs (séparateur |)
40  centrale_alarme_type            Interne 24/7 / Externe permanente / Horaires limités / Aucune
41  centrale_alarme_nom             Texte
42  couverture_gps                  OUI / NON / PARTIELLE
43  delai_secouristes_jour_min      Entier (minutes)
44  delai_secouristes_nuit_min      Entier (minutes)
45  delai_secours_publics_min       Entier (minutes)
46  delai_max_sauvetage_calcule_min Entier (minutes)
47  visite_medicale_annuelle        OUI / NON
48  evaluation_dangers_faite        OUI / NON / EN_COURS
49  concept_urgence_alerte          Texte
50  concept_urgence_secours         Texte
51  concept_urgence_formation       Texte
52  concept_urgence_acces           Texte
53  formation_documentee            OUI / NON
54  formation_date                  ISO 8601
55  formation_formateur             Texte
56  nbr_travailleurs_total          Entier
57  mesures_surveillance            Texte multi-valeurs (séparateur |)
58  exigences_minimales_texte       Texte
```

---

## 6. MODULE PARAMÈTRES ET TAXONOMIES (M6)

### 6.1 Paramètres configurables

| Section | Éléments |
|---------|----------|
| Identité entreprise | Nom, adresse, logo (URL), contact SST |
| Unités organisationnelles | Départements et services — hiérarchie 2 niveaux |
| Textes des zones Z1 à Z4 | Titre + exigences minimales. Z3 : textes distincts 3a et 3b |
| Équipements DATI | Liste avec description et niveau de surveillance |
| Fréquences d'activité | Libellés personnalisables. Codes F0-F3 fixes |
| Travaux réglementés | Libellé modifiable. Références légales non supprimables |
| Textes du rapport PDF | Introduction, conclusion, bas de page |
| Connexion Google Sheets | URL, noms onglets, test connexion |

### 6.2 Éléments non modifiables — SUVA_REGULATORY_CONSTANT

- La matrice des risques SUVA (valeurs des zones 1 à 4)
- Les références légales des travaux réglementés (ch. 9)
- La formule de calcul du t_max
- Les définitions des gravités I à V et probabilités A à E

---

## 7. SPÉCIFICATIONS UX/UI

### 7.1 Principes directeurs

- **Clarté** : chaque question compréhensible par un contremaître sans formation SST
- **Guidage** : aide contextuelle sur chaque champ
- **Feedback immédiat** : zone et mesures affichées dès données suffisantes
- **Progression visible** : barre de progression + résumé latéral
- **Mobile-first** : formulaire fonctionnel sur smartphone
- **Zéro perte de données** : sauvegarde automatique localStorage

### 7.2 Palette de couleurs

- Couleur principale : `#E36C09` — Orange SUVA
- Zone Z1 : `#C00000` — Rouge foncé (interdiction)
- Zone Z2 : `#FF8C00` — Orange vif (vigilance élevée)
- Zone Z3a/3b : `#FFC000` — Jaune ambre (vigilance modérée)
- Zone Z4 : `#70AD47` — Vert (autorisé)
- Typographie : Inter (Google Fonts)
- Composants : DaisyUI sur TailwindCSS

### 7.3 Logique conditionnelle

- Travaux réglementés = OUI → alerte rouge + zone forcée Z1
- Personnel <18 ans = OUI → alerte blocage
- Période = Nuit ou Weekend → afficher champs délai nuit
- Couverture réseau = INEXISTANTE → alerte DATI GSM
- Délai secours publics >15 min → avertissement
- t_max calculé ≤ 0 → alerte blocage → Zone 2
- Zone = 1 → message interdiction uniquement

---

## 8. ARCHITECTURE TECHNIQUE

### 8.1 Stack technologique

| Couche | Technologie |
|--------|------------|
| Framework UI | React 18 + TypeScript + Vite |
| Styling | TailwindCSS v3 + DaisyUI v4 |
| État global | React Context + useReducer |
| Persistance locale | localStorage |
| Intégration Google | Google Identity Services + Sheets API v4 |
| Export PDF | jsPDF + html2canvas |
| Export CSV | Génération native (Blob + URL.createObjectURL) |
| Déploiement | Vercel ou Cloudflare Pages |

### 8.2 Structure des fichiers

```
/src
  /components
    /steps
      Step01_Identification.tsx
      Step02_TravauxReglementes.tsx
      Step03_Aptitudes.tsx
      Step04_DangerPrincipal.tsx
      Step05_Gravite.tsx
      Step06_Probabilite.tsx
      Step07_ResultatMatrice.tsx
      Step08_ConditionsOperationnelles.tsx
      Step09_ConceptUrgence.tsx
      Step10_Formation.tsx
    /shared
      RiskMatrix.tsx
      ZoneBadge.tsx
      AptitudeChecklist.tsx
      TooltipSuva.tsx
    /report
      ReportView.tsx
      ReportBloc_Matrice.tsx
      ReportBloc_Decision.tsx
      ReportBloc_Operations.tsx
    /export
      PdfGenerator.tsx
      CsvExporter.tsx
    /settings
      SettingsPage.tsx
      TaxonomyEditor.tsx
      GoogleSheetsConnect.tsx
  /hooks
    useAnalysis.ts
    useLocalStorage.ts
    useGoogleSheets.ts
    useTaxonomies.ts
  /utils
    matrix.ts
    tmax.ts
    validation.ts
    pdfBuilder.ts
    csvBuilder.ts
  /constants
    suva.ts
  /types
    analysis.types.ts
```

### 8.3 Types TypeScript fondamentaux

```typescript
type Gravite = 'I' | 'II' | 'III' | 'IV' | 'V';
type Probabilite = 'A' | 'B' | 'C' | 'D' | 'E';
type ZoneRisque = '1' | '2' | '3a' | '3b' | '4';
type TypeSurveillance =
  | 'INTERDIT'
  | 'CONTINUE_AUTOMATIQUE'
  | 'PERIODIQUE_8H'
  | 'PERIODIQUE_4H'
  | 'AUTORISE';

// SUVA_REGULATORY_CONSTANT — ne pas modifier
const MATRIX: Record<Probabilite, Record<Gravite, ZoneRisque>> = {
  A: { V: '4', IV: '3a', III: '2', II: '1', I: '1' },
  B: { V: '4', IV: '3a', III: '2', II: '2', I: '1' },
  C: { V: '4', IV: '3a', III: '3b', II: '2', I: '2' },
  D: { V: '4', IV: '3a', III: '3b', II: '3b', I: '3b' },
  E: { V: '4', IV: '4',  III: '4',  II: '4',  I: '3b' },
};
```

---

## 9. RÈGLES MÉTIER CRITIQUES — NON NÉGOCIABLES

Ces règles sont annotées `// SUVA_REGULATORY_CONSTANT` dans le code.

- **R1** — Si travail réglementé coché OUI → Zone 1 forcée
- **R2** — Si personnel <18 ans → Zone 1 obligatoire
- **R3** — Zone 1 : surveillance ne remplace pas la présence d'une 2e personne
- **R4** — Si t_max ≤ 0 → Zone 3 impossible → basculer Zone 2
- **R5** — Si délai secours >15 min en Zone 2 → avertissement ch. 7.2 SUVA
- **R6** — Matrice SUVA non modifiable par l'utilisateur
- **R7** — PDF mentionne toujours "SUVA 44094.F — Édition mai 2025"

---

## 10. ROADMAP DE DÉVELOPPEMENT

### Phase 1 — MVP
- M2 — Formulaire guidé complet (étapes 1 à 10)
- M3 — Vue rapport avec matrice visuelle
- M4 — Export PDF + Export CSV
- Persistance localStorage
- Déploiement Vercel

### Phase 2 — Intégration Google Sheets
- M5 — Connexion OAuth2 + lecture Config
- Synchronisation analyses
- M6 — Paramètres de base

### Phase 3 — Taxonomies paramétrables
- M6 complet — Gestion des taxonomies
- Textes Z1-Z4 modifiables
- Listes équipements, unités org.
- Logo entreprise dans PDF

### Phase 4 — Améliorations UX
- Tableau de bord avec filtres
- Mode comparaison
- Import CSV
- Notifications révision
- Mode hors-ligne (PWA)

---

**Référence : SUVA 44094.F (mai 2025) — OPA RS 832.30**
*Ce document est un cahier des charges de développement, pas un document SST officiel.*
