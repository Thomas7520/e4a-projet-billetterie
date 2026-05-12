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

  CREATE TABLE IF NOT EXISTS cartes_paiement (
    card_number TEXT PRIMARY KEY,
    titulaire   TEXT NOT NULL,
    solde       REAL NOT NULL,
    cvv         TEXT NOT NULL DEFAULT '',
    expiration  TEXT NOT NULL DEFAULT ''
  );
`);




// test cartes
const insertCard = db.prepare(
  'INSERT OR REPLACE INTO cartes_paiement (card_number, titulaire, solde, cvv, expiration) VALUES (?, ?, ?, ?, ?)'
);
insertCard.run('4111111111111111', 'Alice Dupont',  500.00, '123', '12/26');
insertCard.run('4222222222222222', 'Bob Martin',    150.00, '456', '08/27');
insertCard.run('5100000000000099', 'Claire Leroy',   50.00, '789', '03/26');
insertCard.run('5500000000000004', 'David Bernard',   0.00, '321', '06/28');

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

app.get('/api/concerts/:id', (req, res) => {
  const concert = db.prepare('SELECT * FROM concerts WHERE id = ?').get(req.params.id);
  if (!concert) return res.status(404).json({ error: 'Concert introuvable' });
  res.json(concert);
});

app.get('/api/concerts/:id/categories', (req, res) => {
  const cats = db.prepare('SELECT * FROM categories_places WHERE concert_id = ?').all(req.params.id);
  res.json(cats);
});


const checkAdmin = (userId) => {
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(userId);
  return user && user.role === 'admin';
};

const recomputeConcertSummary = (concertId) => {
  const cats = db.prepare('SELECT prix, stock_restant FROM categories_places WHERE concert_id = ?').all(concertId);
  if (cats.length === 0) return;
  const prixBase = Math.min(...cats.map(c => c.prix));
  const stock = cats.reduce((s, c) => s + c.stock_restant, 0);
  db.prepare('UPDATE concerts SET prixBase=?, stock=? WHERE id=?').run(prixBase, stock, concertId);
};

app.post('/api/admin/concerts', (req, res) => {
  const { userId, titre, artiste, date, lieu, description, statut, categories } = req.body;
  if (!checkAdmin(userId)) return res.status(403).json({ error: 'Accès refusé' });

  const create = db.transaction(() => {
    const info = db.prepare(
      'INSERT INTO concerts (titre, artiste, date, lieu, description, statut, prixBase, stock) VALUES (?, ?, ?, ?, ?, ?, 0, 0)'
    ).run(titre, artiste, date, lieu, description || '', statut || 'ouvert');

    const concertId = info.lastInsertRowid;

    if (categories && categories.length > 0) {
      const insertCat = db.prepare(
        'INSERT INTO categories_places (concert_id, nom, prix, stock_initial, stock_restant) VALUES (?, ?, ?, ?, ?)'
      );
      for (const cat of categories) {
        insertCat.run(concertId, cat.nom, parseFloat(cat.prix), parseInt(cat.stock_initial), parseInt(cat.stock_initial));
      }
      recomputeConcertSummary(concertId);
    }
    return concertId;
  });

  res.json({ success: true, id: create() });
});

app.put('/api/admin/concerts/:id', (req, res) => {
  const { userId, titre, artiste, date, lieu, description, statut } = req.body;
  if (!checkAdmin(userId)) return res.status(403).json({ error: 'Accès refusé' });

  db.prepare(
    'UPDATE concerts SET titre=?, artiste=?, date=?, lieu=?, description=?, statut=? WHERE id=?'
  ).run(titre, artiste, date, lieu, description || '', statut, req.params.id);

  res.json({ success: true });
});

app.post('/api/admin/concerts/:id/categories', (req, res) => {
  const { userId, nom, prix, stock_initial } = req.body;
  if (!checkAdmin(userId)) return res.status(403).json({ error: 'Accès refusé' });

  db.prepare(
    'INSERT INTO categories_places (concert_id, nom, prix, stock_initial, stock_restant) VALUES (?, ?, ?, ?, ?)'
  ).run(req.params.id, nom, parseFloat(prix), parseInt(stock_initial), parseInt(stock_initial));

  recomputeConcertSummary(req.params.id);
  res.json({ success: true });
});

app.put('/api/admin/categories/:catId', (req, res) => {
  const { userId, nom, prix, stock_initial, stock_restant } = req.body;
  if (!checkAdmin(userId)) return res.status(403).json({ error: 'Accès refusé' });

  const cat = db.prepare('SELECT concert_id FROM categories_places WHERE id = ?').get(req.params.catId);
  if (!cat) return res.status(404).json({ error: 'Catégorie introuvable' });

  db.prepare(
    'UPDATE categories_places SET nom=?, prix=?, stock_initial=?, stock_restant=? WHERE id=?'
  ).run(nom, parseFloat(prix), parseInt(stock_initial), parseInt(stock_restant), req.params.catId);

  recomputeConcertSummary(cat.concert_id);
  res.json({ success: true });
});

app.delete('/api/admin/categories/:catId', (req, res) => {
  const { userId } = req.body;
  if (!checkAdmin(userId)) return res.status(403).json({ error: 'Accès refusé' });

  const cat = db.prepare('SELECT concert_id FROM categories_places WHERE id = ?').get(req.params.catId);
  if (!cat) return res.status(404).json({ error: 'Catégorie introuvable' });

  db.prepare('DELETE FROM categories_places WHERE id = ?').run(req.params.catId);
  recomputeConcertSummary(cat.concert_id);
  res.json({ success: true });
});

app.patch('/api/admin/concerts/:id/statut', (req, res) => {
  const { userId, statut } = req.body;
  if (!checkAdmin(userId)) return res.status(403).json({ error: 'Accès refusé' });

  const validStatuts = ['ouvert', 'complet', 'annulé', 'terminé', 'brouillon'];
  if (!validStatuts.includes(statut)) return res.status(400).json({ error: 'Statut invalide' });

  db.prepare('UPDATE concerts SET statut=? WHERE id=?').run(statut, req.params.id);
  res.json({ success: true });
});

app.post('/api/orders', (req, res) => {
  const { cart, total, userId } = req.body;
  const itemsSummary = cart.map(i =>
    `${i.selectedQuantity}x ${i.artiste}${i.categoryNom ? ` (${i.categoryNom})` : ''}`
  ).join(', ');

  const transaction = db.transaction(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkedConcerts = new Set();
    for (const item of cart) {
      if (checkedConcerts.has(item.id)) continue;
      checkedConcerts.add(item.id);
      const concert = db.prepare('SELECT titre, statut, date FROM concerts WHERE id = ?').get(item.id);
      if (!concert) throw new Error('Concert introuvable');
      if (concert.statut === 'annulé') throw new Error(`Le concert "${concert.titre}" est annulé`);
      if (new Date(concert.date) < today) throw new Error(`Le concert "${concert.titre}" est déjà passé`);
    }

    for (const item of cart) {
      if (item.categoryId) {
        const cat = db.prepare('SELECT * FROM categories_places WHERE id = ?').get(item.categoryId);
        if (!cat || cat.stock_restant < item.selectedQuantity) {
          throw new Error(`Stock insuffisant pour ${item.artiste} - ${item.categoryNom}`);
        }
        db.prepare('UPDATE categories_places SET stock_restant = stock_restant - ? WHERE id = ?')
          .run(item.selectedQuantity, item.categoryId);
        db.prepare('UPDATE concerts SET stock = stock - ? WHERE id = ?')
          .run(item.selectedQuantity, item.id);
      } else {
        const concert = db.prepare('SELECT stock FROM concerts WHERE id = ?').get(item.id);
        if (!concert || concert.stock < item.selectedQuantity) {
          throw new Error(`Stock insuffisant pour ${item.artiste}`);
        }
        db.prepare('UPDATE concerts SET stock = stock - ? WHERE id = ?')
          .run(item.selectedQuantity, item.id);
      }
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

app.post('/api/payment', (req, res) => {
  const { cardNumber, cvv, expiration, total } = req.body;
  if (!cardNumber || !cvv || !expiration || total == null)
    return res.status(400).json({ error: 'Données manquantes' });

  const card = db.prepare('SELECT * FROM cartes_paiement WHERE card_number = ?').get(cardNumber);
  if (!card) return res.status(404).json({ error: 'Carte bancaire introuvable' });
  if (card.expiration !== expiration || card.cvv !== cvv) return res.status(402).json({ error: 'Carte invalide' });
  if (card.solde < total) {
    return res.status(402).json({
      error: `Solde insuffisant — solde disponible : ${card.solde.toFixed(2)} €`,
    });
  }

  db.prepare('UPDATE cartes_paiement SET solde = solde - ? WHERE card_number = ?').run(total, cardNumber);
  res.json({ success: true });
});

app.listen(5000, () => console.log('Serveur lancé sur http://localhost:5000'));
