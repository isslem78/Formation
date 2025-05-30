const express = require('express');
const router = express.Router();


// 📊 Obtenir les statistiques
router.get('/stats', (req, res) => {
  Student.getStats((err, stats) => {
    if (err) return res.status(500).json({ error: 'Erreur stats' });
    res.json(stats);
  });
});

// 📋 Obtenir tous les étudiants
router.get('/users', (req, res) => {
  Student.getAll((err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur chargement étudiants' });
    res.json(results);
  });
});

// POST /ajouter-etudiant
router.post('/ajouter-etudiant', (req, res) => {
  const { nom, prenom, code, department } = req.body;

  // Vérification des champs requis
  if (!nom || !prenom || !code || !department) {
    return res.status(400).send('Tous les champs sont requis.');
  }

  const sql = 'INSERT INTO etudiants (nom, prenom, code, department) VALUES (?, ?, ?, ?)';
  connection.query(sql, [nom, prenom, code, department], (err, result) => {
    if (err) {
      console.error('Erreur MySQL :', err);
      return res.status(500).send(`Erreur lors de l\'ajout de l\'étudiant : ${err.sqlMessage}`);
    }

    console.log('Étudiant ajouté avec succès :', result);
    res.redirect('/admin_home?message=Etudiant ajouté avec succès');
  });
});


// 🗑 Supprimer un étudiant
router.delete('/students/:id', (req, res) => {
  Student.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur suppression' });
    res.json({ message: 'Étudiant supprimé' });
  });
});

// 🔄 Activer/désactiver un étudiant
router.put('/students/:id/activate', (req, res) => {
  const { active } = req.body;
  Student.toggleActive(req.params.id, active, (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur activation' });
    res.json({ message: 'Statut mis à jour' });
  });
});

module.exports = router;
