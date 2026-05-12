# Projet Billetterie - Rapport de Validation

## 1. Introduction

Dans le cadre de ce projet, nous avons conçu une application web de billetterie pour concerts. L'objectif principal n'est pas seulement technique, mais méthodologique : il s'agit de mettre en oeuvre un processus complet de Validation et Vérification (V&V).

Cette démarche vise à démontrer la qualité du logiciel en s'assurant qu'il répond aux exigences métiers (Validation : "Construisons-nous le bon produit ?") et qu'il est techniquement conforme aux spécifications (Vérification : "Construisons-nous le produit correctement ?").

---

## 2. Définition du Périmètre Fonctionnel

L'application se présente autour de plusieurs interfaces  :

- **Page d'accueil** : présentation des concerts disponibles avec filtres de recherche (artiste, lieu, date, prix maximum) et suggestions de saisie. Elle affiche l'état des ventes (bouton "Réserver", mention "Complet" ou badge "Annulé").
- **Authentification** : création de compte, connexion et déconnexion. Les mots de passe sont hachés et chaque compte est lié à une adresse email unique.
- **Détail du concert** : fiche complète incluant l'artiste, la date, l'heure, le lieu, la description, les catégories de places disponibles et le stock restant par catégorie.
- **Panier** : ajout de billets par catégorie, calcul automatique du montant total, suppression d'articles.
- **Tunnel de paiement** : saisie des informations de facturation et des données de carte, simulation du paiement, redirection vers une page de confirmation ou d'échec.
- **Espace personnel** : consultation de l'historique des commandes.
- **Administration** : création, modification, annulation et gestion des catégories de places pour chaque concert. Accessible uniquement aux utilisateurs ayant le rôle administrateur.

---

## 3. User Stories et Critères d'Acceptation

### US1 - Consultation des concerts

En tant que visiteur, je veux consulter la liste des concerts disponibles afin de trouver un événement qui m'intéresse.

Critères d'acceptation :
- La liste n'affiche que les concerts dont le statut est "ouvert"
- Chaque concert affiche au minimum l'artiste, la date, le lieu et le prix de départ
- Les concerts annulés ou complets sont visibles mais clairement distingués

### US2 - Réservation de billets

En tant que client connecté, je veux choisir une catégorie de place et une quantité afin d'ajouter des billets à mon panier.

Critères d'acceptation :
- La sélection est impossible si le stock de la catégorie est épuisé
- La quantité est limitée à 6 billets par catégorie et par commande
- Le système affiche un message d'erreur explicite en cas de dépassement du stock ou de la limite

### US3 - Paiement

En tant que client, je veux valider mon panier par un paiement simulé afin de finaliser ma commande.

Critères d'acceptation :
- Le paiement est refusé si le numéro de carte est inconnu, le CVV incorrect, la date d'expiration invalide ou le solde insuffisant
- En cas d'acceptation, la commande est enregistrée, le stock est décrémenté et une confirmation avec numéro de transaction s'affiche
- En cas de refus, aucune commande n'est créée et un message explicite est affiché

### US4 - Historique des commandes

En tant que client connecté, je veux consulter mes commandes passées afin de retrouver mes billets achetés.

Critères d'acceptation :
- Seules les commandes de l'utilisateur connecté sont visibles
- Chaque commande affiche la date, le détail des billets et le montant total

### US5 - Administration des concerts

En tant qu'administrateur, je veux créer, modifier et annuler des concerts afin de tenir le catalogue à jour.

Critères d'acceptation :
- Un utilisateur non administrateur ne peut pas accéder aux routes d'administration
- La création d'un concert exige au moins une catégorie de place
- L'annulation d'un concert empêche toute nouvelle réservation sur ce concert

---

## 4. Analyse des Risques

Le test exhaustif étant impossible, nous avons mené une analyse de risques pour prioriser nos efforts de validation. Cette analyse croise l'impact d'un défaut avec sa probabilité d'occurrence pour déterminer la criticité.

| Fonctionnalité | Risque identifié | Impact | Probabilité | Criticité |
|---|---|---|---|---|
| Paiement | Erreur lors de la validation du paiement simulé | Élevé | Faible | Critique |
| Réservation | Surbooking (vendre plus de billets que de places) | Élevé | Moyenne | Critique |
| Authentification | L'identifiant utilisateur est transmis dans le corps des requêtes sans vérification par token | Élevé | Moyenne | Critique |
| Sécurité | Accès aux commandes d'un autre utilisateur | Élevé | Faible | Critique |
| Panier | Montant total erroné lors du récapitulatif | Moyen | Faible | Modéré |
| Performance | Temps de réponse supérieur à 2 secondes | Moyen | Élevée | Important |

Dans le cadre de ce projet de simulation, le risque lié à l'authentification a été écarté : les routes d'administration vérifient le rôle de l'utilisateur en base de données, mais l'identifiant est fourni par le client sans token signé. En production, ce point nécessiterait la mise en place d'un système de session ou de JWT.

