// backend/src/config/email.js
const nodemailer = require('nodemailer');
const config = require('./env');

// Configuration du transporteur (exemple avec Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

// Fonction pour envoyer un email de réinitialisation
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetURL = `${config.frontendUrl}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: `TaskFlow <${config.email.user}>`,
    to: email,
    subject: 'Réinitialisation de votre mot de passe - TaskFlow',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Réinitialisation de mot de passe</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Vous avez demandé à réinitialiser votre mot de passe TaskFlow.</p>
            <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
            <div style="text-align: center;">
              <a href="${resetURL}" class="button">Réinitialiser mon mot de passe</a>
            </div>
            <p><strong>Ce lien est valide pendant 1 heure.</strong></p>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280;">
              Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
              <a href="${resetURL}" style="color: #3b82f6;">${resetURL}</a>
            </p>
          </div>
          <div class="footer">
            <p>© 2025 TaskFlow - Application de gestion de tâches</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  
  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };