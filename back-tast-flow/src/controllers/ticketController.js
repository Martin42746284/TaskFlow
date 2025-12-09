// src/controllers/ticketController.js
const Ticket = require('../models/Ticket');
const Project = require('../models/Project');

// Créer un ticket
exports.createTicket = async (req, res) => {
  try {
    const { title, description, status, estimationDate, projectId, assignedTo } = req.body;

    // Vérifier que le projet existe
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Vérifier que l'utilisateur est membre du projet
    const isMember = project.owner.equals(req.userId) ||
      project.admins.includes(req.userId) ||
      project.team.includes(req.userId);

    if (!isMember) {
      return res.status(403).json({ message: 'Vous devez être membre du projet' });
    }

    const ticket = await Ticket.create({
      title,
      description,
      status,
      estimationDate,
      project: projectId,
      assignedTo: assignedTo || [],
      createdBy: req.userId,
    });

    res.status(201).json({ message: 'Ticket créé', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Lister les tickets d'un projet
exports.getTicketsByProject = async (req, res) => {
  try {
    const tickets = await Ticket.find({ project: req.params.projectId })
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Obtenir un ticket par ID
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('project', 'name');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Modifier un ticket
exports.updateTicket = async (req, res) => {
  try {
    const { title, description, status, estimationDate, assignedTo } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    // Tous les membres peuvent modifier
    const project = await Project.findById(ticket.project);
    const isMember = project.owner.equals(req.userId) ||
      project.admins.includes(req.userId) ||
      project.team.includes(req.userId);

    if (!isMember) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    ticket.title = title || ticket.title;
    ticket.description = description || ticket.description;
    ticket.status = status || ticket.status;
    ticket.estimationDate = estimationDate || ticket.estimationDate;
    if (assignedTo) ticket.assignedTo = assignedTo;

    await ticket.save();

    res.json({ message: 'Ticket mis à jour', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer un ticket (seul le créateur)
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    // Seul le créateur peut supprimer
    if (!ticket.createdBy.equals(req.userId)) {
      return res.status(403).json({ message: 'Seul le créateur peut supprimer ce ticket' });
    }

    await Ticket.findByIdAndDelete(req.params.id);

    res.json({ message: 'Ticket supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Assigner des utilisateurs à un ticket
exports.assignUsersToTicket = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    // Tous les membres peuvent assigner
    const project = await Project.findById(ticket.project);
    const isMember = project.owner.equals(req.userId) ||
      project.admins.includes(req.userId) ||
      project.team.includes(req.userId);

    if (!isMember) {
      return res.status(403).json({ message: 'Accès refusé' }); 
    }

    ticket.assignedTo = assignedTo;

    await ticket.save();

    res.json({ message: 'Utilisateurs assignés au ticket', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

