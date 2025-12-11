// backend/src/controllers/passwordResetController.js
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../config/email');

// Demander une réinitialisation de mot de passe
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email',
      });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      return res.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      });
    }

    // Générer le token de réinitialisation
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Envoyer l'email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
      
      res.json({
        success: true,
        message: 'Un email de réinitialisation a été envoyé',
      });
    } catch (error) {
      // Annuler le token si l'email n'a pas pu être envoyé
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Réinitialiser le mot de passe
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères',
      });
    }

    // Hasher le token reçu pour le comparer
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Trouver l'utilisateur avec un token valide
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré',
      });
    }

    // Mettre à jour le mot de passe
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
};