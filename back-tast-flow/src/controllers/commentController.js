// src/controllers/commentController.js
const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');

// Créer un commentaire
exports.createComment = async (req, res) => {
  try {
    const { content, ticketId } = req.body;

    // Vérifier que le ticket existe
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    const comment = await Comment.create({
      content,
      ticket: ticketId,
      author: req.userId,
    });

    res.status(201).json({ message: 'Commentaire créé', comment });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Lister les commentaires d'un ticket
exports.getCommentsByTicket = async (req, res) => {
  try {
    const comments = await Comment.find({ ticket: req.params.ticketId })
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Modifier un commentaire (seul l'auteur)
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    // Seul l'auteur peut modifier
    if (!comment.author.equals(req.userId)) {
      return res.status(403).json({ message: 'Seul l\'auteur peut modifier ce commentaire' });
    }

    comment.content = content;
    await comment.save();

    res.json({ message: 'Commentaire mis à jour', comment });
  } catch (error) {
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
      return res.status(403).json({ message: 'Seul l\'auteur peut supprimer ce commentaire' });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Commentaire supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

