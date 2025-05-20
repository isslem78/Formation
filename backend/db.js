const mysql = require('mysql2');

// Connexion à la base de données MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',         // Remplace si tu utilises un autre utilisateur MySQL
  password: '',         // Mets ton mot de passe MySQL ici s'il y en a un
  database: 'auth_db'   // ✅ Ton nom de base de données
});

connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
    return;
  }
  console.log('Connexion à la base de données réussie');
});

module.exports = connection;
