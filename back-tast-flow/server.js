// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/database');
const config = require('./src/config/env');
const routes = require('./src/routes');
const { notFound, errorHandler } = require('./src/middlewares/errorHandler');

// Créer l'application Express
const app = express();

// Connexion à la base de données
connectDB();

// Middlewares de sécurité et logging
app.use(helmet()); // Sécurise les headers HTTP
app.use(cors()); // Active CORS pour toutes les origines
app.use(morgan('dev')); // Log des requêtes HTTP

// Middlewares pour parser le body
app.use(express.json()); // Parser JSON
app.use(express.urlencoded({ extended: true })); // Parser les données URL-encoded

// Route de test racine
app.get('/', (req, res) => {
  res.json({
    message: 'API de gestion de tickets',
    version: '1.0.0',
    status: 'running',
  });
});

// Monter toutes les routes sous /api
app.use('/api', routes);

// Middlewares de gestion d'erreurs (doivent être à la fin)
app.use(notFound);
app.use(errorHandler);

// Démarrer le serveur
const PORT = config.port || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 Environnement: ${config.env}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api/health`);
});

// Gestion des erreurs non gérées
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err.message);
  process.exit(1);
});

module.exports = app;
