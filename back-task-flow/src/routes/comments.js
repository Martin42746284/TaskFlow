// src/routes/comments.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/auth');

// Toutes les routes commentaires sont protégées
router.use(authMiddleware);

// POST /api/comments - Créer un commentaire
router.post('/', commentController.createComment);

// GET /api/comments/ticket/:ticketId - Lister les commentaires d'un ticket
router.get('/ticket/:ticketId', commentController.getCommentsByTicket);

// GET /api/comments/ticket/:ticketId/count - Compter les commentaires d'un ticket
router.get('/ticket/:ticketId/count', commentController.countCommentsByTicket);

// GET /api/comments/:id - Obtenir un commentaire par ID
router.get('/:id', commentController.getCommentById);

// PUT /api/comments/:id - Modifier un commentaire (seul l'auteur)
router.put('/:id', commentController.updateComment);

// DELETE /api/comments/:id - Supprimer un commentaire (seul l'auteur)
router.delete('/:id', commentController.deleteComment);

module.exports = router;
