const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');   // Authentification
const adminRoutes = require('./routes/adminRoutes'); // Admin
const connection = require('./db'); // Connexion base de données

const app = express();

// 🔐 Sessions
app.use(session({
  secret: 'votre_clé_secrète_unique',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// 📦 Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// 🌐 Fichiers statiques
app.use(express.static(path.join(__dirname, '../frontend')));

// 📄 Pages publiques
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/formations', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/formations.html'));
});

// 📄 Page par domaine
app.get('/formations/:domaine/page', (req, res) => {
  const domaine = req.params.domaine.toLowerCase();
  const domainesDispo = ['informatique', 'mecanique', 'electrique', 'civil'];

  if (!domainesDispo.includes(domaine)) {
    return res.status(404).send('❌ Domaine non trouvé');
  }

  res.sendFile(path.join(__dirname, `../frontend/formation-detail/${domaine}.html`));
});

// 📊 API - Liste des formations par domaine
app.get('/api/formations/:domaine', (req, res) => {
  const domaine = req.params.domaine.toLowerCase();
  const domainesDispo = ['informatique', 'mecanique', 'electrique', 'civil'];

  if (!domainesDispo.includes(domaine)) {
    return res.status(404).json({ error: 'Domaine non trouvé' });
  }

  const sql = `
    SELECT f.id, f.titre, f.description, f.duree, f.prix
    FROM formations f
    JOIN domaines d ON f.domaine_id = d.id
    WHERE d.nom = ?
  `;
  connection.query(sql, [domaine], (err, results) => {
    if (err) {
      console.error('Erreur récupération formations:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(results);
  });
});

// 📝 API - Inscription à une formation
app.post('/inscriptions', (req, res) => {
  const { formation_id, nom, email, telephone } = req.body;

  if (!formation_id || !nom || !email || !telephone) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
  }

  const date_inscription = new Date();

  const sql = `
    INSERT INTO inscriptions (formation_id, nom, email, telephone, date_inscription)
    VALUES (?, ?, ?, ?, ?)
  `;
  connection.query(sql, [formation_id, nom, email, telephone, date_inscription], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'insertion:', err);
      return res.status(500).json({ error: 'Erreur serveur lors de l\'inscription.' });
    }
    res.json({ message: 'Inscription réussie !' });
  });
});

// 🔐 Middleware admin
function isAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Vous devez être connecté' });
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé : administrateur uniquement' });
  }
  next();
}

// 📄 Page admin (HTML)
app.get('/admin', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// 🔑 Routes auth
app.use('/', authRoutes);

// 🚨 Routes API admin
app.use('/api/admin', isAdmin, adminRoutes);

// 🚀 Lancer le serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
