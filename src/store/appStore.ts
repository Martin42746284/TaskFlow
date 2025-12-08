import { create } from 'zustand';
import { Project, Ticket, Comment, User, ProjectStatus, TicketStatus, UserRole } from '@/types';

// Mock current user
const currentUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
};

// Mock users for demo
const mockUsers: User[] = [
  currentUser,
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
];

interface AppState {
  currentUser: User;
  users: User[];
  projects: Project[];
  tickets: Ticket[];
  comments: Comment[];
  
  // Project actions
  addProject: (name: string, description: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addProjectMember: (projectId: string, userId: string, role: UserRole) => void;
  removeProjectMember: (projectId: string, userId: string) => void;
  updateMemberRole: (projectId: string, userId: string, role: UserRole) => void;
  canManageMembers: (projectId: string) => boolean;
  
  // Ticket actions
  addTicket: (projectId: string, name: string, description: string, estimationDate: Date) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  assignTicket: (ticketId: string, userId: string) => void;
  unassignTicket: (ticketId: string, userId: string) => void;
  
  // Comment actions
  addComment: (ticketId: string, content: string) => void;
  updateComment: (id: string, content: string) => void;
  deleteComment: (id: string) => void;
  
  // Helpers
  getProjectById: (id: string) => Project | undefined;
  getTicketsByProject: (projectId: string) => Ticket[];
  getCommentsByTicket: (ticketId: string) => Comment[];
  getUserRole: (projectId: string, userId: string) => UserRole | null;
  canDeleteProject: (projectId: string) => boolean;
  canDeleteTicket: (ticketId: string) => boolean;
  canManageComment: (commentId: string) => boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser,
  users: mockUsers,
  projects: [
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design',
      status: 'active',
      createdBy: '1',
      createdAt: new Date('2024-01-15'),
      members: [
        { userId: '1', user: mockUsers[0], role: 'owner' },
        { userId: '2', user: mockUsers[1], role: 'admin' },
        { userId: '3', user: mockUsers[2], role: 'team' },
      ],
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Build a cross-platform mobile application',
      status: 'active',
      createdBy: '1',
      createdAt: new Date('2024-02-01'),
      members: [
        { userId: '1', user: mockUsers[0], role: 'owner' },
        { userId: '4', user: mockUsers[3], role: 'team' },
      ],
    },
    {
      id: '3',
      name: 'Legacy System Migration',
      description: 'Migrate old systems to cloud infrastructure',
      status: 'inactive',
      createdBy: '1',
      createdAt: new Date('2023-11-20'),
      members: [
        { userId: '1', user: mockUsers[0], role: 'owner' },
      ],
    },
  ],
  tickets: [
    {
      id: 't1',
      projectId: '1',
      name: 'Design homepage mockup',
      description: 'Create initial design mockups for the new homepage',
      status: 'done',
      estimationDate: new Date('2024-03-15'),
      createdBy: '1',
      createdAt: new Date('2024-02-10'),
      assignees: [mockUsers[0], mockUsers[1]],
    },
    {
      id: 't2',
      projectId: '1',
      name: 'Implement navigation',
      description: 'Build responsive navigation component',
      status: 'in_progress',
      estimationDate: new Date('2024-03-20'),
      createdBy: '2',
      createdAt: new Date('2024-02-12'),
      assignees: [mockUsers[2]],
    },
    {
      id: 't3',
      projectId: '1',
      name: 'Setup CI/CD pipeline',
      description: 'Configure automated deployment pipeline',
      status: 'validation',
      estimationDate: new Date('2024-03-18'),
      createdBy: '1',
      createdAt: new Date('2024-02-14'),
      assignees: [mockUsers[0]],
    },
    {
      id: 't4',
      projectId: '1',
      name: 'API integration',
      description: 'Connect frontend with backend APIs',
      status: 'todo',
      estimationDate: new Date('2024-03-25'),
      createdBy: '1',
      createdAt: new Date('2024-02-15'),
      assignees: [],
    },
    {
      id: 't5',
      projectId: '2',
      name: 'Setup React Native project',
      description: 'Initialize the mobile app project structure',
      status: 'in_progress',
      estimationDate: new Date('2024-03-10'),
      createdBy: '1',
      createdAt: new Date('2024-02-05'),
      assignees: [mockUsers[3]],
    },
  ],
  comments: [
    {
      id: 'c1',
      ticketId: 't1',
      content: 'Looking great! Can we add more animations?',
      createdBy: '2',
      author: mockUsers[1],
      createdAt: new Date('2024-02-11'),
      updatedAt: new Date('2024-02-11'),
    },
    {
      id: 'c2',
      ticketId: 't1',
      content: 'Sure, I will add subtle hover effects',
      createdBy: '1',
      author: mockUsers[0],
      createdAt: new Date('2024-02-11'),
      updatedAt: new Date('2024-02-11'),
    },
  ],
  
