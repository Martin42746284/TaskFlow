// src/controllers/projectController.js
const Project = require('../models/Project');

// Créer un projet
exports.createProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const project = await Project.create({
      name,
      description,
      status,
      owner: req.userId, // L'utilisateur connecté devient propriétaire
    });

    res.status(201).json({ message: 'Projet créé', project });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Lister les projets de l'utilisateur
exports.getProjects = async (req, res) => {
  try {
    // Projets où l'utilisateur est owner, admin ou dans l'équipe
    const projects = await Project.find({
      $or: [
        { owner: req.userId },
        { admins: req.userId },
        { team: req.userId },
      ],
    }).populate('owner admins team', 'firstName lastName email avatar');

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Obtenir un projet par ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner admins team', 'firstName lastName email avatar');

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Modifier un projet
exports.updateProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Seul le propriétaire ou un admin peut modifier
    if (!project.owner.equals(req.userId) && !project.admins.includes(req.userId)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    project.name = name || project.name;
    project.description = description || project.description;
    project.status = status || project.status;

    await project.save();

    res.json({ message: 'Projet mis à jour', project });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer un projet (seul le créateur)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Seul le propriétaire peut supprimer
    if (!project.owner.equals(req.userId)) {
      return res.status(403).json({ message: 'Seul le créateur peut supprimer ce projet' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Projet supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Ajouter des membres (admin ou équipe)
exports.addMembers = async (req, res) => {
  try {
    const { admins, team } = req.body; // arrays d'emails utilisateurs
    const User = require('../models/User');

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Seul le propriétaire ou un admin peut ajouter des membres
    if (!project.owner.equals(req.userId) && !project.admins.includes(req.userId)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Fonction pour convertir les emails en IDs utilisateur
    const convertEmailsToUserIds = async (emails) => {
      if (!emails || !Array.isArray(emails)) return [];

      const userIds = [];
      const notFoundEmails = [];

      for (const email of emails) {
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (user) {
          userIds.push(user._id);
        } else {
          notFoundEmails.push(email);
        }
      }

      return { userIds, notFoundEmails };
    };

    let notFoundEmails = [];
    let adminUserIds = [];
    let teamUserIds = [];

    if (admins && Array.isArray(admins)) {
      const result = await convertEmailsToUserIds(admins);
      adminUserIds = result.userIds;
      notFoundEmails = notFoundEmails.concat(result.notFoundEmails);
    }

    if (team && Array.isArray(team)) {
      const result = await convertEmailsToUserIds(team);
      teamUserIds = result.userIds;
      notFoundEmails = notFoundEmails.concat(result.notFoundEmails);
    }

    // Si certains emails n'ont pas été trouvés, retourner une erreur avec les détails
    if (notFoundEmails.length > 0) {
      return res.status(404).json({
        message: `Utilisateur(s) non trouvé(s): ${notFoundEmails.join(', ')}`,
        notFoundEmails
      });
    }

    // Ajouter les IDs uniques aux listes du projet
    if (adminUserIds.length > 0) {
      const adminIdStrings = adminUserIds.map(id => id.toString());
      project.admins = [...new Set([...project.admins.map(id => id.toString()), ...adminIdStrings])];
    }

    if (teamUserIds.length > 0) {
      const teamIdStrings = teamUserIds.map(id => id.toString());
      project.team = [...new Set([...project.team.map(id => id.toString()), ...teamIdStrings])];
    }

    await project.save();

    // Recharger et populer pour retourner les données complètes
    const updatedProject = await project.populate('owner admins team', 'firstName lastName email avatar');

    res.json({ message: 'Membres ajoutés', project: updatedProject });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Retirer des membres (admin ou équipe)
exports.removeMembers = async (req, res) => {
  try {
    const { admins, team } = req.body; // arrays d'IDs utilisateurs

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Seul le propriétaire ou un admin peut retirer des membres
    if (!project.owner.equals(req.userId) && !project.admins.includes(req.userId)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    if (admins) {
      project.admins = project.admins.filter(
        (adminId) => !admins.includes(adminId.toString())
      );
    }

    if (team) {
      project.team = project.team.filter(
        (teamId) => !team.includes(teamId.toString())
      );
    }

    await project.save();

    res.json({ message: 'Membres retirés', project });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Obtenir les membres d'un projet
exports.getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner admins team', 'firstName lastName email avatar');

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    res.json({
      owner: project.owner,
      admins: project.admins,
      team: project.team,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
