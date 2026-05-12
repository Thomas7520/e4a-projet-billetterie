const request = require('supertest');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const createApp = require('../app');

let app;
let db;

beforeAll(async () => {
  db = new Database(':memory:');

  db.exec(`
    CREATE TABLE users (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      email    TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nom      TEXT,
      prenom   TEXT,
      role     TEXT NOT NULL DEFAULT 'client'
    );
    CREATE TABLE concerts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      titre       TEXT NOT NULL DEFAULT '',
      artiste     TEXT NOT NULL,
      date        TEXT NOT NULL,
      heure       TEXT NOT NULL DEFAULT '',
      lieu        TEXT NOT NULL,
      description TEXT,
      statut      TEXT NOT NULL DEFAULT 'ouvert',
      prixBase    REAL,
      stock       INTEGER
    );
    CREATE TABLE categories_places (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      concert_id    INTEGER NOT NULL,
      nom           TEXT NOT NULL,
      prix          REAL NOT NULL,
      stock_initial INTEGER NOT NULL,
      stock_restant INTEGER NOT NULL
    );
    CREATE TABLE commandes (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL,
      items         TEXT,
      total         REAL,
      date_commande TEXT,
      statut        TEXT NOT NULL DEFAULT 'payée'
    );
    CREATE TABLE cartes_paiement (
      card_number TEXT PRIMARY KEY,
      titulaire   TEXT NOT NULL,
      solde       REAL NOT NULL,
      cvv         TEXT NOT NULL DEFAULT '',
      expiration  TEXT NOT NULL DEFAULT ''
    );
  `);

  const mdpAdmin = await bcrypt.hash('Admin123!', 10);
  const mdpUser  = await bcrypt.hash('User123!',  10);

  db.prepare('INSERT INTO users (email, password, nom, prenom, role) VALUES (?, ?, ?, ?, ?)')
    .run('admin@test.fr', mdpAdmin, 'Admin', 'Test', 'admin');
  db.prepare('INSERT INTO users (email, password, nom, prenom, role) VALUES (?, ?, ?, ?, ?)')
    .run('user@test.fr', mdpUser, 'Dupont', 'Jean', 'client');

  db.prepare(
    'INSERT INTO concerts (titre, artiste, date, heure, lieu, description, statut, prixBase, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run('Concert Test', 'Artiste Test', '2030-01-01', '20:00', 'Paris', 'Description test', 'ouvert', 50, 100);

  db.prepare(
    'INSERT INTO categories_places (concert_id, nom, prix, stock_initial, stock_restant) VALUES (?, ?, ?, ?, ?)'
  ).run(1, 'Fosse', 50, 100, 100);

  db.prepare(
    'INSERT INTO cartes_paiement (card_number, titulaire, solde, cvv, expiration) VALUES (?, ?, ?, ?, ?)'
  ).run('4111111111111111', 'Jean Dupont', 500.00, '123', '12/30');

  db.prepare(
    'INSERT INTO cartes_paiement (card_number, titulaire, solde, cvv, expiration) VALUES (?, ?, ?, ?, ?)'
  ).run('4222222222222222', 'Compte Vide', 0.00, '456', '12/30');

  app = createApp(db);
});

afterAll(() => {
  db.close();
});

// Inscription

describe('POST /api/register', () => {
  it('crée un compte avec des données valides', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ email: 'nouveau@test.fr', password: 'pass', nom: 'Martin', prenom: 'Claire' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('refuse un email déjà utilisé', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ email: 'user@test.fr', password: 'pass', nom: 'X', prenom: 'Y' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

// Connexion

describe('POST /api/login', () => {
  it('connecte un utilisateur avec les bons identifiants', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'user@test.fr', password: 'User123!' });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('user@test.fr');
    expect(res.body.user.role).toBe('client');
  });

  it('refuse avec un mauvais mot de passe', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'user@test.fr', password: 'mauvais' });
    expect(res.status).toBe(401);
  });

  it('refuse avec un email inconnu', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'inconnu@test.fr', password: 'pass' });
    expect(res.status).toBe(401);
  });
});

// Concerts

