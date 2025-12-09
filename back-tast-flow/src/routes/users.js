// src/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');

// GET /api/users/profile - Obtenir le profil (protégé)
router.get('/profile', authMiddleware, userController.getProfile);

// PUT /api/users/profile - Modifier le profil (protégé)
router.put('/profile', authMiddleware, userController.updateProfile);

// DELETE /api/users/delete - Supprimer le compte (protégé)
router.delete('/delete', authMiddleware, userController.deleteAccount);

// GET /api/users/ - Obtenir tous les utilisateurs (admin uniquement, protégé)
router.get('/', authMiddleware, userController.getAllUsers);

module.exports = router;
