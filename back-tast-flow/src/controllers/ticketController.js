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

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('project', 'name');

    res.status(201).json({ message: 'Ticket créé', ticket: populatedTicket });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Lister les tickets d'un projet
exports.getTicketsByProject = async (req, res) => {
  try {
    const tickets = await Ticket.find({ project: req.params.projectId })
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('project', 'name');

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Obtenir un ticket par ID
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar')
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
    const { title, description, status, estimationDate } = req.body;

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

    // Mettre à jour seulement les champs fournis
    if (title !== undefined) ticket.title = title;
    if (description !== undefined) ticket.description = description;
    if (status !== undefined) ticket.status = status;
    if (estimationDate !== undefined) ticket.estimationDate = estimationDate;

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('project', 'name');

    res.json({ message: 'Ticket mis à jour', ticket: updatedTicket });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer un ticket (seul le créateur ou owner/admin du projet)
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    const project = await Project.findById(ticket.project);
    
    // Seul le créateur, le owner ou un admin peut supprimer
    const canDelete = ticket.createdBy.equals(req.userId) ||
      project.owner.equals(req.userId) ||
      project.admins.includes(req.userId);

    if (!canDelete) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    await Ticket.findByIdAndDelete(req.params.id);

    res.json({ message: 'Ticket supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Assigner un utilisateur à un ticket
exports.assignUserToTicket = async (req, res) => {
  try {
    const { userId } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    // Charger le projet avec tous les champs populés
    const project = await Project.findById(ticket.project)
      .populate('owner', '_id firstName lastName email')
      .populate('admins', '_id firstName lastName email')
      .populate('team', '_id firstName lastName email');

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Vérifier que l'utilisateur demandeur est membre du projet
    const isRequesterMember = 
      project.owner._id.toString() === req.userId.toString() ||
      project.admins.some(admin => admin._id.toString() === req.userId.toString()) ||
      project.team.some(member => member._id.toString() === req.userId.toString());

    if (!isRequesterMember) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Vérifier que l'utilisateur à assigner est membre du projet
    const isOwner = project.owner._id.toString() === userId.toString();
    const isAdmin = project.admins.some(admin => admin._id.toString() === userId.toString());
    const isTeamMember = project.team.some(member => member._id.toString() === userId.toString());
    const isUserMember = isOwner || isAdmin || isTeamMember;

    if (!isUserMember) {
      return res.status(400).json({ message: 'L\'utilisateur n\'est pas membre du projet' });
    }

    // Vérifier si l'utilisateur n'est pas déjà assigné
    if (ticket.assignedTo.some(id => id.toString() === userId.toString())) {
      return res.status(400).json({ message: 'Utilisateur déjà assigné à ce ticket' });
    }

    // Ajouter l'assignation
    ticket.assignedTo.push(userId);
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('project', 'name');

    res.json({ ticket: updatedTicket, message: 'Utilisateur assigné avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'assignation:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Retirer l'assignation d'un utilisateur
exports.unassignUserFromTicket = async (req, res) => {
  try {
    const { userId } = req.params;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    // Vérifier que l'utilisateur est membre du projet
    const project = await Project.findById(ticket.project);
    const isMember = project.owner.equals(req.userId) ||
      project.admins.some(admin => admin.equals(req.userId)) ||
      project.team.some(member => member.equals(req.userId));

    if (!isMember) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Retirer l'assignation
    ticket.assignedTo = ticket.assignedTo.filter(id => !id.equals(userId));
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('project', 'name');

    res.json({ ticket: updatedTicket, message: 'Assignation retirée avec succès' });
  } catch (error) {
    console.error('Erreur lors du retrait d\'assignation:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
