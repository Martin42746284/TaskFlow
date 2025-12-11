// src/controllers/commentController.js
const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');
const Project = require('../models/Project');

// Créer un commentaire
exports.createComment = async (req, res) => {
  try {
    const { content, ticketId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Le contenu est requis' });
    }

    const ticket = await Ticket.findById(ticketId).populate('project');
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    const project = await Project.findById(ticket.project._id);
    const isMember = project.owner.equals(req.userId) ||
      project.admins.includes(req.userId) ||
      project.team.includes(req.userId);

    if (!isMember) {
      return res.status(403).json({ message: 'Vous devez être membre du projet pour commenter' });
    }

    const comment = await Comment.create({
      content: content.trim(),
      ticket: ticketId,
      author: req.userId,
    });

    // Populate avec _id explicite
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', '_id firstName lastName email avatar')
      .populate('ticket');

    res.status(201).json({ 
      message: 'Commentaire créé', 
      comment: populatedComment 
    });
  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Lister les commentaires d'un ticket
exports.getCommentsByTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    const comments = await Comment.find({ ticket: ticketId })
      .populate('author', '_id firstName lastName email avatar')
      .populate('ticket', 'title')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Obtenir un commentaire par ID
exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('author', 'firstName lastName email avatar')
      .populate('ticket', 'title');

    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    res.json(comment);
  } catch (error) {
    console.error('Erreur lors de la récupération du commentaire:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Modifier un commentaire (seul l'auteur)
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    // Validation du contenu
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Le contenu est requis' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    // Seul l'auteur peut modifier
    if (!comment.author.equals(req.userId)) {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à modifier ce commentaire' 
      });
    }

    // Mettre à jour le contenu
    comment.content = content.trim();
    await comment.save();

    // Retourner le commentaire avec les données populées
    const updatedComment = await Comment.findById(comment._id)
      .populate('author', 'firstName lastName email avatar')
      .populate('ticket', 'title');

    res.json({ 
      message: 'Commentaire mis à jour', 
      comment: updatedComment 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du commentaire:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer un commentaire (seul l'auteur)
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    // Seul l'auteur peut supprimer
    if (!comment.author.equals(req.userId)) {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à supprimer ce commentaire' 
      });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Commentaire supprimé' });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Compter les commentaires d'un ticket
exports.countCommentsByTicket = async (req, res) => {
  try {
    const count = await Comment.countDocuments({ ticket: req.params.ticketId });
    res.json({ count });
  } catch (error) {
    console.error('Erreur lors du comptage des commentaires:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
