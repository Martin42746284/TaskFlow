// src/utils/api.tsx
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Types pour les données
export interface User {
  _id?: string;
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: 'Actif' | 'Inactif' | 'Archivé';
  owner: string | User;
  admins: string[] | User[];
  team: string[] | User[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Ticket {
  _id: string;
  title: string;
  description?: string;
  status: 'A faire' | 'En cours' | 'En validation' | 'Terminé';
  estimationDate: string;
  project: string | Project;
  assignedTo: string[] | User[];
  createdBy: string | User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  _id: string;
  content: string;
  ticket: string | Ticket;
  author: string | User;
  createdAt?: string;
  updatedAt?: string;
}

// Configuration des URLs
const getBaseUrls = () => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  return {
    API_URL: `${envUrl}/api`,  // Pour les appels API : http://localhost:4000/api
    STATIC_URL: envUrl,         // Pour les fichiers statiques : http://localhost:4000
  };
};

const { API_URL, STATIC_URL } = getBaseUrls();

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête pour ajouter le token JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token invalide ou expiré
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== Services Auth =====
export const authService = {
  // Inscription (register)
  register: async (data: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Connexion (login)
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signin', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
  },

  // Demander la réinitialisation du mot de passe
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      '/auth/forgot-password',
      { email }
    );
    return response.data;
  },

  // Réinitialiser le mot de passe avec le token
  resetPassword: async (data: {
    token: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      '/auth/reset-password',
      data
    );
    return response.data;
  },
};

// Utilitaires d'authentification
export const authUtils = {
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
  
  getCurrentToken: (): string | null => {
    return localStorage.getItem('token');
  },
  
  clearAuth: (): void => {
    localStorage.removeItem('token');
  }
};

// Fonction pour obtenir l'ID de l'utilisateur connecté
export const getCurrentUserId = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.id || payload._id;
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error);
    return null;
  }
};

// ===== Services User =====
export const userService = {
  // Obtenir le profil de l'utilisateur connecté
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/profile');
    return response.data;
  },

  // Modifier le profil
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }): Promise<User> => {
    const response = await apiClient.put<{ message: string; user: User }>(
      '/users/profile',
      data
    );
    return response.data.user;
  },

  // Changer le mot de passe
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(
      '/users/password',
      data
    );
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<{ message: string; user: User }>(
      '/users/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.user;
  },

  // Supprimer avatar
  deleteAvatar: async (): Promise<User> => {
    const response = await apiClient.delete<{ message: string; user: User }>(
      '/users/avatar'
    );
    return response.data.user;
  },

  // Obtenir un utilisateur par ID (pour les assignations)
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  // Rechercher des utilisateurs (pour ajouter des membres)
  search: async (query: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};

// ===== Helper pour obtenir l'URL complète de l'avatar =====
export const getAvatarUrl = (avatar?: string): string | undefined => {
  if (!avatar) return undefined;
  if (avatar.startsWith('http')) return avatar;

  return `${STATIC_URL}${avatar}`;
};

// ===== Services Project =====
export const projectService = {
  // Créer un projet
  create: async (data: {
    name: string;
    description?: string;
    status?: string;
  }): Promise<{ message: string; project: Project }> => {
    const response = await apiClient.post<{ message: string; project: Project }>(
      '/projects',
      data
    );
    return response.data;
  },

  // Lister tous les projets
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects');
    return response.data;
  },

  // Obtenir un projet par ID
  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  // Modifier un projet
  update: async (
    id: string,
    data: Partial<Project>
  ): Promise<{ message: string; project: Project }> => {
    const response = await apiClient.put<{ message: string; project: Project }>(
      `/projects/${id}`,
      data
    );
    return response.data;
  },

  // Supprimer un projet
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/projects/${id}`);
    return response.data;
  },

  // Ajouter des membres
  addMembers: async (
    id: string,
    data: { admins?: string[]; team?: string[] }
  ): Promise<{ message: string; project: Project }> => {
    const response = await apiClient.post<{ message: string; project: Project }>(
      `/projects/${id}/members`,
      data
    );
    return response.data;
  },
};

// ===== Services Ticket =====
export const ticketService = {
  // Créer un ticket
  create: async (data: {
    title: string;
    description?: string;
    status?: string;
    estimationDate: string;
    projectId: string;
    assignedTo?: string[];
  }): Promise<{ message: string; ticket: Ticket }> => {
    const response = await apiClient.post<{ message: string; ticket: Ticket }>(
      '/tickets',
      data
    );
    return response.data;
  },

  // Lister les tickets d'un projet
  getByProject: async (projectId: string): Promise<Ticket[]> => {
    const response = await apiClient.get<Ticket[]>(`/tickets/project/${projectId}`);
    return response.data;
  },

  // Obtenir un ticket par ID
  getById: async (id: string): Promise<Ticket> => {
    const response = await apiClient.get<Ticket>(`/tickets/${id}`);
    return response.data;
  },

  // Modifier un ticket
  update: async (
    id: string,
    data: Partial<Ticket>
  ): Promise<{ message: string; ticket: Ticket }> => {
    const response = await apiClient.put<{ message: string; ticket: Ticket }>(
      `/tickets/${id}`,
      data
    );
    return response.data;
  },

  // Supprimer un ticket
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/tickets/${id}`);
    return response.data;
  },

  // Assigner un utilisateur à un ticket
  assign: async (ticketId: string, userId: string): Promise<Ticket> => {
    const response = await apiClient.post<{ ticket: Ticket }>(
      `/tickets/${ticketId}/assign`,
      { userId }
    );
    return response.data.ticket;
  },

  // Retirer l'assignation d'un utilisateur
  unassign: async (ticketId: string, userId: string): Promise<Ticket> => {
    const response = await apiClient.delete<{ ticket: Ticket }>(
      `/tickets/${ticketId}/assign/${userId}`
    );
    return response.data.ticket;
  },

  // Assigner plusieurs utilisateurs (remplacer tous)
  assignMultiple: async (ticketId: string, userIds: string[]): Promise<Ticket> => {
    const response = await apiClient.put<{ ticket: Ticket }>(
      `/tickets/${ticketId}/assign`,
      { assignedTo: userIds }
    );
    return response.data.ticket;
  },
};

// ===== Services Comment =====
export const commentService = {
  // Créer un commentaire
  create: async (data: {
    content: string;
    ticketId: string;
  }): Promise<Comment> => {
    const response = await apiClient.post<{ message: string; comment: Comment }>(
      '/comments',
      data
    );
    return response.data.comment;
  },

  // Lister les commentaires d'un ticket
  getByTicket: async (ticketId: string): Promise<Comment[]> => {
    const response = await apiClient.get<Comment[]>(`/comments/ticket/${ticketId}`);
    return response.data;
  },

  // Obtenir un commentaire par ID
  getById: async (id: string): Promise<Comment> => {
    const response = await apiClient.get<Comment>(`/comments/${id}`);
    return response.data;
  },

  // Modifier un commentaire
  update: async (
    id: string,
    data: { content: string }
  ): Promise<Comment> => {
    const response = await apiClient.put<{ message: string; comment: Comment }>(
      `/comments/${id}`,
      data
    );
    return response.data.comment;
  },

  // Supprimer un commentaire
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/comments/${id}`);
    return response.data;
  },

  // Compter les commentaires d'un ticket
  countByTicket: async (ticketId: string): Promise<number> => {
    const response = await apiClient.get<{ count: number }>(
      `/comments/ticket/${ticketId}/count`
    );
    return response.data.count;
  },
};

export default apiClient;
