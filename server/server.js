const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const app = express();
const db = new Database('billetterie.db');

app.use(cors());
app.use(express.json());

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
`);



// Test
const { count } = db.prepare('SELECT count(*) as count FROM concerts').get();
if (count === 0) {
  const hashedPwd = bcrypt.hashSync('Admin123!', 10);
  db.prepare('INSERT INTO users (email, password, nom, prenom, role) VALUES (?, ?, ?, ?, ?)')
    .run('admin@billetterie.fr', hashedPwd, 'Admin', 'Billetterie', 'admin');

  const insertConcert = db.prepare(
    'INSERT INTO concerts (titre, artiste, date, lieu, description, statut, prixBase, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const dp = insertConcert.run(
    'Retour à la Pyramide', 'Daft Punk',
    '2026-12-15', 'Accor Arena, Paris',
    'Le retour des légendes. Une nuit électro inoubliable.',
    'ouvert', 85, 330
  );
  const jt = insertConcert.run(
    'Hyperdrama Tour', 'Justice',
    '2026-09-20', 'Zénith de Lille',
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
 // fin Test

app.post('/api/register', async (req, res) => {
  const { email, password, nom, prenom } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const info = db.prepare('INSERT INTO users (email, password, nom, prenom) VALUES (?, ?, ?, ?)')
      .run(email, hashedPassword, nom, prenom);
    res.json({ success: true, userId: info.lastInsertRowid });
  } catch {
    res.status(400).json({ error: 'Cet email est déjà utilisé' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (user && await bcrypt.compare(password, user.password)) {
    res.json({
      success: true,
      user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role }
    });
  } else {
    res.status(401).json({ error: 'Identifiants invalides' });
  }
});

app.get('/api/concerts', (req, res) => {
  const concerts = db.prepare('SELECT * FROM concerts').all();
  res.json(concerts);
});

app.post('/api/orders', (req, res) => {
  const { cart, total, userId } = req.body;
  const itemsSummary = cart.map(i => `${i.selectedQuantity}x ${i.artiste}`).join(', ');

  const transaction = db.transaction(() => {
    for (const item of cart) {
      const concert = db.prepare('SELECT stock, statut FROM concerts WHERE id = ?').get(item.id);
      if (!concert || concert.stock < item.selectedQuantity) {
        throw new Error(`Stock insuffisant pour ${item.artiste}`);
      }
      db.prepare('UPDATE concerts SET stock = stock - ? WHERE id = ?')
        .run(item.selectedQuantity, item.id);
    }
    db.prepare('INSERT INTO commandes (user_id, items, total, date_commande, statut) VALUES (?, ?, ?, ?, ?)')
      .run(userId, itemsSummary, total, new Date().toLocaleString(), 'payée');
  });

  try {
    transaction();
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur commande :', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/orders/:userId', (req, res) => {
  const orders = db.prepare('SELECT * FROM commandes WHERE user_id = ? ORDER BY id DESC').all(req.params.userId);
  res.json(orders);
});

app.listen(5000, () => console.log('Serveur lancé sur http://localhost:5000'));
