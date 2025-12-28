// src/routes/tickets.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middlewares/auth');

// Toutes les routes tickets sont protégées
router.use(authMiddleware);

// POST /api/tickets - Créer un ticket
router.post('/', ticketController.createTicket);

// GET /api/tickets/project/:projectId - Lister les tickets d'un projet
router.get('/project/:projectId', ticketController.getTicketsByProject);

// GET /api/tickets/:id - Obtenir un ticket par ID
router.get('/:id', ticketController.getTicketById);

// PUT /api/tickets/:id - Modifier un ticket
router.put('/:id', ticketController.updateTicket);

// DELETE /api/tickets/:id - Supprimer un ticket
router.delete('/:id', ticketController.deleteTicket);

// POST /api/tickets/:id/assign - Assigner un utilisateur à un ticket
router.post('/:id/assign', ticketController.assignUserToTicket);

// DELETE /api/tickets/:id/assign/:userId - Retirer l'assignation d'un utilisateur
router.delete('/:id/assign/:userId', ticketController.unassignUserFromTicket);

// PUT /api/tickets/:id/assign - Assigner plusieurs utilisateurs (remplacer tous)
//router.put('/:id/assign', ticketController.assignUsersToTicket);

module.exports = router;
