const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes'); // Assure-toi que ce fichier existe

const app = express();

// 🔐 Configuration des sessions
app.use(session({
  secret: 'votre_clé_secrète_unique',  // Change cette clé pour plus de sécurité
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Mettre à true si tu utilises HTTPS
}));

// 📦 Middleware de parsing
app.use(bodyParser.urlencoded({ extended: false })); // Pour parser les données de formulaires
app.use(express.json()); // Pour parser les requêtes JSON

// 🌐 Fichiers statiques (pour accéder aux fichiers du frontend)
app.use(express.static(path.join(__dirname, '../frontend'))); // Dossier principal de ton frontend


// 📄 Routes pour servir les pages HTML principales
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html')); // Accès à la page d'accueil
});

app.get('/formations', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/formations.html')); // Accès à la page formations
});

// 📄 Route dynamique pour afficher les détails des formations
app.get('/formations/:domaine', (req, res) => {
  const domaine = req.params.domaine; // Récupère le paramètre de domaine dans l'URL
  const domainesDispo = ['informatique', 'mecanique', 'electrique', 'civil']; // Domaines valides

  if (domainesDispo.includes(domaine)) {
    // Si le domaine est valide, on sert la page correspondante
    res.sendFile(path.join(__dirname, `../frontend/formation-detail/${domaine}.html`));
  } else {
    // Si le domaine n'est pas trouvé, on renvoie une erreur 404
    res.status(404).send('❌ Domaine non trouvé');
  }
});


// 🔐 Routes d'authentification (à adapter selon ton fichier authRoutes.js)
app.use('/', authRoutes);

// 🚀 Lancement du serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`); // Confirmation du lancement du serveur
});
