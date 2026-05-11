const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const db = new Database('billetterie.db');

app.use(cors());
app.use(express.json());

db.exec(`
  CREATE TABLE IF NOT EXISTS concerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artiste TEXT,
    date TEXT,
    lieu TEXT,
    description TEXT,
    prixBase REAL,
    stock INTEGER
  );

  CREATE TABLE IF NOT EXISTS commandes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total REAL,
    date_commande TEXT,
    nb_billets INTEGER
  );
`);

const row = db.prepare('SELECT count(*) as count FROM concerts').get();
if (row.count === 0) {
  const insert = db.prepare('INSERT INTO concerts (artiste, date, lieu, description, prixBase, stock) VALUES (?, ?, ?, ?, ?, ?)');
  insert.run('Daft Punk', '2026-12-15', 'Accor Arena, Paris', 'Le retour des légendes.', 85, 10);
  insert.run('Justice', '2025-10-20', 'Zénith de Lille', 'Hyperdrama Tour.', 65, 50);
}

app.get('/api/concerts', (req, res) => {
  const concerts = db.prepare('SELECT * FROM concerts').all();
  res.json(concerts);
});

// ROUTE : Valider une commande et décrémenter le stock
app.post('/api/orders', (req, res) => {
  const { cart, total } = req.body;

  const transaction = db.transaction(() => {
    // Enregistrer la commande
    const stmtOrder = db.prepare('INSERT INTO commandes (total, date_commande, nb_billets) VALUES (?, ?, ?)');
    stmtOrder.run(total, new Date().toISOString(), cart.length);

    // Mettre à jour les stocks pour chaque billet
    const stmtUpdateStock = db.prepare('UPDATE concerts SET stock = stock - ? WHERE id = ?');
    for (const item of cart) {
      stmtUpdateStock.run(item.selectedQuantity, item.id);
    }
  });

  try {
    transaction();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(5000, () => console.log('Serveur lancé sur http://localhost:5000'));