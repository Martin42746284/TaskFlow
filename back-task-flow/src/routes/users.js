// src/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');
const upload = require('../config/upload');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Routes du profil
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.changePassword);

// Routes avatar
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);
router.delete('/avatar', userController.deleteAvatar);

// Routes recherche
router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserById);

module.exports = router;