---

## 5. Stratégie de Test

Nous avons adopté une approche multi-niveaux pour couvrir l'ensemble du cycle de vie du projet, inspirée du Cycle en V.

### 5.1 Répartition des niveaux de test

| Élément testé | Niveau | Type | Justification |
|---|---|---|---|
| Calcul du total panier | Unitaire | Boîte blanche | On vérifie la logique mathématique isolée de la fonction |
| Validation des données de carte | Unitaire | Boîte blanche | Fonctions pures testables sans environnement navigateur |
| Réservabilité d'un concert | Unitaire | Boîte blanche | Logique combinant statut, date et stock |
| Connexion / Authentification | Intégration | Boîte noire | On valide le scénario utilisateur complet (saisie, accès, refus) |
| Mise à jour des stocks en base | Intégration | Fonctionnel | On s'assure que la réservation décrémente bien le stock en base |
| Parcours nominal d'achat | Intégration | Fonctionnel | On vérifie que le produit répond au besoin métier final |
| Accès administration | Intégration | Sécurité | On vérifie que les routes admin rejettent les non-administrateurs |

### 5.2 Conception des cas de test - Classes d'équivalence et valeurs limites

Pour la règle EM3 (maximum 6 billets par commande), nous avons défini quatre classes d'équivalence :

| Classe | Plage | Exemple | Résultat attendu |
|---|---|---|---|
| CE1 - Quantité inférieure au minimum | Inférieur à 1 | 0 | Refusé |
| CE2 - Quantité valide | De 1 à 6 | 3 | Accepté |
| CE3 - Quantité supérieure au maximum | Supérieur à 6 | 7 | Refusé |
| CE4 - Valeur non entière | Décimal ou texte | 2.5 | Refusé |

Valeurs limites testées : **0** (rejeté), **1** (accepté), **6** (accepté), **7** (rejeté).


### 5.3 Table de décision - Réservabilité d'un concert

Trois conditions déterminent si un concert peut être réservé : le statut doit être "ouvert", la date ne doit pas être passée et le stock doit être supérieur à zéro.

| Statut = ouvert | Date non passée | Stock > 0 | Résultat |
|:---:|:---:|:---:|:---|
| Non | Non | Non | Refusé |
| Non | Non | Oui | Refusé |
| Non | Oui | Non | Refusé |
| Non | Oui | Oui | Refusé |
| Oui | Non | Non | Refusé |
| Oui | Non | Oui | Refusé |
| Oui | Oui | Non | Refusé |
| **Oui** | **Oui** | **Oui** | **Réservation possible** |

Cette table est couverte par la fonction `isConcertReservable` dans `src/utils/helpers.js`.

### 5.4 Cas de test basé sur le cycle de vie d'un concert

Le diagramme d'états d'un concert définit cinq états possibles : Brouillon, Ouvert, Complet, Annulé, Terminé. Les transitions suivantes ont été identifiées et font l'objet de tests :

```
Brouillon --> Ouvert --> Complet
                     --> Annulé --> Ouvert (rouvrir)
                     --> Terminé
```

| Transition | Condition déclenchante | Test associé |
|---|---|---|
| Brouillon → Ouvert | Administrateur change le statut | Modification du statut via l'API admin |
| Ouvert → Annulé | Administrateur annule le concert | Tentative de commande sur concert annulé → erreur (intégration) |
| Annulé → Ouvert | Administrateur rouvre le concert | Statut repassé à "ouvert" → réservation à nouveau possible |
| Ouvert → Complet | Stock atteint zéro | `isConcertReservable` avec stock à 0 → faux (unitaire) |
| Ouvert → Terminé | Date du concert passée | `isConcertReservable` avec date passée → faux (unitaire) |

Le cas critique testé en intégration est la transition **Ouvert → Annulé** : après annulation, une tentative de commande doit être rejetée sans création de commande en base.

---

## 6. Matrice de Traçabilité Exigence → Test(s)

