// src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const authMiddleware = (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant ou invalide' });
    }

    // Extraire le token (format: "Bearer <token>")
    const token = authHeader.split(' ')[1];

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Ajouter l'ID utilisateur à la requête
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré' });
    }
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = authMiddleware;
