// src/utils/api.tsx
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Types pour les données
// Dans api.tsx
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  avatar?: string; // Optionnel
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

// Configuration de l'instance Axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
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
      window.location.href = '/login'; // Rediriger vers la page de connexion
    }
    return Promise.reject(error);
  }
);

// ===== Services Auth =====
export const authService = {
  // Inscription
  signup: async (data: {
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

  // Connexion
  signin: async (data: { email: string; password: string }): Promise<AuthResponse> => {
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
};

// ===== Services User =====
export const userService = {
  // Obtenir le profil
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/profile');
    return response.data;
  },

  // Modifier le profil
  updateProfile: async (data: Partial<User>): Promise<{ message: string; user: User }> => {
    const response = await apiClient.put<{ message: string; user: User }>(
      '/users/profile',
      data
    );
    return response.data;
  },
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
};

// ===== Services Comment =====
export const commentService = {
  // Créer un commentaire
  create: async (data: {
    content: string;
    ticketId: string;
  }): Promise<{ message: string; comment: Comment }> => {
    const response = await apiClient.post<{ message: string; comment: Comment }>(
      '/comments',
      data
    );
    return response.data;
  },

  // Lister les commentaires d'un ticket
  getByTicket: async (ticketId: string): Promise<Comment[]> => {
    const response = await apiClient.get<Comment[]>(`/comments/ticket/${ticketId}`);
    return response.data;
  },

  // Modifier un commentaire
  update: async (
    id: string,
    data: { content: string }
  ): Promise<{ message: string; comment: Comment }> => {
    const response = await apiClient.put<{ message: string; comment: Comment }>(
      `/comments/${id}`,
      data
    );
    return response.data;
  },

  // Supprimer un commentaire
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/comments/${id}`);
    return response.data;
  },
};

export default apiClient;