describe('GET /api/concerts', () => {
  it('retourne la liste des concerts', async () => {
    const res = await request(app).get('/api/concerts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('GET /api/concerts/:id', () => {
  it('retourne le détail du concert', async () => {
    const res = await request(app).get('/api/concerts/1');
    expect(res.status).toBe(200);
    expect(res.body.titre).toBe('Concert Test');
    expect(res.body.heure).toBe('20:00');
  });

  it('retourne 404 pour un concert inexistant', async () => {
    const res = await request(app).get('/api/concerts/9999');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/concerts/:id/categories', () => {
  it('retourne les catégories du concert', async () => {
    const res = await request(app).get('/api/concerts/1/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].nom).toBe('Fosse');
  });
});

// Paiement

describe('POST /api/payment', () => {
  it('accepte un paiement valide et débite la carte', async () => {
    const res = await request(app)
      .post('/api/payment')
      .send({ cardNumber: '4111111111111111', cvv: '123', expiration: '12/30', total: 50 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const carte = db.prepare('SELECT solde FROM cartes_paiement WHERE card_number = ?').get('4111111111111111');
    expect(carte.solde).toBe(450);
  });

  it('refuse si la carte est introuvable', async () => {
    const res = await request(app)
      .post('/api/payment')
      .send({ cardNumber: '0000000000000000', cvv: '123', expiration: '12/30', total: 50 });
    expect(res.status).toBe(404);
  });

  it('refuse si le CVV est incorrect', async () => {
    const res = await request(app)
      .post('/api/payment')
      .send({ cardNumber: '4111111111111111', cvv: '999', expiration: '12/30', total: 50 });
    expect(res.status).toBe(402);
    expect(res.body.error).toBe('Carte invalide');
  });

  it('refuse si le solde est insuffisant', async () => {
    const res = await request(app)
      .post('/api/payment')
      .send({ cardNumber: '4222222222222222', cvv: '456', expiration: '12/30', total: 50 });
    expect(res.status).toBe(402);
    expect(res.body.error).toContain('Solde insuffisant');
  });
});

// Commandes

describe('POST /api/orders', () => {
  const panier = [{ id: 1, artiste: 'Artiste Test', categoryId: 1, categoryNom: 'Fosse', selectedQuantity: 2 }];

  it('crée une commande valide et décrémente le stock', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ cart: panier, total: 100, userId: 2 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const categorie = db.prepare('SELECT stock_restant FROM categories_places WHERE id = 1').get();
    expect(categorie.stock_restant).toBe(98);
  });

  it('refuse si le concert est annulé', async () => {
    db.prepare('UPDATE concerts SET statut = ? WHERE id = 1').run('annulé');
    const res = await request(app)
      .post('/api/orders')
      .send({ cart: panier, total: 100, userId: 2 });
    expect(res.status).toBe(400);
    db.prepare('UPDATE concerts SET statut = ? WHERE id = 1').run('ouvert');
  });

  it('refuse si la date du concert est déjà passée', async () => {
    db.prepare('UPDATE concerts SET date = ? WHERE id = 1').run('2020-01-01');
    const res = await request(app)
      .post('/api/orders')
      .send({ cart: panier, total: 100, userId: 2 });
    expect(res.status).toBe(400);
    db.prepare('UPDATE concerts SET date = ? WHERE id = 1').run('2030-01-01');
  });

  it('refuse si le stock est insuffisant', async () => {
    const panierExcessif = [{ id: 1, artiste: 'Artiste Test', categoryId: 1, categoryNom: 'Fosse', selectedQuantity: 9999 }];
    const res = await request(app)
      .post('/api/orders')
      .send({ cart: panierExcessif, total: 100, userId: 2 });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/orders/:userId', () => {
  it('retourne les commandes de l\'utilisateur', async () => {
    const res = await request(app).get('/api/orders/2');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('retourne un tableau vide pour un utilisateur sans commande', async () => {
    const res = await request(app).get('/api/orders/999');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// Administration

describe('POST /api/admin/concerts', () => {
  it('refuse la création à un utilisateur non-admin', async () => {
    const res = await request(app)
      .post('/api/admin/concerts')
      .send({ userId: 2, titre: 'Test', artiste: 'Test', date: '2030-06-01', heure: '20:00', lieu: 'Lyon', statut: 'ouvert' });
    expect(res.status).toBe(403);
  });

  it('crée un concert si l\'utilisateur est admin', async () => {
    const res = await request(app)
      .post('/api/admin/concerts')
      .send({
        userId: 1, titre: 'Festival Admin', artiste: 'DJ Test',
        date: '2030-06-01', heure: '21:00', lieu: 'Lyon', statut: 'ouvert',
        categories: [{ nom: 'Pelouse', prix: '35', stock_initial: '200' }],
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
