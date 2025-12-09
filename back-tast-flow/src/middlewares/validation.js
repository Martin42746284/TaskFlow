// src/middlewares/validation.js

// Validation pour l'inscription
const validateSignup = (req, res, next) => {
  const { firstName, lastName, phone, email, password } = req.body;

  const errors = [];

  if (!firstName || firstName.trim().length === 0) {
    errors.push('Le prénom est requis');
  }

  if (!lastName || lastName.trim().length === 0) {
    errors.push('Le nom est requis');
  }

  if (!phone || phone.trim().length === 0) {
    errors.push('Le numéro de téléphone est requis');
  }

  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Email invalide');
  }

  if (!password || password.length < 6) {
    errors.push('Le mot de passe doit contenir au moins 6 caractères');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation échouée', errors });
  }

  next();
};

// Validation pour la connexion
const validateSignin = (req, res, next) => {
  const { email, password } = req.body;

  const errors = [];

  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Email invalide');
  }

  if (!password || password.trim().length === 0) {
    errors.push('Le mot de passe est requis');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation échouée', errors });
  }

  next();
};

// Validation pour la création de projet
const validateProject = (req, res, next) => {
  const { name } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: 'Le nom du projet est requis' });
  }

  next();
};

// Validation pour la création de ticket
const validateTicket = (req, res, next) => {
  const { title, estimationDate, projectId } = req.body;

  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('Le titre du ticket est requis');
  }

  if (!estimationDate) {
    errors.push('La date d\'estimation est requise');
  }

  if (!projectId) {
    errors.push('L\'ID du projet est requis');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation échouée', errors });
  }

  next();
};

// Validation pour la création de commentaire
const validateComment = (req, res, next) => {
  const { content, ticketId } = req.body;

  const errors = [];

  if (!content || content.trim().length === 0) {
    errors.push('Le contenu du commentaire est requis');
  }

  if (!ticketId) {
    errors.push('L\'ID du ticket est requis');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation échouée', errors });
  }

  next();
};

module.exports = {
  validateSignup,
  validateSignin,
  validateProject,
  validateTicket,
  validateComment,
};
