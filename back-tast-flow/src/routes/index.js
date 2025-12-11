// src/routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const projectRoutes = require('./projects');
const ticketRoutes = require('./tickets');
const commentRoutes = require('./comments');

// Monter toutes les routes sous /api
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/tickets', ticketRoutes);
router.use('/comments', commentRoutes);

// Route de test
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

module.exports = router;
