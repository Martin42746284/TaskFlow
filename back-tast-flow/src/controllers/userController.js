// src/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

// ===== Gestion du profil de l'utilisateur connecté =====

// Obtenir le profil utilisateur
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Modifier le profil utilisateur
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, email } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    // Mettre à jour les champs
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');
    res.json({ message: 'Profil mis à jour', user: updatedUser });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Changer le mot de passe
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Supprimer l'ancien avatar s'il existe
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const oldAvatarPath = path.join(__dirname, '../../public', user.avatar);
      try {
        await fs.unlink(oldAvatarPath);
        console.log('Ancien avatar supprimé:', oldAvatarPath);
      } catch (error) {
        console.log('Ancien avatar non trouvé ou déjà supprimé');
      }
    }

    // Enregistrer le nouveau chemin de l'avatar
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');
    res.json({ message: 'Avatar mis à jour', user: updatedUser });
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'avatar:', error);
    
    // Supprimer le fichier uploadé en cas d'erreur
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Erreur lors de la suppression du fichier:', unlinkError);
      }
    }
    
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer avatar
exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Supprimer le fichier avatar
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const avatarPath = path.join(__dirname, '../../public', user.avatar);
      try {
        await fs.unlink(avatarPath);
        console.log('Avatar supprimé:', avatarPath);
      } catch (error) {
        console.log('Avatar non trouvé ou déjà supprimé');
      }
    }

    user.avatar = undefined;
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');
    res.json({ message: 'Avatar supprimé', user: updatedUser });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avatar:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer le compte utilisateur
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Supprimer l'avatar s'il existe
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const avatarPath = path.join(__dirname, '../../public', user.avatar);
      try {
        await fs.unlink(avatarPath);
        console.log('Avatar supprimé lors de la suppression du compte');
      } catch (error) {
        console.log('Avatar non trouvé');
      }
    }

    await User.findByIdAndDelete(req.userId);
    res.json({ message: 'Compte utilisateur supprimé' });
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ===== Gestion des utilisateurs (recherche, etc.) =====

// Rechercher des utilisateurs par nom, prénom ou email
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'La recherche doit contenir au moins 2 caractères' });
    }

    const searchRegex = new RegExp(q.trim(), 'i');

    const users = await User.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ],
    })
      .select('_id firstName lastName email avatar')
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la recherche d\'utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Obtenir un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ===== Gestion des utilisateurs (admin uniquement) =====

// Obtenir la liste de tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Mettre à jour un utilisateur par ID (admin uniquement)
exports.updateUserById = async (req, res) => {
  try {
    const { firstName, lastName, phone, email } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    // Mettre à jour les champs
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');
    res.json({ message: 'Utilisateur mis à jour', user: updatedUser });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer un utilisateur par ID (admin uniquement)
exports.deleteUserById = async (req, res) => {
  try {
    // Empêcher un utilisateur de se supprimer lui-même
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte via cette route' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Supprimer l'avatar s'il existe
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const avatarPath = path.join(__dirname, '../../public', user.avatar);
      try {
        await fs.unlink(avatarPath);
        console.log('Avatar supprimé lors de la suppression de l\'utilisateur');
      } catch (error) {
        console.log('Avatar non trouvé');
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};