// src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateSignup, validateSignin } = require('../middlewares/validation');

// POST /api/auth/signup - Inscription avec validation
router.post('/signup', validateSignup, authController.signup);

// POST /api/auth/signin - Connexion avec validation
router.post('/signin', validateSignin, authController.signin);

// POST /api/auth/signout - Déconnexion
router.post('/signout', authController.signout);

module.exports = router;
