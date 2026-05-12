const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const createApp = require('./app');

const db = new Database('billetterie.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    email    TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nom      TEXT,
    prenom   TEXT,
    role     TEXT NOT NULL DEFAULT 'client'
  );

  CREATE TABLE IF NOT EXISTS concerts (
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

  CREATE TABLE IF NOT EXISTS categories_places (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    concert_id    INTEGER NOT NULL,
    nom           TEXT NOT NULL,
    prix          REAL NOT NULL,
    stock_initial INTEGER NOT NULL,
    stock_restant INTEGER NOT NULL,
    FOREIGN KEY(concert_id) REFERENCES concerts(id)
  );

  CREATE TABLE IF NOT EXISTS commandes (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL,
    items         TEXT,
    total         REAL,
    date_commande TEXT,
    statut        TEXT NOT NULL DEFAULT 'payée',
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS cartes_paiement (
    card_number TEXT PRIMARY KEY,
    titulaire   TEXT NOT NULL,
    solde       REAL NOT NULL,
    cvv         TEXT NOT NULL DEFAULT '',
    expiration  TEXT NOT NULL DEFAULT ''
  );
`);

try { db.exec("ALTER TABLE concerts ADD COLUMN heure TEXT NOT NULL DEFAULT ''"); } catch {}

const insertCard = db.prepare(
  'INSERT OR REPLACE INTO cartes_paiement (card_number, titulaire, solde, cvv, expiration) VALUES (?, ?, ?, ?, ?)'
);
insertCard.run('4111111111111111', 'Alice Dupont',  500.00, '123', '12/26');
insertCard.run('4222222222222222', 'Bob Martin',    150.00, '456', '08/27');
insertCard.run('5100000000000099', 'Claire Leroy',   50.00, '789', '03/26');
insertCard.run('5500000000000004', 'David Bernard',   0.00, '321', '06/28');

const { count } = db.prepare('SELECT count(*) as count FROM concerts').get();
if (count === 0) {
  const hashedPwd = bcrypt.hashSync('Admin123!', 10);
  db.prepare('INSERT INTO users (email, password, nom, prenom, role) VALUES (?, ?, ?, ?, ?)')
    .run('admin@billetterie.fr', hashedPwd, 'Admin', 'Billetterie', 'admin');

  const insertConcert = db.prepare(
    'INSERT INTO concerts (titre, artiste, date, heure, lieu, description, statut, prixBase, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const dp = insertConcert.run(
    'Retour à la Pyramide', 'Daft Punk',
    '2026-12-15', '20:00', 'Accor Arena, Paris',
    'Le retour des légendes. Une nuit électro inoubliable.',
    'ouvert', 85, 330
  );
  const jt = insertConcert.run(
    'Hyperdrama Tour', 'Justice',
    '2026-09-20', '21:00', 'Zénith de Lille',
    'Justice de retour en France pour le Hyperdrama Tour.',
    'ouvert', 65, 230
  );

  const insertCat = db.prepare(
    'INSERT INTO categories_places (concert_id, nom, prix, stock_initial, stock_restant) VALUES (?, ?, ?, ?, ?)'
  );
  insertCat.run(dp.lastInsertRowid, 'Fosse',    85,  100, 100);
  insertCat.run(dp.lastInsertRowid, 'Carré Or', 150,  30,  30);
  insertCat.run(dp.lastInsertRowid, 'Assis',     65, 200, 200);
  insertCat.run(jt.lastInsertRowid, 'Fosse',     65,  80,  80);
  insertCat.run(jt.lastInsertRowid, 'Assis',     45, 150, 150);
}

const app = createApp(db);
app.listen(5000, () => console.log('Serveur lancé sur http://localhost:5000'));