| Exigence | Tests associés |
|---|---|
| EF1 - Liste des concerts ouverts | `filterOpenConcerts` (unitaire) · `GET /api/concerts` (intégration) |
| EF2 - Fiche détaillée d'un concert | `GET /api/concerts/:id` · `GET /api/concerts/:id/categories` (intégration) |
| EF3 - Création de compte | `POST /api/register` - nominal et email déjà utilisé (intégration) |
| EF4 - Connexion | `POST /api/login` - identifiants valides et invalides (intégration) |
| EF5 - Ajout au panier dans la limite du stock | `isStockSufficient` · `isQuantityValid` (unitaire) · stock insuffisant (intégration) |
| EF6 - Calcul automatique du total | `calculateTotal` - panier vide, un article, plusieurs articles (unitaire) |
| EF7 - Validation par paiement simulé | `POST /api/payment` - carte valide, CVV incorrect, solde insuffisant (intégration) |
| EF8 - Confirmation après paiement accepté | `POST /api/orders` parcours complet - commande créée en base (intégration) |
| EF9 - Refus sans création de commande | Paiement refusé → aucune ligne en base (intégration) |
| EF10 - Historique des commandes | `GET /api/orders/:userId` - résultats filtrés par utilisateur (intégration) |
| EF11 - Administration des concerts | `POST /api/admin/concerts` - accès refusé si non administrateur (intégration) |
| EF12 - Décrémentation du stock | `POST /api/orders` - vérification du stock après commande (intégration) |
| EM1 - Pas de vente au-delà du stock | `isStockSufficient` valeurs limites (unitaire) · stock insuffisant en base (intégration) |
| EM2 - Minimum 1 billet | `isQuantityValid(0)` → faux (unitaire) |
| EM3 - Maximum 6 billets | `isQuantityValid(6)` → vrai · `isQuantityValid(7)` → faux (unitaire) |
| EM4 - Concert dont la date est passée | `isConcertReservable` date passée (unitaire) · commande sur concert passé (intégration) |
| EM5 - Concert annulé | `isConcertReservable` statut annulé (unitaire) · commande sur concert annulé (intégration) |
| EM6 - Commande définitive après paiement | Paiement refusé → aucune ligne en base (intégration) |
| EM7 - Prix = prix de la catégorie sélectionnée | `calculateTotal` avec `prixUnitaire` injecté (unitaire) |
| EM8 - Email unique | `POST /api/register` email déjà utilisé → erreur (intégration) |
| EM9 - Admin seul peut créer ou modifier | `POST /api/admin/concerts` avec compte client → accès refusé (intégration) |
| EM10 - Commande liée à un utilisateur | Commande créée avec `userId` · historique filtré par utilisateur (intégration) |

---

## 7. Démarche Qualité et Industrialisation

### 7.1 Couverture de code

La couverture est mesurée sur le dossier `src/utils/`, qui contient l'ensemble des fonctions métier pures. Le résultat est de 100 % sur les lignes, branches et fonctions.

Ce taux est rendu possible par l'extraction de la logique métier hors des composants React. Les fonctions `calculateTotal`, `isStockSufficient`, `isQuantityValid`, `isConcertReservable` et les validateurs de carte n'ont aucune dépendance React et peuvent être testées de manière totalement isolée.

### 7.2 Intégration continue - GitHub Actions

Un pipeline CI se déclenche automatiquement à chaque push et à chaque pull request sur la branche principale. Il est composé de deux jobs parallèles :

**Job client :**
1. Installation des dépendances
2. Analyse statique - échec si une erreur ESLint est présente
3. Build de production - échec si le build échoue
4. Tests unitaires

**Job serveur :**
1. Installation des dépendances
2. Tests d'intégration sur base de données en mémoire

L'utilisation d'une base de données en mémoire pour les tests d'intégration garantit l'isolation complète : chaque exécution repart d'un état vide, sans dépendance à un serveur en fonctionnement.

### 7.3 Organisation des tests

**Tests unitaires (`client/src/utils/helpers.test.js`) :**
- `calculateTotal` : panier vide, un article, plusieurs articles, catégories mixtes
- `isQuantityValid` : classes d'équivalence CE1 à CE4, valeurs limites 0 / 1 / 6 / 7
- `isStockSufficient` : stock exactement suffisant, insuffisant, zéro
- `isConcertReservable` : table de décision complète, cas avec heure
- Validateurs de carte : cas nominaux et cas d'erreur pour le code postal, le numéro, le CVV et la date d'expiration

**Tests d'intégration (`server/tests/api.test.js`) :**
- Inscription et connexion (nominal + erreurs)
- Lecture des concerts et des catégories
- Paiement : carte valide, CVV incorrect, solde insuffisant, carte inconnue
- Commande : parcours nominal avec vérification du stock en base, concert annulé, concert passé
- Historique des commandes
- Contrôle d'accès administration

---

## 8. Conclusion

L'application de ces principes de validation permet de livrer un logiciel robuste. En suivant une approche basée sur le risque et en automatisant les tests critiques, nous avons réduit la probabilité de défaillances majeures en production.

Les deux risques identifiés comme critiques : le surbooking et l'erreur de paiement, couverts à la fois par des tests unitaires sur les règles métier isolées et par des tests d'intégration sur le comportement réel de l'API. La matrice de traçabilité garantit qu'aucune exigence du cahier des charges ne reste sans test associé.

Ce projet démontre que la qualité logicielle n'est pas une étape finale, mais une discipline intégrée à chaque phase de la conception.

---

## 9. Utilisation de l'IA

Un assistant IA a été utilisé ponctuellement sur quatre aspects du projet : la mise en forme visuelle de certaines pages (CSS), la rédaction du fichier README, la génération des données de test insérées en base (noms de concerts, artistes, lieux), et la configuration de Vite et certaines syntaxes React dont nous n'étions pas familiers, et la reformulation de certaines parties de ce rapport.