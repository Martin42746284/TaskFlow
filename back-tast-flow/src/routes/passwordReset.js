// backend/src/routes/passwordReset.js
const express = require('express');
const router = express.Router();
const {
  forgotPassword,
  resetPassword,
} = require('../controllers/passwordResetController');

// POST /api/password/forgot - Demander une réinitialisation
router.post('/forgot', forgotPassword);

// POST /api/password/reset/:token - Réinitialiser le mot de passe
router.post('/reset/:token', resetPassword);

module.exports = router;