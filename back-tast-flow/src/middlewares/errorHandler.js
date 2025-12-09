// src/middlewares/errorHandler.js
const config = require('../config/env');

// Middleware de gestion des erreurs 404 (route non trouvée)
const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware de gestion globale des erreurs
const errorHandler = (err, req, res, next) => {
  // Si le statut n'est pas défini, utiliser 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Afficher la stack trace uniquement en développement
    ...(config.env === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
