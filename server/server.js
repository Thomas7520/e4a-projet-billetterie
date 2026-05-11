const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const db = new Database('billetterie.db');
const bcrypt = require('bcryptjs'); 

app.use(cors());
app.use(express.json());

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    nom TEXT,
    prenom TEXT
  );

  CREATE TABLE IF NOT EXISTS concerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artiste TEXT, date TEXT, lieu TEXT, description TEXT, prixBase REAL, stock INTEGER
  );

  CREATE TABLE IF NOT EXISTS commandes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    items TEXT, -- On stockera les noms des concerts ici pour faire simple
    total REAL,
    date_commande TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);



const row = db.prepare('SELECT count(*) as count FROM concerts').get();
if (row.count === 0) {
  const insert = db.prepare('INSERT INTO concerts (artiste, date, lieu, description, prixBase, stock) VALUES (?, ?, ?, ?, ?, ?)');
  insert.run('Daft Punk', '2026-12-15', 'Accor Arena, Paris', 'Le retour des légendes.', 85, 10);
  insert.run('Justice', '2025-10-20', 'Zénith de Lille', 'Hyperdrama Tour.', 65, 50);
}

// S'inscrire
app.post('/api/register', async (req, res) => {
  const { email, password, nom, prenom } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const stmt = db.prepare('INSERT INTO users (email, password, nom, prenom) VALUES (?, ?, ?, ?)');
    const info = stmt.run(email, hashedPassword, nom, prenom);
    res.json({ success: true, userId: info.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: "Cet email est déjà utilisé" });
  }
});

// Se connecter
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  
  if (user && await bcrypt.compare(password, user.password)) {
    res.json({ success: true, user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email } });
  } else {
    res.status(401).json({ error: "Identifiants invalides" });
  }
});

// Récupérer les concerts
app.get('/api/concerts', (req, res) => {
  const concerts = db.prepare('SELECT * FROM concerts').all();
  res.json(concerts);
});


// Insérer une nouvelle commande
app.post('/api/orders', (req, res) => {
  const { cart, total, userId } = req.body;
  const itemsSummary = cart.map(i => `${i.selectedQuantity}x ${i.artiste}`).join(', ');

  const transaction = db.transaction(() => {
    db.prepare('INSERT INTO commandes (user_id, items, total, date_commande) VALUES (?, ?, ?, ?)')
      .run(userId, itemsSummary, total, new Date().toLocaleString());

    const stmtUpdate = db.prepare('UPDATE concerts SET stock = stock - ? WHERE id = ?');
    for (const item of cart) {
      stmtUpdate.run(item.selectedQuantity, item.id);
    }
  });

  transaction();
  res.json({ success: true });
});

// Récupérer l'historique d'un utilisateur 
app.get('/api/orders/:userId', (req, res) => {
  const orders = db.prepare('SELECT * FROM commandes WHERE user_id = ? ORDER BY id DESC').all(req.params.userId);
  res.json(orders);
});
app.listen(5000, () => console.log('Serveur lancé sur http://localhost:5000'));