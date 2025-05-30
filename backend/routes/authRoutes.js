const express = require('express');
const router = express.Router();
const path = require('path');
const connection = require('../db'); // Connexion à la base de données

// 📄 Page de connexion
router.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/signin.html'));
});

// 📄 Page d'inscription
router.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/signup.html'));
});

// 🏠 Page d’accueil (protégée)
router.get('/acceuil', (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  res.sendFile(path.join(__dirname, '../../frontend/acceuil.html'));
});

// 🔐 Page admin
router.get('/admin', (req, res) => {
  if (!req.session.user) return res.redirect('/signin');

  // Vérifie le rôle
  if (req.session.user.role !== 'admin') {
    return res.status(403).send('Accès refusé - Vous n\'êtes pas administrateur.');
  }

  res.sendFile(path.join(__dirname, '../../frontend/admin.html'));
});

// ✅ Inscription
router.post('/signup', (req, res) => {
  const { nom, prenom, email, password, department } = req.body;

  const checkEmail = 'SELECT * FROM users WHERE email = ?';
  connection.query(checkEmail, [email], (err, results) => {
    if (err || results.length > 0) {
      return res.redirect('/signup?error=Email déjà utilisé ou erreur.');
    }

    const insertUser = `
      INSERT INTO users (nom, prenom, email, password, department, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    // Donne automatiquement le rôle "admin" si c’est cet email précis
    const role = email === 'salahisslem22@gmail.com' ? 'admin' : 'user';

    connection.query(insertUser, [nom, prenom, email, password, department, role], (err) => {
      if (err) return res.redirect('/signup?error=Erreur lors de l\'inscription');
      res.redirect('/signin?message=Inscription réussie');
    });
  });
});

// 🔓 Connexion
router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

  connection.query(query, [email, password], (err, results) => {
    if (err || results.length === 0) {
      return res.send('<script>alert("Email ou mot de passe incorrect"); window.location.href="/signin";</script>');
    }

    // Stocke toutes les infos utiles dans la session
    req.session.user = {
      id: results[0].id,
      nom: results[0].nom,
      prenom: results[0].prenom,
      email: results[0].email,
      department: results[0].department,
      role: results[0].role
    };

    // Redirection selon le rôle
    if (results[0].role === 'admin') {
      return res.redirect('/admin');
    }

    res.redirect('/acceuil');
  });
});

// 👤 Page profil
router.get('/profil', (req, res) => {
  if (!req.session.user) return res.redirect('/signin');

  const user = req.session.user;

  const html = `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>Profil Étudiant</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-gray-100 p-8">
    <div class="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h1 class="text-2xl font-bold text-blue-700 mb-4">👤 Mon Profil</h1>
      <form action="/profil" method="POST" class="space-y-4">
        <div>
          <label class="block font-medium">Nom :</label>
          <input type="text" name="nom" value="${user.nom}" class="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block font-medium">Prénom :</label>
          <input type="text" name="prenom" value="${user.prenom}" class="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block font-medium">Email :</label>
          <input type="email" name="email" value="${user.email}" class="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block font-medium">Département :</label>
          <input type="text" name="department" value="${user.department || ''}" class="w-full border border-gray-300 rounded px-3 py-2" />
        </div>
        <div class="flex justify-between items-center mt-6">
          <a href="/acceuil" class="text-blue-600 hover:underline">⬅ Retour</a>
          <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">💾 Enregistrer</button>
        </div>
      </form>
    </div>
  </body>
  </html>
  `;

  res.send(html);
});

// 🔄 Mise à jour profil
router.post('/profil', (req, res) => {
  if (!req.session.user) return res.redirect('/signin');

  const { nom, prenom, email, department } = req.body;
  const userId = req.session.user.id;

  const sql = 'UPDATE users SET nom = ?, prenom = ?, email = ?, department = ? WHERE id = ?';
  connection.query(sql, [nom, prenom, email, department, userId], (err) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du profil :', err);
      return res.status(500).send('Erreur lors de la mise à jour.');
    }

    req.session.user.nom = nom;
    req.session.user.prenom = prenom;
    req.session.user.email = email;
    req.session.user.department = department;

    res.redirect('/profil');
  });
});

// 📚 Page cours
router.get('/cours', (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  res.sendFile(path.join(__dirname, '../../frontend/cours.html'));
});

module.exports = router;
