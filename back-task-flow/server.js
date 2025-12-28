// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const connectDB = require('./src/config/database');
const config = require('./src/config/env');
const routes = require('./src/routes');
const { notFound, errorHandler } = require('./src/middlewares/errorHandler');

// Créer l'application Express
const app = express();

// Connexion à la base de données
connectDB();

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'public/uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Dossier uploads/avatars créé');
}

// Middlewares de sécurité et logging
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(morgan('dev'));

// ⚠️ IMPORTANT : Servir les fichiers statiques AVANT les autres routes
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
console.log('📂 Fichiers statiques servis depuis /uploads');

// Middlewares pour parser le body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de test racine
app.get('/', (req, res) => {
  res.json({
    message: 'API de gestion de tickets',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      projects: '/api/projects',
      tickets: '/api/tickets',
      comments: '/api/comments',
      uploads: '/uploads'
    }
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
  console.log('='.repeat(50));
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 Environnement: ${config.env}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`📚 API Health: http://localhost:${PORT}/api/health`);
  console.log(`📂 Uploads: http://localhost:${PORT}/uploads`);
  console.log('='.repeat(50));
});

// Gestion des erreurs non gérées
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée (Promise):', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Erreur non capturée (Exception):', err.message);
  console.error(err.stack);
  process.exit(1);
});

module.exports = app;