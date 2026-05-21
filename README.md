# Billetterie en ligne

Projet de validation E4a - application web de billetterie pour des concerts, développée en React et Node.js.

## Présentation

L'application permet à des utilisateurs de consulter des concerts, de réserver des billets par catégorie de place et de payer en ligne. Un espace d'administration permet de gérer le catalogue de concerts.

## Technologies employées

**Frontend**
- React 19 avec React Router 
- Vite
- ESLint 
- Vitest

**Backend**
- Node.js avec Express 5
- SQLite via better-sqlite3
- bcryptjs (hachage des mots de passe)
- Vitest + Supertest (tests d'intégration)

**CI/CD**
- GitHub Actions (lint, build et tests automatiques sur chaque push)

## Lancer le projet

**Prérequis** : Node.js 18 ou supérieur.

**Serveur (port 5000)**

```bash
cd server
npm install
npm install better-sqlite3
npm start
```

Au premier démarrage, la base de données est créée automatiquement avec une trentaine de concerts et un compte administrateur :

```
Email    : admin@billetterie.fr
Mot de passe : Admin123!
```

**Client (port 5173)**

```bash
cd client
npm install
npm install vite
npm run dev
```

L'application est ensuite accessible sur `http://localhost:5173`.

## Comptes de test

**Administrateur**

| Champ | Valeur |
|---|---|
| Email | admin@billetterie.fr |
| Mot de passe | Admin123! |

**Cartes bancaires de test**

| Numéro | Titulaire | Solde | CVV | Expiration |
|---|---|---|---|---|
| 4111111111111111 | Alice Dupont | 500 € | 123 | 12/26 |
| 4222222222222222 | Bob Martin | 150 € | 456 | 08/27 |
| 5100000000000099 | Claire Leroy | 50 € | 789 | 03/26 |
| 5500000000000004 | David Bernard | 0 € | 321 | 06/28 |

## Fonctionnalités

- Inscription et connexion avec validation du mot de passe
- Catalogue de concerts avec filtres (artiste, lieu, date, prix max) et suggestions
- Fiche détail d'un concert avec sélection de la catégorie de place
- Panier avec gestion des quantités (maximum 6 par catégorie)
- Tunnel de paiement avec validation des données de carte
- Historique des commandes
- Espace administration : création, modification et annulation de concerts, gestion des catégories de places

## Tests

```bash
# Tests unitaires (client)
cd client
npm test

# Tests d'intégration (serveur)
cd server
npm test

# Couverture de code (client)
cd client
npm run test:coverage
```

Les tests unitaires couvrent les règles métier (calcul du total, validation du stock, validation des données de carte, réservabilité d'un concert). Les tests d'intégration testent les routes API avec une base de données en mémoire.

## Structure du projet

```
e4a-projet-billetterie/
├── client/                  # Application React
│   ├── src/
│   │   ├── components/      # Composants réutilisables (Navbar, ConcertCard)
│   │   ├── context/         # Contextes React (panier, utilisateur)
│   │   ├── pages/           # Pages (Home, ConcertDetail, Cart, Payment...)
│   │   └── utils/           # Fonctions métier et leurs tests
│   └── package.json
├── server/                  # API REST Node.js
│   ├── app.js               # Définition des routes
│   ├── server.js            # Point d'entrée, connexion BDD et données de test
│   ├── tests/               # Tests d'intégration API
│   └── package.json
└── .github/workflows/ci.yml # Pipeline CI GitHub Actions
```
