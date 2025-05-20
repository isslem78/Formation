const express = require('express');
const router = express.Router();
const path = require('path');
const connection = require('../db');

// Page de connexion
router.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/signin.html'));
});

// Page d'inscription
router.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/signup.html'));
});

// Page d’accueil (protéger par session)
router.get('/acceuil', (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  res.sendFile(path.join(__dirname, '../../frontend/acceuil.html'));
});

// Inscription
router.post('/signup', (req, res) => {
  const { nom, prenom, email, password, department } = req.body;

  const checkEmail = 'SELECT * FROM users WHERE email = ?';
  connection.query(checkEmail, [email], (err, results) => {
    if (err || results.length > 0) {
      return res.redirect('/signup?error=Email déjà utilisé ou erreur.');
    }

    const insertUser = 'INSERT INTO users (nom, prenom, email, password, department) VALUES (?, ?, ?, ?, ?)';
    connection.query(insertUser, [nom, prenom, email, password, department], (err) => {
      if (err) return res.redirect('/signup?error=Erreur lors de l\'inscription');
      res.redirect('/signin?message=Inscription réussie');
    });
  });
});

// Connexion
router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

  connection.query(query, [email, password], (err, results) => {
    if (err || results.length === 0) {
      return res.send('<script>alert("Email ou mot de passe incorrect"); window.location.href="/signin";</script>');
    }

    req.session.user = results[0]; // Stocker user dans session
    res.redirect('/acceuil');
  });
});

// Page Mon Profil
router.get('/profil', (req, res) => {
  if (!req.session.user) return res.redirect('/signin');

  const user = req.session.user;
  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Profil Étudiant</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 p-8">
      <div class="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 class="text-2xl font-bold text-blue-700 mb-4">👤 Mon Profil</h1>
        <p><strong>Nom :</strong> ${user.nom}</p>
        <p><strong>Prénom :</strong> ${user.prenom}</p>
        <p><strong>Email :</strong> ${user.email}</p>
        <p><strong>Département :</strong> ${user.department}</p>
        <a href="/acceuil" class="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">⬅ Retour</a>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

module.exports = router;