  addProject: (name, description) => {
    const { currentUser, users } = get();
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      status: 'active',
      createdBy: currentUser.id,
      createdAt: new Date(),
      members: [{ userId: currentUser.id, user: currentUser, role: 'owner' }],
    };
    set((state) => ({ projects: [...state.projects, newProject] }));
  },
  
  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  },
  
  deleteProject: (id) => {
    const { canDeleteProject } = get();
    if (canDeleteProject(id)) {
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        tickets: state.tickets.filter((t) => t.projectId !== id),
      }));
    }
  },
  
  addProjectMember: (projectId, userId, role) => {
    const { users } = get();
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, members: [...p.members, { userId, user, role }] }
          : p
      ),
    }));
  },
  
  removeProjectMember: (projectId, userId) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, members: p.members.filter((m) => m.userId !== userId) }
          : p
      ),
    }));
  },

  updateMemberRole: (projectId, userId, role) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              members: p.members.map((m) =>
                m.userId === userId ? { ...m, role } : m
              ),
            }
          : p
      ),
    }));
  },

  canManageMembers: (projectId) => {
    const { currentUser, getUserRole } = get();
    const role = getUserRole(projectId, currentUser.id);
    return role === 'owner' || role === 'admin';
  },
  
  addTicket: (projectId, name, description, estimationDate) => {
    const { currentUser } = get();
    const newTicket: Ticket = {
      id: Date.now().toString(),
      projectId,
      name,
      description,
      status: 'todo',
      estimationDate,
      createdBy: currentUser.id,
      createdAt: new Date(),
      assignees: [],
    };
    set((state) => ({ tickets: [...state.tickets, newTicket] }));
  },
  
  updateTicket: (id, updates) => {
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },
  
  deleteTicket: (id) => {
    const { canDeleteTicket } = get();
    if (canDeleteTicket(id)) {
      set((state) => ({
        tickets: state.tickets.filter((t) => t.id !== id),
        comments: state.comments.filter((c) => c.ticketId !== id),
      }));
    }
  },
  
  assignTicket: (ticketId, userId) => {
    const { users } = get();
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId && !t.assignees.find((a) => a.id === userId)
          ? { ...t, assignees: [...t.assignees, user] }
          : t
      ),
    }));
  },
  
  unassignTicket: (ticketId, userId) => {
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? { ...t, assignees: t.assignees.filter((a) => a.id !== userId) }
          : t
      ),
    }));
  },
  
  addComment: (ticketId, content) => {
    const { currentUser } = get();
    const newComment: Comment = {
      id: Date.now().toString(),
      ticketId,
      content,
      createdBy: currentUser.id,
      author: currentUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ comments: [...state.comments, newComment] }));
  },
  
  updateComment: (id, content) => {
    const { canManageComment } = get();
    if (canManageComment(id)) {
      set((state) => ({
        comments: state.comments.map((c) =>
          c.id === id ? { ...c, content, updatedAt: new Date() } : c
        ),
      }));
    }
  },
  
  deleteComment: (id) => {
    const { canManageComment } = get();
    if (canManageComment(id)) {
      set((state) => ({
        comments: state.comments.filter((c) => c.id !== id),
      }));
    }
  },
  
  getProjectById: (id) => get().projects.find((p) => p.id === id),
  
  getTicketsByProject: (projectId) =>
    get().tickets.filter((t) => t.projectId === projectId),
  
  getCommentsByTicket: (ticketId) =>
    get().comments.filter((c) => c.ticketId === ticketId),
  
  getUserRole: (projectId, userId) => {
    const project = get().projects.find((p) => p.id === projectId);
    const member = project?.members.find((m) => m.userId === userId);
    return member?.role || null;
  },
  
  canDeleteProject: (projectId) => {
    const { currentUser, projects } = get();
    const project = projects.find((p) => p.id === projectId);
    return project?.createdBy === currentUser.id;
  },
  
  canDeleteTicket: (ticketId) => {
    const { currentUser, tickets } = get();
    const ticket = tickets.find((t) => t.id === ticketId);
    return ticket?.createdBy === currentUser.id;
  },
  
  canManageComment: (commentId) => {
    const { currentUser, comments } = get();
    const comment = comments.find((c) => c.id === commentId);
    return comment?.createdBy === currentUser.id;
  },
}));
