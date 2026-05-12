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
  const insertCat = db.prepare(
    'INSERT INTO categories_places (concert_id, nom, prix, stock_initial, stock_restant) VALUES (?, ?, ?, ?, ?)'
  );

  const concertsInitiaux = [
    {
      titre: 'Retour à la Pyramide', artiste: 'Daft Punk', date: '2026-12-15', heure: '20:00',
      lieu: 'Accor Arena, Paris', statut: 'ouvert', prixBase: 85, stock: 330,
      description: 'Le retour des légendes. Une nuit électro inoubliable.',
      cats: [{ nom: 'Fosse', prix: 85, stock: 100 }, { nom: 'Carré Or', prix: 150, stock: 30 }, { nom: 'Assis', prix: 65, stock: 200 }],
    },
    {
      titre: 'Hyperdrama Tour', artiste: 'Justice', date: '2026-09-20', heure: '21:00',
      lieu: 'Zénith de Lille', statut: 'ouvert', prixBase: 65, stock: 230,
      description: 'Justice de retour en France pour le Hyperdrama Tour.',
      cats: [{ nom: 'Fosse', prix: 65, stock: 80 }, { nom: 'Assis', prix: 45, stock: 150 }],
    },
    {
      titre: 'Multitude Tour', artiste: 'Stromae', date: '2026-06-14', heure: '20:30',
      lieu: 'Stade de France, Saint-Denis', statut: 'ouvert', prixBase: 75, stock: 720,
      description: 'Stromae revient sur scène avec son album Multitude.',
      cats: [{ nom: 'Pelouse', prix: 75, stock: 400 }, { nom: 'Tribune', prix: 110, stock: 250 }, { nom: 'Carré Or', prix: 180, stock: 70 }],
    },
    {
      titre: 'Nonante-Cinq Live', artiste: 'Angèle', date: '2026-07-03', heure: '21:00',
      lieu: 'Accor Arena, Paris', statut: 'ouvert', prixBase: 55, stock: 420,
      description: 'Angèle en tournée avec son album Nonante-Cinq.',
      cats: [{ nom: 'Fosse', prix: 55, stock: 200 }, { nom: 'Assis', prix: 75, stock: 220 }],
    },
    {
      titre: 'DNX Tour', artiste: 'Aya Nakamura', date: '2026-08-22', heure: '20:00',
      lieu: 'Zénith de Paris', statut: 'ouvert', prixBase: 50, stock: 300,
      description: 'La reine de la pop francophone dans une salle intime.',
      cats: [{ nom: 'Fosse', prix: 50, stock: 150 }, { nom: 'Assis', prix: 70, stock: 150 }],
    },
    {
      titre: 'Dentro Tour', artiste: 'PNL', date: '2026-09-05', heure: '21:30',
      lieu: 'Stade de France, Saint-Denis', statut: 'ouvert', prixBase: 60, stock: 800,
      description: "PNL de retour sur scène après des années d'absence.",
      cats: [{ nom: 'Pelouse', prix: 60, stock: 500 }, { nom: 'Tribune', prix: 90, stock: 250 }, { nom: 'VIP', prix: 200, stock: 50 }],
    },
    {
      titre: 'Cyborg Tour', artiste: 'Nekfeu', date: '2026-10-11', heure: '20:00',
      lieu: 'Halle Tony Garnier, Lyon', statut: 'ouvert', prixBase: 45, stock: 380,
      description: 'Nekfeu présente son univers cyberpunk sur scène.',
      cats: [{ nom: 'Fosse', prix: 45, stock: 200 }, { nom: 'Assis', prix: 65, stock: 180 }],
    },
    {
      titre: 'Festival de l\'été', artiste: 'Jul', date: '2026-07-19', heure: '22:00',
      lieu: 'Vélodrome, Marseille', statut: 'ouvert', prixBase: 40, stock: 1000,
      description: 'Jul envahit le Vélodrome pour une soirée événement.',
      cats: [{ nom: 'Pelouse', prix: 40, stock: 700 }, { nom: 'Tribune', prix: 65, stock: 300 }],
    },
    {
      titre: 'Infinity Tour', artiste: 'M83', date: '2026-11-08', heure: '20:30',
      lieu: 'Olympia, Paris', statut: 'ouvert', prixBase: 55, stock: 220,
      description: "M83 et ses nappes de synthés dans la salle mythique de l'Olympia.",
      cats: [{ nom: 'Fosse', prix: 55, stock: 100 }, { nom: 'Balcon', prix: 70, stock: 120 }],
    },
    {
      titre: 'Alpha Zulu Tour', artiste: 'Phoenix', date: '2026-06-28', heure: '20:00',
      lieu: 'Zénith de Bordeaux', statut: 'ouvert', prixBase: 50, stock: 280,
      description: 'Phoenix de retour en France avec leur indie-pop solaire.',
      cats: [{ nom: 'Fosse', prix: 50, stock: 150 }, { nom: 'Assis', prix: 68, stock: 130 }],
    },
    {
      titre: '13 Tour', artiste: 'Indochine', date: '2026-12-05', heure: '20:30',
      lieu: 'Arkéa Arena, Bordeaux', statut: 'ouvert', prixBase: 60, stock: 450,
      description: 'Indochine fête les 13 ans de leur album Black City Parade.',
      cats: [{ nom: 'Fosse', prix: 60, stock: 200 }, { nom: 'Assis', prix: 80, stock: 200 }, { nom: 'Carré Or', prix: 130, stock: 50 }],
    },
    {
      titre: 'Classico Organisé', artiste: 'IAM', date: '2026-09-26', heure: '21:00',
      lieu: 'Dôme, Marseille', statut: 'ouvert', prixBase: 50, stock: 350,
      description: 'Les légendes du rap marseillais sur scène pour une nuit historique.',
      cats: [{ nom: 'Fosse', prix: 50, stock: 200 }, { nom: 'Assis', prix: 70, stock: 150 }],
    },
    {
      titre: 'Tengo Le Seum Tour', artiste: 'Soprano', date: '2026-08-01', heure: '20:00',
      lieu: 'Zénith de Toulouse', statut: 'ouvert', prixBase: 45, stock: 310,
      description: 'Soprano en tournée avec ses plus grands hits.',
      cats: [{ nom: 'Fosse', prix: 45, stock: 160 }, { nom: 'Assis', prix: 62, stock: 150 }],
    },
    {
      titre: 'Idylles Tour', artiste: 'Vianney', date: '2026-10-24', heure: '20:30',
      lieu: 'Zénith de Nantes', statut: 'ouvert', prixBase: 42, stock: 260,
      description: 'Vianney en tournée acoustique avec son quatrième album.',
      cats: [{ nom: 'Fosse', prix: 42, stock: 130 }, { nom: 'Assis', prix: 58, stock: 130 }],
    },
    {
      titre: 'Good Kid Tour', artiste: 'Clara Luciani', date: '2026-07-11', heure: '21:00',
      lieu: 'Olympia, Paris', statut: 'ouvert', prixBase: 48, stock: 220,
      description: 'Clara Luciani et sa pop mélancolique dans un cadre mythique.',
      cats: [{ nom: 'Fosse', prix: 48, stock: 110 }, { nom: 'Balcon', prix: 65, stock: 110 }],
    },
    {
      titre: 'Consolation Tour', artiste: 'Pomme', date: '2026-11-21', heure: '20:00',
      lieu: 'Zénith de Strasbourg', statut: 'ouvert', prixBase: 38, stock: 200,
      description: 'Pomme chante ses textes poétiques dans une ambiance feutrée.',
      cats: [{ nom: 'Fosse', prix: 38, stock: 100 }, { nom: 'Assis', prix: 52, stock: 100 }],
    },
    {
      titre: 'Effet Miroir Tour', artiste: 'Zaz', date: '2026-06-06', heure: '20:30',
      lieu: 'Halle Tony Garnier, Lyon', statut: 'ouvert', prixBase: 52, stock: 300,
      description: 'Zaz revisite ses classiques et dévoile de nouveaux titres.',
      cats: [{ nom: 'Fosse', prix: 52, stock: 150 }, { nom: 'Assis', prix: 72, stock: 150 }],
    },
    {
      titre: 'Before the Dawn Heals Us', artiste: 'M83', date: '2026-05-30', heure: '21:00',
      lieu: 'Bataclan, Paris', statut: 'ouvert', prixBase: 45, stock: 160,
      description: "Une soirée spéciale dédiée à l'album culte de M83.",
      cats: [{ nom: 'Fosse', prix: 45, stock: 160 }],
    },
    {
      titre: 'Beats in Space', artiste: 'Laurent Garnier', date: '2026-10-03', heure: '23:00',
      lieu: 'Rex Club, Paris', statut: 'ouvert', prixBase: 25, stock: 400,
      description: 'Une nuit techno avec le maître Laurent Garnier.',
      cats: [{ nom: 'Entrée', prix: 25, stock: 400 }],
    },
    {
      titre: 'We Are The Night', artiste: 'The Chemical Brothers', date: '2026-08-15', heure: '22:00',
      lieu: 'Accor Arena, Paris', statut: 'ouvert', prixBase: 70, stock: 500,
      description: 'Les Chemical Brothers enflamment Paris avec leur show électro.',
      cats: [{ nom: 'Fosse', prix: 70, stock: 250 }, { nom: 'Assis', prix: 95, stock: 200 }, { nom: 'VIP', prix: 180, stock: 50 }],
    },
    {
      titre: 'Mezzanine Tour', artiste: 'Massive Attack', date: '2026-09-13', heure: '21:00',
      lieu: 'Zénith de Lille', statut: 'ouvert', prixBase: 65, stock: 280,
      description: 'Massive Attack fête les 25 ans de Mezzanine sur scène.',
      cats: [{ nom: 'Fosse', prix: 65, stock: 130 }, { nom: 'Assis', prix: 88, stock: 150 }],
    },
    {
      titre: 'Moon Safari Live', artiste: 'Air', date: '2026-07-25', heure: '20:30',
      lieu: 'Grand Rex, Paris', statut: 'ouvert', prixBase: 58, stock: 180,
      description: 'Air interprète Moon Safari en intégralité pour ses 30 ans.',
      cats: [{ nom: 'Fosse', prix: 58, stock: 90 }, { nom: 'Balcon', prix: 75, stock: 90 }],
    },
    {
      titre: 'Autoportrait', artiste: 'Moderat', date: '2026-11-14', heure: '21:00',
      lieu: 'Zénith de Paris', statut: 'ouvert', prixBase: 55, stock: 300,
      description: 'Moderat de retour pour un concert électronique hors du commun.',
      cats: [{ nom: 'Fosse', prix: 55, stock: 180 }, { nom: 'Assis', prix: 72, stock: 120 }],
    },
    {
      titre: 'Fortitude Tour', artiste: 'Gojira', date: '2026-10-17', heure: '20:00',
      lieu: 'Zénith de Bordeaux', statut: 'ouvert', prixBase: 48, stock: 260,
      description: 'Gojira écrase la scène avec leur metal prog dévastateur.',
      cats: [{ nom: 'Fosse', prix: 48, stock: 150 }, { nom: 'Assis', prix: 65, stock: 110 }],
    },
    {
      titre: 'Hommage à Jacques Brel', artiste: 'Grand Corps Malade', date: '2026-06-20', heure: '20:30',
      lieu: 'Théâtre du Châtelet, Paris', statut: 'ouvert', prixBase: 45, stock: 180,
      description: 'Grand Corps Malade rend hommage à la poésie de Jacques Brel.',
      cats: [{ nom: 'Parterre', prix: 45, stock: 100 }, { nom: 'Balcon', prix: 60, stock: 80 }],
    },
    {
      titre: 'Nuit Électro Sauvage', artiste: 'Kavinsky', date: '2026-08-29', heure: '23:30',
      lieu: 'Warehouse, Lyon', statut: 'ouvert', prixBase: 20, stock: 500,
      description: 'Kavinsky ressort les synthés rétro pour une nuit de folie.',
      cats: [{ nom: 'Entrée', prix: 20, stock: 500 }],
    },
    {
      titre: 'De La Soul Tour', artiste: 'Vald', date: '2026-07-04', heure: '21:00',
      lieu: 'Accor Arena, Paris', statut: 'ouvert', prixBase: 52, stock: 350,
      description: 'Vald en grande forme pour sa tournée estivale.',
      cats: [{ nom: 'Fosse', prix: 52, stock: 180 }, { nom: 'Assis', prix: 72, stock: 170 }],
    },
    {
      titre: 'Trans-Siberian Express', artiste: 'Kraftwerk', date: '2026-12-28', heure: '20:00',
      lieu: 'Philharmonie de Paris', statut: 'ouvert', prixBase: 90, stock: 200,
      description: 'Kraftwerk en 3D : une expérience audiovisuelle sans pareille.',
      cats: [{ nom: 'Parterre', prix: 90, stock: 100 }, { nom: 'Balcon', prix: 120, stock: 80 }, { nom: 'VIP', prix: 200, stock: 20 }],
    },
    {
      titre: 'Nuit Blanche Festival', artiste: 'Étienne de Crécy', date: '2026-10-03', heure: '22:00',
      lieu: 'Grande Halle de la Villette, Paris', statut: 'ouvert', prixBase: 28, stock: 600,
      description: 'Étienne de Crécy mixe toute la nuit pour la Nuit Blanche.',
      cats: [{ nom: 'Entrée', prix: 28, stock: 600 }],
    },
    {
      titre: 'Tryo Acoustique', artiste: 'Tryo', date: '2026-06-13', heure: '20:30',
      lieu: 'Café de la Danse, Paris', statut: 'annulé', prixBase: 32, stock: 300,
      description: 'Concert annulé — remboursement en cours.',
      cats: [{ nom: 'Fosse', prix: 32, stock: 300 }],
    },
    {
      titre: 'Sold Out Night', artiste: 'Orelsan', date: '2026-05-10', heure: '21:00',
      lieu: 'Zénith de Paris', statut: 'complet', prixBase: 55, stock: 0,
      description: "Concert complet. Restez attentifs pour d'éventuels désistements.",
      cats: [{ nom: 'Fosse', prix: 55, stock: 0 }, { nom: 'Assis', prix: 75, stock: 0 }],
    },
    {
      titre: 'La Défense Jazz Festival', artiste: 'Youn Sun Nah', date: '2026-06-26', heure: '19:00',
      lieu: 'Parvis de La Défense, Paris', statut: 'ouvert', prixBase: 30, stock: 800,
      description: 'La voix envoûtante de Youn Sun Nah en plein air.',
      cats: [{ nom: 'Pelouse', prix: 30, stock: 600 }, { nom: 'Assis', prix: 50, stock: 200 }],
    },
    {
      titre: 'Biennale de la Danse', artiste: 'Woodkid', date: '2026-09-18', heure: '20:00',
      lieu: 'Opéra de Lyon', statut: 'ouvert', prixBase: 65, stock: 150,
      description: 'Woodkid orchestra en direct pour un spectacle grandiose.',
      cats: [{ nom: 'Parterre', prix: 65, stock: 80 }, { nom: 'Balcon', prix: 85, stock: 70 }],
    },
  ];

  const seedInitial = db.transaction(() => {
    for (const c of concertsInitiaux) {
      const res = insertConcert.run(c.titre, c.artiste, c.date, c.heure, c.lieu, c.description, c.statut, c.prixBase, c.stock);
      for (const cat of c.cats) {
        insertCat.run(res.lastInsertRowid, cat.nom, cat.prix, cat.stock, cat.stock);
      }
    }
  });
  seedInitial();
}

const app = createApp(db);
app.listen(5000, () => console.log('Serveur lancé sur http://localhost:5000'));
