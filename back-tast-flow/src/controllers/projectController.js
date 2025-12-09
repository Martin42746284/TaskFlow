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
    }).populate('owner admins team', 'firstName lastName email');

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Obtenir un projet par ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner admins team', 'firstName lastName email');

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
    const { admins, team } = req.body; // arrays d'IDs utilisateurs

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Seul le propriétaire ou un admin peut ajouter des membres
    if (!project.owner.equals(req.userId) && !project.admins.includes(req.userId)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    if (admins) {
      project.admins = [...new Set([...project.admins, ...admins])];
    }

    if (team) {
      project.team = [...new Set([...project.team, ...team])];
    }

    await project.save();

    res.json({ message: 'Membres ajoutés', project });
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
      .populate('owner admins team', 'firstName lastName email');

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

