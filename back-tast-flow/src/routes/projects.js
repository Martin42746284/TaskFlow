// src/routes/projects.js
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middlewares/auth');

// Toutes les routes projets sont protégées
router.use(authMiddleware);

// POST /api/projects - Créer un projet
router.post('/', projectController.createProject);

// GET /api/projects - Lister les projets de l'utilisateur
router.get('/', projectController.getProjects);

// GET /api/projects/:id - Obtenir un projet par ID
router.get('/:id', projectController.getProjectById);

// PUT /api/projects/:id - Modifier un projet
router.put('/:id', projectController.updateProject);

// DELETE /api/projects/:id - Supprimer un projet (seul le créateur)
router.delete('/:id', projectController.deleteProject);

// POST /api/projects/:id/members - Ajouter des membres (admins/équipe)
router.post('/:id/members', projectController.addMembers);

// DELETE /api/projects/:id/members - Retirer des membres (admins/équipe)
router.delete('/:id/members', projectController.removeMembers);


module.exports = router;
